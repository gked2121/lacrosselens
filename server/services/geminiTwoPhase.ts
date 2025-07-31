import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

// Comprehensive data structure for phase 1 extraction
export interface ComprehensiveLacrosseData {
  videoMetadata: {
    duration: number;
    quality: string; // "HD", "SD", "Low"
    cameraAngle: string; // "sideline", "endline", "elevated"
    gameType: string; // "full_game", "highlight", "practice", "drill"
    weather?: string; // "clear", "rain", "wind"
    field?: string; // "turf", "grass"
  };
  
  teams: {
    team1: {
      jerseyColor: string;
      identifiedPlayers: {
        number?: string;
        description: string; // Used when no number visible
        position?: string;
        handedness?: string;
      }[];
    };
    team2: {
      jerseyColor: string;
      identifiedPlayers: {
        number?: string;
        description: string;
        position?: string;
        handedness?: string;
      }[];
    };
  };
  
  plays: {
    playId: string;
    startTime: number;
    endTime: number;
    playType: string; // "settled_offense", "fast_break", "clear", "ride", etc.
    
    ballMovement: {
      time: number;
      from: string; // Player identifier
      to: string;
      passType: string;
      success: boolean;
    }[];
    
    playerActions: {
      time: number;
      player: string;
      action: string; // "dodge", "shot", "check", "ground_ball", etc.
      details: any; // Flexible object for action-specific details
      outcome: string;
    }[];
    
    formations: {
      offensive?: string;
      defensive?: string;
    };
    
    result: string; // "goal", "save", "turnover", "clear", etc.
  }[];
  
  individualPerformance: {
    player: string;
    stats: {
      goals: number;
      assists: number;
      shots: number;
      groundBalls: number;
      causedTurnovers: number;
      turnovers: number;
      saves?: number;
      faceoffWins?: number;
      faceoffLosses?: number;
    };
    skills: {
      shooting: { attempts: any[]; successRate: number; };
      dodging: { attempts: any[]; successRate: number; };
      passing: { attempts: any[]; completionRate: number; };
      defense: { plays: any[]; effectiveness: string; };
    };
    athleticism: {
      speed: string;
      agility: string;
      strength: string;
      endurance: string;
    };
  }[];
  
  gameFlow: {
    momentum: {
      time: number;
      team: string;
      reason: string;
    }[];
    keyMoments: {
      time: number;
      description: string;
      impact: string;
    }[];
    scoring: {
      time: number;
      scorer: string;
      assist?: string;
      type: string; // "even_strength", "man_up", "man_down"
    }[];
  };
  
  tacticalObservations: {
    offensiveStrategies: string[];
    defensiveStrategies: string[];
    transitionPatterns: string[];
    specialSituations: {
      manUp: { success: number; total: number; };
      manDown: { success: number; total: number; };
      faceoffs: { wins: number; total: number; technique: string[]; };
    };
  };
  
  coachingInsights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    playerDevelopment: {
      player: string;
      areas: string[];
    }[];
  };
}

// Phase 1: Extract all data into comprehensive JSON
const PHASE1_EXTRACTION_PROMPT = `You are an advanced lacrosse video analysis AI. Extract EVERY piece of observable data from this video into a structured JSON format.

CRITICAL RULES:
1. NEVER make up data - only record what you can actually observe
2. If jersey numbers aren't visible, use descriptive identifiers (e.g., "tall player in white", "lefty attackman")
3. Record exact timestamps for every action
4. Include confidence levels for uncertain observations

Return a JSON object with this exact structure:
{
  "videoMetadata": { ... },
  "teams": { ... },
  "plays": [ ... ],
  "individualPerformance": [ ... ],
  "gameFlow": { ... },
  "tacticalObservations": { ... },
  "coachingInsights": { ... }
}

For each play, track:
- Every pass (who to who, type, success)
- Every dodge (type, defender, outcome)
- Every shot (location, type, velocity, result)
- Every defensive action (checks, slides, recoveries)
- Every ground ball (winner, contested/uncontested)
- Formation changes
- Off-ball movement

Be extremely detailed. This data will be used for comprehensive statistical analysis.`;

