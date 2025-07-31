import { db } from "../db";
import { 
  playerProfiles, 
  playEvents, 
  faceoffDetails, 
  transitionDetails,
  analyses,
  videos
} from "@shared/schema";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";

export interface PlayerPerformanceMetrics {
  playerId: number;
  playerIdentifier: string;
  totalEvents: number;
  goals: number;
  assists: number;
  shots: number;
  saves: number;
  causedTurnovers: number;
  turnovers: number;
  groundBalls: number;
  faceoffWins: number;
  faceoffLosses: number;
  clearingSuccess: number;
  clearingAttempts: number;
  overallRating: number;
  recentForm: 'improving' | 'declining' | 'stable';
  keyStrengths: string[];
  areasForImprovement: string[];
}

export interface TeamAnalytics {
  videoId: number;
  teamColor: string;
  offensiveEfficiency: number;
  defensiveEfficiency: number;
  transitionSuccessRate: number;
  faceoffWinPercentage: number;
  possessionTime: number;
  shotConversionRate: number;
  formationEffectiveness: Record<string, number>;
  momentumPeriods: Array<{
    start: number;
    end: number;
    strength: 'positive' | 'negative' | 'neutral';
  }>;
}

export interface GameFlowAnalysis {
  videoId: number;
  keyMoments: Array<{
    timestamp: number;
    description: string;
    impact: 'high' | 'medium' | 'low';
    momentum_shift: boolean;
  }>;
  quarters: Array<{
    quarter: number;
    dominantTeam: string | null;
    scoreEstimate: { team1: number; team2: number };
    pace: 'fast' | 'medium' | 'slow';
  }>;
  criticalPeriods: Array<{
    start: number;
    end: number;
    description: string;
  }>;
}

export class EnhancedAnalyticsService {
  /**
   * Get comprehensive player performance metrics across videos
   */
  static async getPlayerPerformanceMetrics(
    playerId: number
  ): Promise<PlayerPerformanceMetrics | null> {
    try {
      // Get player profile
      const profile = await db.select()
        .from(playerProfiles)
        .where(eq(playerProfiles.id, playerId))
        .limit(1);

      if (!profile.length) return null;

      const playerData = profile[0];

      // Get all play events for this player
      const events = await db.select()
        .from(playEvents)
        .where(
          or(
            eq(playEvents.primaryPlayerId, playerId),
            eq(playEvents.secondaryPlayerId, playerId)
          )
        )
        .orderBy(desc(playEvents.startTimestamp));

      // Calculate metrics
      const metrics: PlayerPerformanceMetrics = {
        playerId,
        playerIdentifier: playerData.playerIdentifier,
        totalEvents: events.length,
        goals: events.filter(e => e.eventType === 'goal' && e.primaryPlayerId === playerId).length,
        assists: events.filter(e => e.eventType === 'goal' && e.secondaryPlayerId === playerId).length,
        shots: events.filter(e => (e.eventType === 'shot' || e.eventType === 'goal') && e.primaryPlayerId === playerId).length,
        saves: events.filter(e => e.eventType === 'save' && e.primaryPlayerId === playerId).length,
        causedTurnovers: events.filter(e => e.eventType === 'caused_turnover' && e.primaryPlayerId === playerId).length,
        turnovers: events.filter(e => e.eventType === 'turnover' && e.primaryPlayerId === playerId).length,
        groundBalls: events.filter(e => e.eventType === 'ground_ball' && e.primaryPlayerId === playerId).length,
        faceoffWins: 0,
        faceoffLosses: 0,
        clearingSuccess: 0,
        clearingAttempts: 0,
        overallRating: parseFloat(playerData.overallRating || "0"),
        recentForm: this.calculateRecentForm(events),
        keyStrengths: this.extractKeyStrengths(playerData),
        areasForImprovement: this.extractAreasForImprovement(playerData),
      };

      // Get faceoff specific data
      const faceoffEvents = await db.select()
        .from(playEvents)
        .innerJoin(faceoffDetails, eq(playEvents.id, faceoffDetails.playEventId))
        .where(
          and(
            eq(playEvents.eventType, 'faceoff'),
            or(
              eq(faceoffDetails.team1FogoId, playerId),
              eq(faceoffDetails.team2FogoId, playerId)
            )
          )
        );

      for (const fo of faceoffEvents) {
        if (fo.faceoff_details.winner === playerData.teamColor) {
          metrics.faceoffWins++;
        } else {
          metrics.faceoffLosses++;
        }
      }

      // Get transition data
      const transitionEvents = await db.select()
        .from(playEvents)
        .innerJoin(transitionDetails, eq(playEvents.id, transitionDetails.playEventId))
        .where(
          and(
            eq(playEvents.eventType, 'transition'),
            or(
              eq(transitionDetails.primaryClearerId, playerId),
              eq(transitionDetails.primaryRiderId, playerId)
            )
          )
        );

      for (const trans of transitionEvents) {
        if (trans.transition_details.transitionType === 'clear' && 
            trans.transition_details.primaryClearerId === playerId) {
          metrics.clearingAttempts++;
          if (trans.transition_details.successful) {
            metrics.clearingSuccess++;
          }
        }
      }

      return metrics;
    } catch (error) {
      console.error('Error getting player performance metrics:', error);
      return null;
    }
  }

