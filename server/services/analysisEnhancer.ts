// Enhanced Analysis Service for Detailed Play Tracking
// This service processes the AI analysis and extracts structured data for:
// - Goals and assists tracking
// - Face-off win/loss statistics
// - Transition success rates
// - Player performance metrics

import { db } from "../db";
import { analyses } from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface PlayStatistics {
  goals: number;
  assists: number;
  hockeyAssists: number;
  ballTouches: number;
  turnovers: number;
  causedTurnovers: number;
  groundBalls: number;
  shots: number;
  saves: number;
  faceOffWins: number;
  faceOffTotal: number;
  transitionSuccess: number;
  transitionTotal: number;
  checks: number;
  penalties: number;
  clears: number;
  clearSuccess: number;
}

export interface DetailedPlay {
  type: 'goal' | 'assist' | 'hockey_assist' | 'faceoff' | 'transition' | 'turnover' | 'caused_turnover' | 'save' | 'shot' | 'ground_ball' | 'check' | 'penalty' | 'clear' | 'ball_touch';
  timestamp: number;
  playerNumber?: string;
  teamColor?: string;
  success: boolean;
  description: string;
  confidence: number;
}

export class AnalysisEnhancer {
  // Extract structured play data from analysis metadata
  static extractPlaysFromAnalysis(analysis: any): DetailedPlay[] {
    const plays: DetailedPlay[] = [];
    
    // Check if metadata contains play information
    if (analysis.metadata) {
      const metadata = typeof analysis.metadata === 'string' 
        ? JSON.parse(analysis.metadata) 
        : analysis.metadata;
      
      // Extract based on analysis type
      switch (analysis.type) {
        case 'face_off':
          if (metadata.winProbability !== undefined) {
            plays.push({
              type: 'faceoff',
              timestamp: analysis.timestamp,
              success: metadata.winProbability > 0.5,
              description: analysis.content,
              confidence: analysis.confidence || 90,
              teamColor: this.extractTeamColorFromContent(analysis.content)
            });
          }
          break;
          
        case 'transition':
          if (metadata.successProbability !== undefined) {
            plays.push({
              type: 'transition',
              timestamp: analysis.timestamp,
              success: metadata.successProbability > 0.5,
              description: analysis.content,
              confidence: analysis.confidence || 90,
              teamColor: this.extractTeamColorFromContent(analysis.content)
            });
          }
          break;
          
        case 'key_moment':
          // Parse key moments for goals, assists, saves
          const playType = this.identifyPlayTypeFromContent(analysis.content);
          if (playType) {
            plays.push({
              type: playType,
              timestamp: analysis.timestamp,
              playerNumber: this.extractPlayerNumberFromContent(analysis.content),
              teamColor: this.extractTeamColorFromContent(analysis.content),
              success: true,
              description: analysis.content,
              confidence: analysis.confidence || 90
            });
          }
          break;
      }
    }
    
    return plays;
  }
  
  // Extract team color from analysis content
  static extractTeamColorFromContent(content: string): string | undefined {
    const colorPattern = /(white|red|blue|black|yellow|green|orange|purple)\s+team/i;
    const match = content.match(colorPattern);
    return match ? match[1].toLowerCase() : undefined;
  }
  
  // Extract player number from analysis content
  static extractPlayerNumberFromContent(content: string): string | undefined {
    const numberPattern = /#(\d+)/;
    const match = content.match(numberPattern);
    return match ? match[1] : undefined;
  }
  