// Phase 2: Format extracted data into specific analysis types
const PHASE2_FORMATTING_PROMPTS = {
  playerEvaluation: `Given the extracted JSON data, create detailed player evaluations focusing on:
- Technical skills assessment
- Decision-making analysis
- Physical attributes
- Areas for improvement
- College/recruiting potential
Format as narrative evaluations with specific examples and timestamps.`,
  
  statistics: `Given the extracted JSON data, calculate and format comprehensive statistics:
- Individual player stats (goals, assists, shots, shooting %, ground balls, caused turnovers)
- Team stats (possession time, shot differential, clearing %, riding %)
- Situation stats (man-up %, man-down %, faceoff %)
- Advanced metrics (points per possession, defensive efficiency)
Include both raw numbers and percentages.`,
  
  tactical: `Given the extracted JSON data, provide tactical analysis:
- Offensive system identification and effectiveness
- Defensive scheme analysis
- Transition patterns
- Special teams performance
- Strategic recommendations`,
  
  highlights: `Given the extracted JSON data, identify and describe:
- Top 10 plays with timestamps
- Best individual performances
- Momentum-shifting moments
- Technical skill demonstrations
Rate each highlight 1-10 and explain why it's noteworthy.`
};

export class TwoPhaseGeminiAnalyzer {
  static async extractComprehensiveData(videoPath: string): Promise<ComprehensiveLacrosseData> {
    try {
      console.log("Phase 1: Extracting comprehensive data from video...");
      
      const videoBytes = fs.readFileSync(videoPath);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-latest",
        config: {
          responseMimeType: "application/json",
        },
        contents: [
          {
            inlineData: {
              data: videoBytes.toString("base64"),
              mimeType: "video/mp4"
            }
          },
          PHASE1_EXTRACTION_PROMPT
        ]
      });
      
      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (error) {
      console.error("Error in phase 1 extraction:", error);
      throw error;
    }
  }
  
  static async extractFromYouTube(youtubeUrl: string): Promise<ComprehensiveLacrosseData> {
    try {
      console.log("Phase 1: Extracting comprehensive data from YouTube video...");
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-latest",
        config: {
          responseMimeType: "application/json",
        },
        contents: [
          { fileData: { fileUri: youtubeUrl } },
          PHASE1_EXTRACTION_PROMPT
        ]
      });
      
      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (error) {
      console.error("Error in YouTube phase 1 extraction:", error);
      throw error;
    }
  }
  
  static async formatAnalysis(
    extractedData: ComprehensiveLacrosseData, 
    analysisType: keyof typeof PHASE2_FORMATTING_PROMPTS
  ): Promise<any> {
    try {
      console.log(`Phase 2: Formatting ${analysisType} analysis...`);
      
      const prompt = PHASE2_FORMATTING_PROMPTS[analysisType];
      const dataContext = `Here is the extracted video data:\n${JSON.stringify(extractedData, null, 2)}\n\n${prompt}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-latest",
        config: {
          responseMimeType: analysisType === 'statistics' ? "application/json" : "text/plain",
        },
        contents: dataContext
      });
      
      const text = response.text || (analysisType === 'statistics' ? "{}" : "");
      return analysisType === 'statistics' ? JSON.parse(text) : text;
    } catch (error) {
      console.error(`Error in phase 2 ${analysisType} formatting:`, error);
      throw error;
    }
  }
  
  static async performFullAnalysis(
    videoPath: string, 
    isYouTube: boolean = false
  ): Promise<{
    rawData: ComprehensiveLacrosseData;
    formattedAnalyses: {
      playerEvaluations: any;
      statistics: any;
      tactical: any;
      highlights: any;
    };
  }> {
    try {
      // Phase 1: Extract all data
      const rawData = isYouTube 
        ? await this.extractFromYouTube(videoPath)
        : await this.extractComprehensiveData(videoPath);
      
      console.log("Phase 1 complete. Extracted data with", rawData.plays?.length || 0, "plays");
      
      // Phase 2: Format into different analysis types
      const [playerEvaluations, statistics, tactical, highlights] = await Promise.all([
        this.formatAnalysis(rawData, 'playerEvaluation'),
        this.formatAnalysis(rawData, 'statistics'),
        this.formatAnalysis(rawData, 'tactical'),
        this.formatAnalysis(rawData, 'highlights')
      ]);
      
      return {
        rawData,
        formattedAnalyses: {
          playerEvaluations,
          statistics,
          tactical,
          highlights
        }
      };
    } catch (error) {
      console.error("Error in full analysis:", error);
      throw error;
    }
  }
}