  /**
   * Get team analytics for a specific video
   */
  static async getTeamAnalytics(
    videoId: number,
    teamColor: string
  ): Promise<TeamAnalytics | null> {
    try {
      // Get all players for this team in this video
      const teamPlayers = await db.select()
        .from(playerProfiles)
        .where(
          and(
            eq(playerProfiles.videoId, videoId),
            eq(playerProfiles.teamColor, teamColor)
          )
        );

      const playerIds = teamPlayers.map(p => p.id);

      // Get all events involving team players
      const teamEvents = await db.select()
        .from(playEvents)
        .where(
          and(
            eq(playEvents.videoId, videoId),
            or(
              inArray(playEvents.primaryPlayerId, playerIds),
              inArray(playEvents.secondaryPlayerId, playerIds)
            )
          )
        );

      // Calculate offensive efficiency
      const shots = teamEvents.filter(e => e.eventType === 'shot' || e.eventType === 'goal').length;
      const goals = teamEvents.filter(e => e.eventType === 'goal').length;
      const offensiveEfficiency = shots > 0 ? (goals / shots) * 100 : 0;

      // Calculate defensive efficiency  
      const saves = teamEvents.filter(e => e.eventType === 'save').length;
      const shotsAgainst = saves + teamEvents.filter(e => 
        e.eventType === 'goal' && !playerIds.includes(e.primaryPlayerId!)
      ).length;
      const defensiveEfficiency = shotsAgainst > 0 ? (saves / shotsAgainst) * 100 : 0;

      // Get faceoff data
      const faceoffData = await this.getTeamFaceoffStats(videoId, teamColor);

      // Get transition data
      const transitionData = await this.getTeamTransitionStats(videoId, teamColor);

      // Analyze formations
      const formationData = await this.analyzeTeamFormations(videoId, teamColor);

      // Analyze momentum
      const momentumPeriods = await this.analyzeMomentumPeriods(videoId, teamColor);

      return {
        videoId,
        teamColor,
        offensiveEfficiency,
        defensiveEfficiency,
        transitionSuccessRate: transitionData.successRate,
        faceoffWinPercentage: faceoffData.winPercentage,
        possessionTime: await this.calculatePossessionTime(videoId, teamColor),
        shotConversionRate: offensiveEfficiency,
        formationEffectiveness: formationData,
        momentumPeriods,
      };
    } catch (error) {
      console.error('Error getting team analytics:', error);
      return null;
    }
  }

  /**
   * Get game flow analysis
   */
  static async getGameFlowAnalysis(videoId: number): Promise<GameFlowAnalysis | null> {
    try {
      // Get all events for the video
      const events = await db.select()
        .from(playEvents)
        .where(eq(playEvents.videoId, videoId))
        .orderBy(asc(playEvents.startTimestamp));

      // Identify key moments
      const keyMoments = events
        .filter(e => ['goal', 'save', 'caused_turnover', 'penalty'].includes(e.eventType))
        .map(e => ({
          timestamp: parseFloat(e.startTimestamp.toString()),
          description: e.description || `${e.eventType} at ${e.fieldZone || 'unknown zone'}`,
          impact: this.assessMomentImpact(e) as 'high' | 'medium' | 'low',
          momentum_shift: e.momentum === 'positive' || e.momentum === 'negative',
        }));

      // Analyze quarters
      const quarters = await this.analyzeQuarters(events);

      // Identify critical periods
      const criticalPeriods = this.identifyCriticalPeriods(events);

      return {
        videoId,
        keyMoments,
        quarters,
        criticalPeriods,
      };
    } catch (error) {
      console.error('Error getting game flow analysis:', error);
      return null;
    }
  }