  // Extract all play types from content (can have multiple per analysis)
  static extractAllPlayTypesFromContent(content: string): Array<{type: DetailedPlay['type'], success: boolean}> {
    const lowerContent = content.toLowerCase();
    const plays: Array<{type: DetailedPlay['type'], success: boolean}> = [];
    
    // Goals
    if (lowerContent.includes('goal') || lowerContent.includes('scores') || lowerContent.includes('finished') || lowerContent.includes('nets')) {
      plays.push({type: 'goal', success: true});
    }
    
    // Assists (direct)
    if (lowerContent.includes('assist') || lowerContent.includes('feed') || lowerContent.includes('pass for') || lowerContent.includes('sets up')) {
      plays.push({type: 'assist', success: true});
    }
    
    // Hockey assists (secondary assists)
    if (lowerContent.includes('hockey assist') || lowerContent.includes('secondary assist') || lowerContent.includes('pass before the assist')) {
      plays.push({type: 'hockey_assist', success: true});
    }
    
    // Saves
    if (lowerContent.includes('save') || lowerContent.includes('stops') || lowerContent.includes('denied') || lowerContent.includes('keeper')) {
      plays.push({type: 'save', success: true});
    }
    
    // Shots (look for both successful and unsuccessful)
    if (lowerContent.includes('shot') || lowerContent.includes('fires') || lowerContent.includes('rips') || lowerContent.includes('attempts')) {
      const successful = !lowerContent.includes('missed') && !lowerContent.includes('wide') && !lowerContent.includes('saved');
      plays.push({type: 'shot', success: successful});
    }
    
    // Turnovers
    if (lowerContent.includes('turnover') || lowerContent.includes('loses possession') || lowerContent.includes('stripped') || lowerContent.includes('dropped')) {
      plays.push({type: 'turnover', success: false});
    }
    
    // Caused turnovers
    if (lowerContent.includes('caused turnover') || lowerContent.includes('forces turnover') || lowerContent.includes('strips') || lowerContent.includes('poke check')) {
      plays.push({type: 'caused_turnover', success: true});
    }
    
    // Ground balls
    if (lowerContent.includes('ground ball') || lowerContent.includes('scoops') || lowerContent.includes('picks up') || lowerContent.includes('gb')) {
      plays.push({type: 'ground_ball', success: true});
    }
    
    // Checks
    if (lowerContent.includes('check') || lowerContent.includes('body check') || lowerContent.includes('stick check') || lowerContent.includes('defensive play')) {
      plays.push({type: 'check', success: true});
    }
    
    // Penalties
    if (lowerContent.includes('penalty') || lowerContent.includes('foul') || lowerContent.includes('flag') || lowerContent.includes('illegal')) {
      plays.push({type: 'penalty', success: false});
    }
    
    // Clears
    if (lowerContent.includes('clear') || lowerContent.includes('clearing') || lowerContent.includes('outlet') || lowerContent.includes('brings it out')) {
      const successful = !lowerContent.includes('failed clear') && !lowerContent.includes('turnover');
      plays.push({type: 'clear', success: successful});
    }
    
    // Ball touches (general possession) - count every possession mention
    const touchWords = ['touches', 'possesses', 'handles', 'cradles', 'carries', 'controls', 'maintains possession'];
    let touchCount = 0;
    for (const word of touchWords) {
      const matches = lowerContent.match(new RegExp(word, 'g'));
      if (matches) touchCount += matches.length;
    }
    
    for (let i = 0; i < touchCount; i++) {
      plays.push({type: 'ball_touch', success: true});
    }
    
    return plays;
  }

