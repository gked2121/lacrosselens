/**
 * Base Analysis Module Interface
 * All analysis modules must implement this interface to ensure consistency
 * and compatibility with the advanced analysis system
 */

export interface AnalysisContext {
  videoPath: string;
  videoMetadata?: {
    duration: number;
    fps: number;
    resolution: string;
  };
  userPreferences?: {
    focusAreas: string[];
    playerNumbers?: string[];
    teamName?: string;
    level?: string;
  };
  previousAnalyses?: Map<string, any>;
}

export interface AnalysisResult {
  type: string;
  confidence: number;
  timestamp?: number;
  data: any;
  insights: string[];
  recommendations?: string[];
}

export interface AnalysisModule {
  // Module identification
  name: string;
  version: string;
  description: string;
  
  // Core analysis methods
  analyze(context: AnalysisContext): Promise<AnalysisResult[]>;
  getPrompts(context: AnalysisContext): string[];
  processResults(rawData: any, context: AnalysisContext): Promise<AnalysisResult[]>;
  
  // Configuration
  isEnabled(): boolean;
  getRequiredDataPoints(): string[];
  getOptionalDataPoints(): string[];
  
  // Validation
  validateInput(context: AnalysisContext): boolean;
  validateOutput(results: AnalysisResult[]): boolean;
}

export abstract class BaseAnalysisModule implements AnalysisModule {
  abstract name: string;
  abstract version: string;
  abstract description: string;
  
  protected logger = console;
  
  abstract analyze(context: AnalysisContext): Promise<AnalysisResult[]>;
  abstract getPrompts(context: AnalysisContext): string[];
  abstract processResults(rawData: any, context: AnalysisContext): Promise<AnalysisResult[]>;
  
  isEnabled(): boolean {
    return true;
  }
  
  getRequiredDataPoints(): string[] {
    return ['videoPath'];
  }
  
  getOptionalDataPoints(): string[] {
    return ['userPreferences', 'previousAnalyses'];
  }
  
  validateInput(context: AnalysisContext): boolean {
    if (!context.videoPath) {
      this.logger.error(`${this.name}: Missing required video path`);
      return false;
    }
    return true;
  }
  
  validateOutput(results: AnalysisResult[]): boolean {
    if (!Array.isArray(results)) {
      this.logger.error(`${this.name}: Results must be an array`);
      return false;
    }
    
    for (const result of results) {
      if (!result.type || !result.data || typeof result.confidence !== 'number') {
        this.logger.error(`${this.name}: Invalid result format`, result);
        return false;
      }
    }
    
    return true;
  }
  
  protected logInfo(message: string, data?: any): void {
    this.logger.log(`[${this.name}] ${message}`, data || '');
  }
  
  protected logError(message: string, error?: any): void {
    this.logger.error(`[${this.name}] ${message}`, error || '');
  }
}

// Helper functions for common analysis tasks
export class AnalysisHelpers {
  static calculateConfidence(factors: number[]): number {
    if (factors.length === 0) return 0;
    const average = factors.reduce((a, b) => a + b, 0) / factors.length;
    return Math.min(100, Math.max(0, Math.round(average)));
  }
  
  static extractTimestamps(text: string): number[] {
    const timePattern = /(\d{1,3}):(\d{2})|(\d+)\s*seconds?/gi;
    const timestamps: number[] = [];
    let match;
    
    while ((match = timePattern.exec(text)) !== null) {
      if (match[1] && match[2]) {
        // Format: MM:SS
        timestamps.push(parseInt(match[1]) * 60 + parseInt(match[2]));
      } else if (match[3]) {
        // Format: X seconds
        timestamps.push(parseInt(match[3]));
      }
    }
    
    return timestamps;
  }
  
  static formatInsight(category: string, detail: string, confidence: number): string {
    const confidenceLabel = confidence >= 90 ? 'High confidence' : 
                           confidence >= 70 ? 'Moderate confidence' : 
                           'Low confidence';
    return `[${category}] ${detail} (${confidenceLabel}: ${confidence}%)`;
  }
}