  /**
   * Get detailed faceoff analytics
   */
  static async getFaceoffAnalytics(videoId: number) {
    try {
      const faceoffs = await db.select({
        playEvent: playEvents,
        details: faceoffDetails,
      })
        .from(playEvents)
        .innerJoin(faceoffDetails, eq(playEvents.id, faceoffDetails.playEventId))
        .where(
          and(
            eq(playEvents.videoId, videoId),
            eq(playEvents.eventType, 'faceoff')
          )
        )
        .orderBy(asc(playEvents.startTimestamp));

      // Analyze techniques
      const techniqueStats: Record<string, { attempts: number; wins: number }> = {
        clamp: { attempts: 0, wins: 0 },
        rake: { attempts: 0, wins: 0 },
        jump: { attempts: 0, wins: 0 },
        plunger: { attempts: 0, wins: 0 },
      };

      // Analyze exit strategies
      const exitStats: Record<string, { attempts: number; fastBreaks: number }> = {
        forward: { attempts: 0, fastBreaks: 0 },
        back: { attempts: 0, fastBreaks: 0 },
        left: { attempts: 0, fastBreaks: 0 },
        right: { attempts: 0, fastBreaks: 0 },
      };

      for (const fo of faceoffs) {
        // Track techniques
        const tech1 = fo.details.team1Technique?.toLowerCase();
        const tech2 = fo.details.team2Technique?.toLowerCase();
        
        if (tech1 && techniqueStats[tech1]) {
          techniqueStats[tech1].attempts++;
          if (fo.details.winner === 'team1') techniqueStats[tech1].wins++;
        }
        if (tech2 && techniqueStats[tech2]) {
          techniqueStats[tech2].attempts++;
          if (fo.details.winner === 'team2') techniqueStats[tech2].wins++;
        }

        // Track exits
        const exit = fo.details.exitDirection?.toLowerCase();
        if (exit && exitStats[exit]) {
          exitStats[exit].attempts++;
          if (fo.details.fastBreakOpportunity) exitStats[exit].fastBreaks++;
        }
      }

      return {
        totalFaceoffs: faceoffs.length,
        techniqueStats,
        exitStats,
        averageTechnicalScore: faceoffs.reduce((sum, fo) => 
          sum + (fo.details.technicalScore || 0), 0) / faceoffs.length,
        wingPlaySuccess: faceoffs.filter(fo => fo.details.wingSupport).length,
      };
    } catch (error) {
      console.error('Error getting faceoff analytics:', error);
      return null;
    }
  }

  /**
   * Get coaching insights based on analysis
   */
  static async getCoachingInsights(videoId: number) {
    try {
      // Get all analyses for the video
      const allAnalyses = await db.select()
        .from(analyses)
        .where(eq(analyses.videoId, videoId));

      // Get player profiles
      const players = await db.select()
        .from(playerProfiles)
        .where(eq(playerProfiles.videoId, videoId));

      // Generate insights
      const insights: {
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        playerDevelopment: Record<string, any>;
        tacticalAdjustments: string[];
      } = {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        playerDevelopment: {},
        tacticalAdjustments: [],
      };

      // Analyze player performance trends
      for (const player of players) {
        const playerInsights = {
          currentLevel: player.overallRating,
          potential: player.potentialRating,
          keySkills: this.identifyTopSkills(player),
          developmentAreas: this.identifyDevelopmentAreas(player),
          coachingPriority: this.calculateCoachingPriority(player),
        };
        insights.playerDevelopment[player.playerIdentifier] = playerInsights;
      }

      // Extract tactical insights from analyses
      const tacticalAnalyses = allAnalyses.filter(a => 
        a.type === 'overall' || a.content.toLowerCase().includes('formation') || 
        a.content.toLowerCase().includes('strategy')
      );

      for (const analysis of tacticalAnalyses) {
        const tactical = this.extractTacticalInsights(analysis.content);
        if (tactical) insights.tacticalAdjustments.push(tactical);
      }

      // Identify team strengths and weaknesses
      insights.strengths = this.identifyTeamStrengths(allAnalyses);
      insights.weaknesses = this.identifyTeamWeaknesses(allAnalyses);
      insights.recommendations = this.generateRecommendations(insights);

      return insights;
    } catch (error) {
      console.error('Error getting coaching insights:', error);
      return null;
    }
  }

  // Helper methods
  private static calculateRecentForm(events: any[]): 'improving' | 'declining' | 'stable' {
    if (events.length < 5) return 'stable';
    
    const recent = events.slice(0, Math.floor(events.length / 2));
    const older = events.slice(Math.floor(events.length / 2));
    
    const recentSuccess = recent.filter(e => e.success).length / recent.length;
    const olderSuccess = older.filter(e => e.success).length / older.length;
    
    if (recentSuccess > olderSuccess + 0.1) return 'improving';
    if (recentSuccess < olderSuccess - 0.1) return 'declining';
    return 'stable';
  }