  // Legacy function for backward compatibility
  static identifyPlayTypeFromContent(content: string): DetailedPlay['type'] | undefined {
    const lowerContent = content.toLowerCase();
    
    // Goals
    if (lowerContent.includes('goal') || lowerContent.includes('scores') || lowerContent.includes('finished') || lowerContent.includes('nets')) {
      return 'goal';
    }
    
    // Assists (direct)
    if (lowerContent.includes('assist') || lowerContent.includes('feed') || lowerContent.includes('pass for') || lowerContent.includes('sets up')) {
      return 'assist';
    }
    
    // Hockey assists (secondary assists)
    if (lowerContent.includes('hockey assist') || lowerContent.includes('secondary assist') || lowerContent.includes('pass before the assist')) {
      return 'hockey_assist';
    }
    
    // Saves
    if (lowerContent.includes('save') || lowerContent.includes('stops') || lowerContent.includes('denied') || lowerContent.includes('keeper')) {
      return 'save';
    }
    
    // Shots
    if (lowerContent.includes('shot') || lowerContent.includes('fires') || lowerContent.includes('rips') || lowerContent.includes('attempts')) {
      return 'shot';
    }
    
    // Turnovers
    if (lowerContent.includes('turnover') || lowerContent.includes('loses possession') || lowerContent.includes('stripped') || lowerContent.includes('dropped')) {
      return 'turnover';
    }
    
    // Caused turnovers
    if (lowerContent.includes('caused turnover') || lowerContent.includes('forces turnover') || lowerContent.includes('strips') || lowerContent.includes('poke check')) {
      return 'caused_turnover';
    }
    
    // Ground balls
    if (lowerContent.includes('ground ball') || lowerContent.includes('scoops') || lowerContent.includes('picks up') || lowerContent.includes('gb')) {
      return 'ground_ball';
    }
    
    // Checks
    if (lowerContent.includes('check') || lowerContent.includes('body check') || lowerContent.includes('stick check') || lowerContent.includes('defensive play')) {
      return 'check';
    }
    
    // Penalties
    if (lowerContent.includes('penalty') || lowerContent.includes('foul') || lowerContent.includes('flag') || lowerContent.includes('illegal')) {
      return 'penalty';
    }
    
    // Clears
    if (lowerContent.includes('clear') || lowerContent.includes('clearing') || lowerContent.includes('outlet') || lowerContent.includes('brings it out')) {
      return 'clear';
    }
    
    // Ball touches (general possession)
    if (lowerContent.includes('touches') || lowerContent.includes('possesses') || lowerContent.includes('handles') || lowerContent.includes('cradles')) {
      return 'ball_touch';
    }
    
    return undefined;
  }
  
  // Get play statistics for a video
  static async getVideoPlayStatistics(videoId: number): Promise<PlayStatistics> {
    const videoAnalyses = await db.select().from(analyses).where(eq(analyses.videoId, videoId));
    
    const stats: PlayStatistics = {
      goals: 0,
      assists: 0,
      hockeyAssists: 0,
      ballTouches: 0,
      turnovers: 0,
      causedTurnovers: 0,
      groundBalls: 0,
      shots: 0,
      saves: 0,
      faceOffWins: 0,
      faceOffTotal: 0,
      transitionSuccess: 0,
      transitionTotal: 0,
      checks: 0,
      penalties: 0,
      clears: 0,
      clearSuccess: 0
    };
    
    // Process all analyses for this video
    for (const analysis of videoAnalyses) {
      const plays = this.extractPlaysFromAnalysis(analysis);
      
      for (const play of plays) {
        switch (play.type) {
          case 'goal':
            stats.goals++;
            break;
          case 'assist':
            stats.assists++;
            break;
          case 'hockey_assist':
            stats.hockeyAssists++;
            break;
          case 'shot':
            stats.shots++;
            break;
          case 'save':
            stats.saves++;
            break;
          case 'turnover':
            stats.turnovers++;
            break;
          case 'caused_turnover':
            stats.causedTurnovers++;
            break;
          case 'ground_ball':
            stats.groundBalls++;
            break;
          case 'check':
            stats.checks++;
            break;
          case 'penalty':
            stats.penalties++;
            break;
          case 'clear':
            stats.clears++;
            if (play.success) stats.clearSuccess++;
            break;
          case 'ball_touch':
            stats.ballTouches++;
            break;
          case 'faceoff':
            stats.faceOffTotal++;
            if (play.success) stats.faceOffWins++;
            break;
          case 'transition':
            stats.transitionTotal++;
            if (play.success) stats.transitionSuccess++;
            break;
        }
      }
    }
    
    return stats;
  }
  
  // Get detailed play-by-play for a video
  static async getVideoPlayByPlay(videoId: number): Promise<DetailedPlay[]> {
    const videoAnalyses = await db.select()
      .from(analyses)
      .where(eq(analyses.videoId, videoId))
      .orderBy(analyses.timestamp);
    
    const allPlays: DetailedPlay[] = [];
    
    for (const analysis of videoAnalyses) {
      const plays = this.extractPlaysFromAnalysis(analysis);
      allPlays.push(...plays);
    }
    
    // Sort by timestamp
    return allPlays.sort((a, b) => a.timestamp - b.timestamp);
  }
}