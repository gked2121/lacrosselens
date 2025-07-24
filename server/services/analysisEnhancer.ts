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
  faceOffWins: number;
  faceOffTotal: number;
  transitionSuccess: number;
  transitionTotal: number;
  groundBalls: number;
  causedTurnovers: number;
  saves: number;
}

export interface DetailedPlay {
  type: 'goal' | 'assist' | 'faceoff' | 'transition' | 'turnover' | 'save';
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
  
  // Identify play type from key moment content
  static identifyPlayTypeFromContent(content: string): 'goal' | 'assist' | 'save' | undefined {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('goal') || lowerContent.includes('scores') || lowerContent.includes('finished')) {
      return 'goal';
    } else if (lowerContent.includes('assist') || lowerContent.includes('feed') || lowerContent.includes('pass for')) {
      return 'assist';
    } else if (lowerContent.includes('save') || lowerContent.includes('stops') || lowerContent.includes('denied')) {
      return 'save';
    }
    
    return undefined;
  }
  
  // Get play statistics for a video
  static async getVideoPlayStatistics(videoId: number): Promise<PlayStatistics> {
    const videoAnalyses = await db.select().from(analyses).where(eq(analyses.videoId, videoId));
    
    const stats: PlayStatistics = {
      goals: 0,
      assists: 0,
      faceOffWins: 0,
      faceOffTotal: 0,
      transitionSuccess: 0,
      transitionTotal: 0,
      groundBalls: 0,
      causedTurnovers: 0,
      saves: 0
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
          case 'save':
            stats.saves++;
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