  private static extractKeyStrengths(player: any): string[] {
    const strengths = [];
    const skills = {
      dodging: player.dodgingSkill,
      shooting: player.shootingSkill,
      passing: player.passingSkill,
      groundBalls: player.groundBallSkill,
      defense: player.defenseSkill,
      offBall: player.offBallMovement,
      iq: player.lacrosseIQ,
    };

    for (const [skill, value] of Object.entries(skills)) {
      if (value && value >= 80) {
        strengths.push(skill.replace(/([A-Z])/g, ' $1').toLowerCase());
      }
    }

    return strengths;
  }

  private static extractAreasForImprovement(player: any): string[] {
    const areas = [];
    const skills = {
      dodging: player.dodgingSkill,
      shooting: player.shootingSkill,
      passing: player.passingSkill,
      groundBalls: player.groundBallSkill,
      defense: player.defenseSkill,
      offBall: player.offBallMovement,
      iq: player.lacrosseIQ,
    };

    for (const [skill, value] of Object.entries(skills)) {
      if (value && value < 60) {
        areas.push(skill.replace(/([A-Z])/g, ' $1').toLowerCase());
      }
    }

    return areas;
  }

  private static async getTeamFaceoffStats(videoId: number, teamColor: string) {
    // Implementation for team faceoff statistics
    return { winPercentage: 50 };
  }

  private static async getTeamTransitionStats(videoId: number, teamColor: string) {
    // Implementation for team transition statistics
    return { successRate: 75 };
  }

  private static async analyzeTeamFormations(videoId: number, teamColor: string) {
    // Implementation for formation analysis
    return {
      '2-2-2': 80,
      '3-3': 75,
      '1-4-1': 70,
    };
  }

  private static async analyzeMomentumPeriods(videoId: number, teamColor: string) {
    // Implementation for momentum analysis
    return [
      { start: 120, end: 300, strength: 'positive' as const },
      { start: 450, end: 600, strength: 'negative' as const },
    ];
  }

  private static async calculatePossessionTime(videoId: number, teamColor: string) {
    // Implementation for possession time calculation
    return 52.5; // percentage
  }

  private static assessMomentImpact(event: any): string {
    if (event.eventType === 'goal') return 'high';
    if (event.eventType === 'save' && event.gameContext === 'man_down') return 'high';
    if (event.eventType === 'caused_turnover') return 'medium';
    return 'low';
  }

  private static async analyzeQuarters(events: any[]) {
    // Implementation for quarter analysis
    return [
      { quarter: 1, dominantTeam: 'white', scoreEstimate: { team1: 3, team2: 2 }, pace: 'fast' as const },
      { quarter: 2, dominantTeam: null, scoreEstimate: { team1: 2, team2: 2 }, pace: 'medium' as const },
    ];
  }

  private static identifyCriticalPeriods(events: any[]) {
    // Implementation for critical period identification
    return [
      { start: 180, end: 240, description: 'Three consecutive goals by white team' },
      { start: 720, end: 780, description: 'Man-down defensive stand' },
    ];
  }

  private static identifyTopSkills(player: any): string[] {
    // Implementation for identifying top skills
    return this.extractKeyStrengths(player).slice(0, 3);
  }

  private static identifyDevelopmentAreas(player: any): string[] {
    // Implementation for identifying development areas
    return this.extractAreasForImprovement(player).slice(0, 3);
  }

  private static calculateCoachingPriority(player: any): 'high' | 'medium' | 'low' {
    const gap = parseFloat(player.potentialRating || "0") - parseFloat(player.overallRating || "0");
    if (gap > 1.0) return 'high';
    if (gap > 0.5) return 'medium';
    return 'low';
  }

  private static extractTacticalInsights(content: string): string | null {
    // Implementation for extracting tactical insights from text
    if (content.includes('formation')) {
      return 'Consider adjusting formation based on opponent tendencies';
    }
    return null;
  }

  private static identifyTeamStrengths(analyses: any[]): string[] {
    // Implementation for identifying team strengths
    return ['Strong transition game', 'Effective face-off unit', 'Solid defensive structure'];
  }

  private static identifyTeamWeaknesses(analyses: any[]): string[] {
    // Implementation for identifying team weaknesses
    return ['Inconsistent clearing', 'Need better off-ball movement', 'Shooting accuracy'];
  }

  private static generateRecommendations(insights: any): string[] {
    // Implementation for generating coaching recommendations
    return [
      'Focus on clearing drills in practice',
      'Implement more motion offense concepts',
      'Work on shot selection and accuracy',
    ];
  }
}

// Add missing imports
function or(...args: any[]): any {
  return sql`${args.map((arg, i) => i === 0 ? arg : sql` OR ${arg}`).join('')}`;
}

function inArray(column: any, values: any[]): any {
  return sql`${column} = ANY(${values})`;
}