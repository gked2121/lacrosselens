import { db } from "../db";
import { 
  analyses, 
  playerProfiles, 
  playEvents, 
  faceoffDetails, 
  transitionDetails,
  type InsertAnalysis,
  type PlayerProfile,
  type PlayEvent
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface EnhancedAnalysisData {
  baseAnalysis: InsertAnalysis;
  playerProfiles?: Partial<PlayerProfile>[];
  playEvents?: Partial<PlayEvent>[];
  faceoffDetails?: any[];
  transitionDetails?: any[];
}

type SkillRatings = {
  dodging: number;
  shooting: number;
  passing: number;
  groundBalls: number;
  defense: number;
  offBall: number;
  iq: number;
  athleticism: number;
};

interface ExtractedPlayerInfo {
  identifier: string | null;
  jerseyNumber: string | null;
  teamColor: string | null;
  position: string | null;
}

export class EnhancedAnalysisProcessor {
  private static toDecimalString(value: unknown, fallback = 0): string {
    const numeric = typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number.parseFloat(value)
      : fallback;

    const safeValue = Number.isFinite(numeric) ? numeric : fallback;
    return safeValue.toFixed(2);
  }

  private static toOptionalDecimalString(value: unknown): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const numeric = typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number.parseFloat(value)
      : NaN;

    return Number.isFinite(numeric) ? numeric.toFixed(2) : null;
  }
  /**
   * Process and store enhanced analysis data with detailed categorization
   */
  static async processAndStoreAnalysis(
    videoId: number,
    analysisType: string,
    content: string,
    metadata: any,
    timestamp?: number,
    confidence?: number
  ): Promise<void> {
    try {
      // Enhanced metadata structure based on analysis type
      const enhancedMetadata = this.enhanceMetadata(analysisType, metadata, content);
      
      // Extract player identifiers from content
      const playerIdentifiers = this.extractPlayerIdentifiers(content);
      
      // Generate tags for searchability
      const tags = this.generateTags(analysisType, content, metadata);
      
      // Store the base analysis with enhanced data
      const [analysis] = await db.insert(analyses).values({
        videoId,
        type: analysisType,
        subtype: enhancedMetadata.subtype,
        title: this.generateTitle(analysisType, content, metadata),
        content,
        timestamp: timestamp ? Math.round(timestamp) : null,
        endTimestamp: enhancedMetadata.endTimestamp,
        confidence: confidence || 85,
        metadata: enhancedMetadata,
        playerIdentifiers,
        tags,
      }).returning();

      // Process type-specific detailed data
      switch (analysisType) {
        case 'player_evaluation':
          await this.processPlayerEvaluation(videoId, analysis.id, content, metadata, timestamp);
          break;
        case 'face_off':
          await this.processFaceoffAnalysis(videoId, analysis.id, content, metadata, timestamp);
          break;
        case 'transition':
          await this.processTransitionAnalysis(videoId, analysis.id, content, metadata, timestamp);
          break;
        case 'key_moment':
          await this.processKeyMoment(videoId, analysis.id, content, metadata, timestamp);
          break;
      }
    } catch (error) {
      console.error('Error processing enhanced analysis:', error);
      throw error;
    }
  }

  /**
   * Extract player identifiers from analysis content
   */
  private static extractPlayerIdentifiers(content: string): string[] {
    const identifiers = new Set<string>();
    
    // Pattern for jersey numbers with team colors
    const jerseyPatterns = [
      /#(\d{1,2})\s+(white|dark|blue|red|green|yellow|orange|black|navy|maroon)/gi,
      /(white|dark|blue|red|green|yellow|orange|black|navy|maroon)\s+#(\d{1,2})/gi,
      /player\s+#(\d{1,2})/gi,
      /number\s+(\d{1,2})/gi,
    ];
    
    // Pattern for positions with numbers
    const positionPatterns = [
      /(attackman|midfielder|defenseman|goalie|fogo|lsm)\s+#(\d{1,2})/gi,
      /#(\d{1,2})\s+(attackman|midfielder|defenseman|goalie|fogo|lsm)/gi,
    ];
    
    jerseyPatterns.forEach(pattern => {
      Array.from(content.matchAll(pattern)).forEach(match => {
        if (match[1] && match[2]) {
          identifiers.add(`#${match[1]} ${match[2]}`);
        } else if (match[2] && match[1]) {
          identifiers.add(`#${match[2]} ${match[1]}`);
        }
      });
    });

    positionPatterns.forEach(pattern => {
      Array.from(content.matchAll(pattern)).forEach(match => {
        const position = match[1] || match[2];
        const number = match[2] || match[1];
        if (position && number) {
          identifiers.add(`#${number} ${position}`);
        }
      });
    });

    return Array.from(identifiers);
  }

  /**
   * Process player evaluation and create/update player profiles
   */
  private static async processPlayerEvaluation(
    videoId: number,
    analysisId: number,
    content: string,
    metadata: any,
    timestamp?: number
  ): Promise<void> {
    // Extract player info
    const playerInfo = this.extractPlayerInfo(content, metadata);
    if (!playerInfo.identifier) return;

    // Check if player profile exists
    const existingProfile = await db.select()
      .from(playerProfiles)
      .where(and(
        eq(playerProfiles.videoId, videoId),
        eq(playerProfiles.playerIdentifier, playerInfo.identifier)
      ))
      .limit(1);

    // Extract skill ratings from content
    const skills = this.extractSkillRatings(content);
    
    if (existingProfile.length === 0) {
      // Create new player profile
      const [profile] = await db.insert(playerProfiles).values({
        videoId,
        playerIdentifier: playerInfo.identifier,
        jerseyNumber: playerInfo.jerseyNumber,
        teamColor: playerInfo.teamColor,
        position: playerInfo.position,
        handedness: this.detectHandedness(content),
        estimatedHeight: this.estimateHeight(content),
        athleticism: skills.athleticism,
        overallRating: this.calculateOverallRating(skills),
        potentialRating: this.calculatePotentialRating(content, skills),
        coachabilityScore: this.extractCoachability(content),
        dodgingSkill: skills.dodging,
        shootingSkill: skills.shooting,
        passingSkill: skills.passing,
        groundBallSkill: skills.groundBalls,
        defenseSkill: skills.defense,
        offBallMovement: skills.offBall,
        lacrosseIQ: skills.iq,
      }).returning();

      // Create evaluation event
      await this.createPlayerEvaluationEvent(videoId, analysisId, profile.id, timestamp);
    } else {
      // Update existing profile with new data (average the scores)
      const existing = existingProfile[0];
      await db.update(playerProfiles)
        .set({
          // Average the skill ratings with existing
          dodgingSkill: this.averageSkill(existing.dodgingSkill, skills.dodging),
          shootingSkill: this.averageSkill(existing.shootingSkill, skills.shooting),
          passingSkill: this.averageSkill(existing.passingSkill, skills.passing),
          groundBallSkill: this.averageSkill(existing.groundBallSkill, skills.groundBalls),
          defenseSkill: this.averageSkill(existing.defenseSkill, skills.defense),
          offBallMovement: this.averageSkill(existing.offBallMovement, skills.offBall),
          lacrosseIQ: this.averageSkill(existing.lacrosseIQ, skills.iq),
          updatedAt: new Date(),
        })
        .where(eq(playerProfiles.id, existing.id));
    }
  }

  /**
   * Process face-off analysis and create detailed face-off records
   */
  private static async processFaceoffAnalysis(
    videoId: number,
    analysisId: number,
    content: string,
    metadata: any,
    timestamp?: number
  ): Promise<void> {
    // Create play event for face-off
    const [playEvent] = await db.insert(playEvents).values({
      videoId,
      analysisId,
      startTimestamp: this.toDecimalString(timestamp),
      eventType: 'faceoff',
      eventSubtype: this.extractFaceoffType(content),
      fieldZone: 'midfield',
      fieldSide: 'center',
      success: metadata?.outcome === 'win',
      confidence: metadata?.confidence || 85,
      description: content,
      gameContext: 'face_off',
    }).returning();

    // Extract detailed face-off information
    const faceoffInfo = this.extractFaceoffDetails(content, metadata);
    
    // Create face-off detail record
    await db.insert(faceoffDetails).values({
      playEventId: playEvent.id,
      team1Technique: faceoffInfo.team1Technique,
      team2Technique: faceoffInfo.team2Technique,
      clampSpeed: faceoffInfo.clampSpeed,
      clampAngle: faceoffInfo.clampAngle,
      counterMove: faceoffInfo.counterMove,
      counterTiming: faceoffInfo.counterTiming,
      exitDirection: faceoffInfo.exitDirection,
      exitSpeed: faceoffInfo.exitSpeed,
      wingSupport: faceoffInfo.wingSupport,
      wingPlayDescription: faceoffInfo.wingPlayDescription,
      winner: faceoffInfo.winner,
      possessionTeam: faceoffInfo.possessionTeam,
      fastBreakOpportunity: faceoffInfo.fastBreakOpportunity,
      winProbabilityChange: metadata?.winProbabilityChange,
      technicalScore: this.calculateTechnicalScore(content),
    });
  }

  /**
   * Process transition analysis
   */
  private static async processTransitionAnalysis(
    videoId: number,
    analysisId: number,
    content: string,
    metadata: any,
    timestamp?: number
  ): Promise<void> {
    // Create play event for transition
    const [playEvent] = await db.insert(playEvents).values({
      videoId,
      analysisId,
      startTimestamp: this.toDecimalString(timestamp),
      endTimestamp: this.toOptionalDecimalString(metadata?.endTimestamp),
      eventType: 'transition',
      eventSubtype: metadata?.transitionType || 'clear',
      fieldZone: this.extractFieldZone(content),
      success: metadata?.successful !== false,
      confidence: metadata?.confidence || 85,
      description: content,
      gameContext: 'transition',
    }).returning();

    // Extract transition details
    const transitionInfo = this.extractTransitionDetails(content, metadata);
    
    // Create transition detail record
    await db.insert(transitionDetails).values({
      playEventId: playEvent.id,
      transitionType: transitionInfo.type,
      originatingEvent: transitionInfo.originatingEvent,
      clearingTeam: transitionInfo.clearingTeam,
      ridingTeam: transitionInfo.ridingTeam,
      clearFormation: transitionInfo.clearFormation,
      rideFormation: transitionInfo.rideFormation,
      passCount: transitionInfo.passCount,
      groundBallsInTransition: transitionInfo.groundBalls,
      substitutionPattern: transitionInfo.substitutionPattern,
      pressureLevel: transitionInfo.pressureLevel,
      fieldSpacing: transitionInfo.fieldSpacing,
      successful: transitionInfo.successful,
      resultingOpportunity: transitionInfo.resultingOpportunity,
      timeToComplete: this.toOptionalDecimalString(transitionInfo.timeToComplete),
      expectedSuccessRate: this.toOptionalDecimalString(
        metadata?.clearingSuccess ?? metadata?.ridingSuccess,
      ),
      executionQuality: this.calculateExecutionQuality(content),
    });
  }

  /**
   * Process key moments (goals, assists, saves, etc.)
   */
  private static async processKeyMoment(
    videoId: number,
    analysisId: number,
    content: string,
    metadata: any,
    timestamp?: number
  ): Promise<void> {
    const momentType = this.identifyKeyMomentType(content);
    
    // Create appropriate play event based on moment type
    const [playEvent] = await db.insert(playEvents).values({
      videoId,
      analysisId,
      startTimestamp: this.toDecimalString(timestamp),
      eventType: momentType,
      eventSubtype: this.extractEventSubtype(content, momentType),
      fieldZone: this.extractFieldZone(content),
      fieldSide: this.extractFieldSide(content),
      success: true,
      confidence: metadata?.confidence || 90,
      description: content,
      gameContext: this.extractGameContext(content),
      momentum: this.assessMomentum(content),
    }).returning();

    // Process specific moment types
    if (momentType === 'goal' || momentType === 'shot') {
      await this.processShootingMoment(playEvent.id, content, metadata);
    }
  }

  // Helper methods for extraction and calculation
  private static extractPlayerInfo(content: string, metadata: any): ExtractedPlayerInfo {
    const jerseyMatch = content.match(/#(\d{1,2})\s+(white|dark|blue|red|green|yellow|orange|black|navy|maroon)/i) ||
                       content.match(/(white|dark|blue|red|green|yellow|orange|black|navy|maroon)\s+#(\d{1,2})/i);
    
    const positionMatch = content.match(/(attackman|midfielder|defenseman|goalie|fogo|lsm)/i);
    
    return {
      identifier: jerseyMatch ? `#${jerseyMatch[1] || jerseyMatch[2]} ${jerseyMatch[2] || jerseyMatch[1]}` : null,
      jerseyNumber: jerseyMatch ? (jerseyMatch[1] || jerseyMatch[2]) : null,
      teamColor: jerseyMatch ? (jerseyMatch[2] || jerseyMatch[1]) : null,
      position: positionMatch ? positionMatch[1].toLowerCase() : null,
    };
  }

  private static extractSkillRatings(content: string): SkillRatings {
    // Extract skill ratings from content analysis
    const skills: SkillRatings = {
      dodging: 70,
      shooting: 70,
      passing: 70,
      groundBalls: 70,
      defense: 70,
      offBall: 70,
      iq: 70,
      athleticism: 70,
    };

    // Dodging skill indicators
    if (/exceptional dodging|elite dodge|unstoppable.*dodge/i.test(content)) skills.dodging = 90;
    else if (/strong dodge|effective dodge|good dodge/i.test(content)) skills.dodging = 80;
    else if (/developing dodge|needs work.*dodge/i.test(content)) skills.dodging = 60;

    // Shooting skill indicators
    if (/sniper|deadly accurate|exceptional shot/i.test(content)) skills.shooting = 90;
    else if (/accurate shot|strong shot|reliable shooter/i.test(content)) skills.shooting = 80;
    else if (/inconsistent shot|needs work.*shooting/i.test(content)) skills.shooting = 60;

    // Passing skill indicators
    if (/exceptional vision|elite passer|pinpoint passes/i.test(content)) skills.passing = 90;
    else if (/good passer|accurate passes|solid distribution/i.test(content)) skills.passing = 80;
    else if (/errant passes|needs work.*passing/i.test(content)) skills.passing = 60;

    // Ground ball skill indicators
    if (/ground ball machine|dominant.*ground balls|exceptional.*scoop/i.test(content)) skills.groundBalls = 90;
    else if (/strong.*ground balls|reliable.*possession/i.test(content)) skills.groundBalls = 80;
    else if (/struggles.*ground balls|needs work.*scooping/i.test(content)) skills.groundBalls = 60;

    // Defense skill indicators
    if (/lockdown defender|exceptional defense|shutdown/i.test(content)) skills.defense = 90;
    else if (/solid defender|good positioning|reliable defense/i.test(content)) skills.defense = 80;
    else if (/poor positioning|needs work.*defense/i.test(content)) skills.defense = 60;

    // Lacrosse IQ indicators
    if (/exceptional.*iq|brilliant.*decision|chess master/i.test(content)) skills.iq = 90;
    else if (/smart player|good decisions|solid.*iq/i.test(content)) skills.iq = 80;
    else if (/poor decisions|needs.*awareness/i.test(content)) skills.iq = 60;

    return skills;
  }

  private static calculateOverallRating(skills: SkillRatings): string {
    const values = Object.values(skills);
    const avg = values.reduce((total, value) => total + value, 0) / values.length;
    if (avg >= 85) return "4.5";
    if (avg >= 75) return "4.0";
    if (avg >= 65) return "3.5";
    if (avg >= 55) return "3.0";
    return "2.5";
  }

  private static calculatePotentialRating(content: string, skills: SkillRatings): string {
    let potential = parseFloat(this.calculateOverallRating(skills));
    
    // Increase potential based on positive indicators
    if (/young|freshman|sophomore|high ceiling|raw talent/i.test(content)) potential += 0.5;
    if (/coachable|quick learner|improving rapidly/i.test(content)) potential += 0.3;
    if (/athletic|explosive|physical tools/i.test(content)) potential += 0.2;
    
    return Math.min(5.0, potential).toFixed(1);
  }

  private static detectHandedness(content: string): string | null {
    if (/right.?handed|righty/i.test(content)) return "right";
    if (/left.?handed|lefty/i.test(content)) return "left";
    if (/ambidextrous|both hands|switches hands/i.test(content)) return "ambidextrous";
    return null;
  }

  private static estimateHeight(content: string): string | null {
    if (/tall|lengthy|long.*pole|towers/i.test(content)) return "tall";
    if (/short|compact|low.*center/i.test(content)) return "short";
    return "average";
  }

  private static extractCoachability(content: string): number {
    let score = 70;
    if (/coachable|receptive|quick learner|adjusts well/i.test(content)) score += 20;
    if (/stubborn|resistant|slow to adjust/i.test(content)) score -= 20;
    if (/great attitude|positive|team first/i.test(content)) score += 10;
    return Math.min(100, Math.max(0, score));
  }

  private static averageSkill(existing: number | null, newValue: number): number {
    if (existing === null || existing === undefined) {
      return newValue;
    }
    return Math.round((existing + newValue) / 2);
  }

  private static enhanceMetadata(type: string, metadata: any, content: string): any {
    const enhanced = { ...metadata };
    
    // Add subtype based on content analysis
    enhanced.subtype = this.determineSubtype(type, content);
    
    // Add duration for plays that span time
    if (type === 'transition' || type === 'possession') {
      enhanced.duration = this.extractDuration(content);
    }
    
    // Add field location data
    enhanced.fieldLocation = this.extractFieldLocation(content);
    
    // Add player count involved
    enhanced.playersInvolved = this.countPlayersInvolved(content);
    
    return enhanced;
  }

  private static generateTags(type: string, content: string, metadata: any): string[] {
    const tags = [type];
    
    // Add technique tags
    const techniques = content.match(/(clamp|rake|plunger|jump|dodge|roll|split|face|bull|banana|slide|double|triple)/gi);
    if (techniques) tags.push(...techniques.map(t => t.toLowerCase()));
    
    // Add outcome tags
    if (metadata?.outcome) tags.push(metadata.outcome);
    if (metadata?.successful) tags.push('successful');
    
    // Add context tags
    if (/man.?up/i.test(content)) tags.push('man-up');
    if (/man.?down/i.test(content)) tags.push('man-down');
    if (/fast.?break/i.test(content)) tags.push('fast-break');
    
    return [...new Set(tags)];
  }

  private static generateTitle(type: string, content: string, metadata: any): string {
    const timestamp = metadata?.timestamp ? `[${this.formatTimestamp(metadata.timestamp)}]` : '';
    
    switch (type) {
      case 'player_evaluation':
        const player = this.extractPlayerInfo(content, metadata);
        return `${timestamp} Player Evaluation: ${player.identifier || 'Unknown'}`;
      case 'face_off':
        return `${timestamp} Face-off: ${metadata?.technique || 'Analysis'}`;
      case 'transition':
        return `${timestamp} Transition: ${metadata?.transitionType || 'Clear/Ride'}`;
      case 'key_moment':
        const moment = this.identifyKeyMomentType(content);
        return `${timestamp} Key Moment: ${moment}`;
      default:
        return `${timestamp} ${type}`;
    }
  }

  private static formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private static determineSubtype(type: string, content: string): string | null {
    if (type === 'player_evaluation') {
      if (/attackman|attack/i.test(content)) return 'attack_evaluation';
      if (/midfielder|middie/i.test(content)) return 'midfield_evaluation';
      if (/defenseman|defense|pole/i.test(content)) return 'defense_evaluation';
      if (/goalie|keeper/i.test(content)) return 'goalie_evaluation';
      if (/fogo|face.?off/i.test(content)) return 'fogo_evaluation';
    }
    return null;
  }

  private static extractDuration(content: string): number | null {
    const durationMatch = content.match(/(\d+)\s*seconds?/i);
    return durationMatch ? parseInt(durationMatch[1]) : null;
  }

  private static extractFieldLocation(content: string): any {
    return {
      zone: this.extractFieldZone(content),
      side: this.extractFieldSide(content),
    };
  }

  private static extractFieldZone(content: string): string | null {
    if (/attack.*box|offensive.*zone|attack.*area/i.test(content)) return 'attack_box';
    if (/defensive.*zone|defensive.*end/i.test(content)) return 'defensive_zone';
    if (/midfield|center.*field/i.test(content)) return 'midfield';
    if (/crease|goal.*area/i.test(content)) return 'crease';
    if (/\bx\b|behind.*cage/i.test(content)) return 'x_area';
    return null;
  }

  private static extractFieldSide(content: string): string | null {
    if (/left.*side|left.*alley/i.test(content)) return 'left';
    if (/right.*side|right.*alley/i.test(content)) return 'right';
    if (/center|middle/i.test(content)) return 'center';
    return null;
  }

  private static countPlayersInvolved(content: string): number {
    const playerMatches = content.match(/#\d{1,2}/g);
    return playerMatches ? new Set(playerMatches).size : 0;
  }

  private static createPlayerEvaluationEvent(
    videoId: number,
    analysisId: number,
    playerId: number,
    timestamp?: number
  ): Promise<any> {
    return db.insert(playEvents).values({
      videoId,
      analysisId,
      startTimestamp: this.toDecimalString(timestamp),
      eventType: 'evaluation',
      primaryPlayerId: playerId,
      confidence: 85,
      description: 'Player evaluation assessment',
    });
  }

  private static extractFaceoffType(content: string): string {
    if (/violation|illegal/i.test(content)) return 'violation';
    if (/fast.*break/i.test(content)) return 'fast_break_faceoff';
    if (/defensive.*win/i.test(content)) return 'defensive_faceoff';
    return 'standard_faceoff';
  }

  private static extractFaceoffDetails(content: string, metadata: any): any {
    return {
      team1Technique: this.extractTechnique(content, 1),
      team2Technique: this.extractTechnique(content, 2),
      clampSpeed: this.extractClampSpeed(content),
      clampAngle: this.extractClampAngle(content),
      counterMove: this.extractCounterMove(content),
      counterTiming: this.extractCounterTiming(content),
      exitDirection: this.extractExitDirection(content),
      exitSpeed: this.extractExitSpeed(content),
      wingSupport: /wing.*support|wing.*help/i.test(content),
      wingPlayDescription: this.extractWingPlay(content),
      winner: metadata?.winner || this.determineWinner(content),
      possessionTeam: metadata?.possessionTeam || this.determinePossession(content),
      fastBreakOpportunity: /fast.*break|numbers|transition.*opportunity/i.test(content),
    };
  }

  private static extractTechnique(content: string, team: number): string | null {
    const techniques = ['clamp', 'rake', 'jump', 'plunger', 'laser', 'traditional'];
    for (const tech of techniques) {
      const pattern = new RegExp(`${tech}`, 'i');
      if (pattern.test(content)) return tech;
    }
    return null;
  }

  private static extractClampSpeed(content: string): string {
    if (/quick.*clamp|fast.*clamp|explosive.*clamp/i.test(content)) return 'fast';
    if (/slow.*clamp|deliberate.*clamp/i.test(content)) return 'slow';
    return 'medium';
  }

  private static extractClampAngle(content: string): string {
    if (/forward.*clamp|aggressive.*angle/i.test(content)) return 'forward';
    if (/reverse.*clamp|backward.*angle/i.test(content)) return 'reverse';
    return 'neutral';
  }

  private static extractCounterMove(content: string): string | null {
    const counters = ['jump.*counter', 'spin.*move', 'rake.*counter', 'lift.*check'];
    for (const counter of counters) {
      if (new RegExp(counter, 'i').test(content)) return counter.replace('.*', ' ');
    }
    return null;
  }

  private static extractCounterTiming(content: string): string {
    if (/early.*counter|anticipat/i.test(content)) return 'early';
    if (/late.*counter|delayed/i.test(content)) return 'late';
    return 'on-time';
  }

  private static extractExitDirection(content: string): string | null {
    if (/forward.*exit|push.*forward/i.test(content)) return 'forward';
    if (/back.*exit|pull.*back/i.test(content)) return 'back';
    if (/left.*exit/i.test(content)) return 'left';
    if (/right.*exit/i.test(content)) return 'right';
    return null;
  }

  private static extractExitSpeed(content: string): string {
    if (/explosive.*exit|quick.*exit|fast.*out/i.test(content)) return 'explosive';
    if (/slow.*exit|controlled.*exit/i.test(content)) return 'controlled';
    return 'controlled';
  }

  private static extractWingPlay(content: string): string | null {
    const wingMatch = content.match(/wing.{0,50}(support|help|play|position)/i);
    return wingMatch ? wingMatch[0] : null;
  }

  private static determineWinner(content: string): string | null {
    if (/white.*wins?|white.*possession/i.test(content)) return 'white';
    if (/dark.*wins?|dark.*possession/i.test(content)) return 'dark';
    if (/blue.*wins?|blue.*possession/i.test(content)) return 'blue';
    return null;
  }

  private static determinePossession(content: string): string | null {
    return this.determineWinner(content);
  }

  private static calculateTechnicalScore(content: string): number {
    let score = 70;
    
    // Positive indicators
    if (/perfect.*technique|textbook|flawless/i.test(content)) score += 20;
    if (/strong.*technique|solid.*execution/i.test(content)) score += 10;
    if (/quick.*hands|fast.*clamp/i.test(content)) score += 5;
    
    // Negative indicators
    if (/poor.*technique|sloppy|struggled/i.test(content)) score -= 15;
    if (/slow|hesitant|late/i.test(content)) score -= 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private static extractTransitionDetails(content: string, metadata: any): any {
    return {
      type: this.extractTransitionType(content),
      originatingEvent: this.extractOriginatingEvent(content),
      clearingTeam: this.extractTeamColor(content, 'clearing'),
      ridingTeam: this.extractTeamColor(content, 'riding'),
      clearFormation: this.extractFormation(content, 'clear'),
      rideFormation: this.extractFormation(content, 'ride'),
      passCount: this.extractPassCount(content),
      groundBalls: this.extractGroundBallCount(content),
      substitutionPattern: this.extractSubPattern(content),
      pressureLevel: this.extractPressureLevel(content),
      fieldSpacing: this.extractFieldSpacing(content),
      successful: metadata?.successful !== false,
      resultingOpportunity: this.extractResultingOpportunity(content),
      timeToComplete: this.extractTransitionTime(content),
    };
  }

  private static extractTransitionType(content: string): string {
    if (/clear/i.test(content)) return 'clear';
    if (/ride/i.test(content)) return 'ride';
    if (/unsettled|broken/i.test(content)) return 'unsettled';
    return 'transition';
  }

  private static extractOriginatingEvent(content: string): string | null {
    if (/after.*save|following.*save/i.test(content)) return 'save';
    if (/turnover|caused/i.test(content)) return 'turnover';
    if (/faceoff.*win|won.*draw/i.test(content)) return 'faceoff_win';
    if (/ground.*ball/i.test(content)) return 'ground_ball';
    return null;
  }

  private static extractTeamColor(content: string, context: string): string | null {
    const colorPattern = /(white|dark|blue|red|green|yellow|orange|black|navy|maroon)/i;
    const contextPattern = new RegExp(`${context}.{0,20}(${colorPattern.source})`, 'i');
    const match = content.match(contextPattern);
    return match ? match[1].toLowerCase() : null;
  }

  private static extractFormation(content: string, type: string): string | null {
    if (type === 'clear') {
      if (/banana/i.test(content)) return 'banana';
      if (/wide/i.test(content)) return 'wide';
      if (/traditional|standard/i.test(content)) return 'traditional';
    } else {
      if (/10.?man/i.test(content)) return '10-man';
      if (/zone/i.test(content)) return 'zone';
      if (/adjacent/i.test(content)) return 'adjacent';
    }
    return null;
  }

  private static extractPassCount(content: string): number | null {
    const passMatch = content.match(/(\d+)\s*pass(?:es)?/i);
    return passMatch ? parseInt(passMatch[1]) : null;
  }

  private static extractGroundBallCount(content: string): number | null {
    const gbMatch = content.match(/(\d+)\s*ground\s*balls?/i);
    return gbMatch ? parseInt(gbMatch[1]) : null;
  }

  private static extractSubPattern(content: string): string | null {
    if (/hockey.*change|line.*change/i.test(content)) return 'hockey_change';
    if (/middie.*back/i.test(content)) return 'middie_back';
    if (/full.*change/i.test(content)) return 'full_change';
    return null;
  }

  private static extractPressureLevel(content: string): string {
    if (/intense.*pressure|heavy.*pressure|high.*pressure/i.test(content)) return 'high';
    if (/light.*pressure|low.*pressure|no.*pressure/i.test(content)) return 'low';
    return 'medium';
  }

  private static extractFieldSpacing(content: string): string {
    if (/compressed|tight.*spacing|bunched/i.test(content)) return 'compressed';
    if (/stretched|wide.*spacing|spread/i.test(content)) return 'stretched';
    return 'balanced';
  }

  private static extractResultingOpportunity(content: string): string | null {
    if (/fast.*break|numbers|odd.*man/i.test(content)) return 'fast_break';
    if (/slow.*break|settled/i.test(content)) return 'slow_break';
    if (/turnover|lost.*possession/i.test(content)) return 'turnover';
    return 'settled';
  }

  private static extractTransitionTime(content: string): number | null {
    const timeMatch = content.match(/(\d+\.?\d*)\s*seconds?/i);
    return timeMatch ? parseFloat(timeMatch[1]) : null;
  }

  private static calculateExecutionQuality(content: string): number {
    let quality = 70;
    
    // Positive indicators
    if (/perfect.*execution|flawless|textbook/i.test(content)) quality += 20;
    if (/quick.*ball.*movement|crisp.*passes/i.test(content)) quality += 10;
    if (/good.*spacing|maintained.*structure/i.test(content)) quality += 10;
    
    // Negative indicators
    if (/sloppy|poor.*execution|struggled/i.test(content)) quality -= 20;
    if (/turnovers?|dropped.*pass/i.test(content)) quality -= 15;
    
    return Math.min(100, Math.max(0, quality));
  }

  private static identifyKeyMomentType(content: string): string {
    if (/goal|scored/i.test(content)) return 'goal';
    if (/assist/i.test(content)) return 'assist';
    if (/save|stopped/i.test(content)) return 'save';
    if (/caused.*turnover|takeaway/i.test(content)) return 'caused_turnover';
    if (/penalty|flag/i.test(content)) return 'penalty';
    if (/shot/i.test(content)) return 'shot';
    return 'highlight';
  }

  private static extractEventSubtype(content: string, type: string): string | null {
    if (type === 'goal') {
      if (/dodge.*goal/i.test(content)) return 'dodge_goal';
      if (/time.*room/i.test(content)) return 'time_and_room';
      if (/man.*up/i.test(content)) return 'man_up_goal';
      if (/fast.*break/i.test(content)) return 'fast_break_goal';
      if (/outside/i.test(content)) return 'outside_shot';
    }
    return null;
  }

  private static extractGameContext(content: string): string {
    if (/man.*up/i.test(content)) return 'man_up';
    if (/man.*down/i.test(content)) return 'man_down';
    if (/transition/i.test(content)) return 'transition';
    return 'even_strength';
  }

  private static assessMomentum(content: string): string {
    if (/momentum.*shift|game.*changer|spark/i.test(content)) return 'positive';
    if (/deflating|costly|damaging/i.test(content)) return 'negative';
    return 'neutral';
  }

  private static async processShootingMoment(playEventId: number, content: string, metadata: any): Promise<void> {
    // This would create detailed shot records
    // Implementation depends on shot details table structure
  }
}
