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
const PHASE1_EXTRACTION_PROMPT = `You are an advanced lacrosse video analysis AI. Extract ONLY what you can ACTUALLY SEE in this video.

CRITICAL RULES - FOLLOW THESE EXACTLY:
1. NEVER make up team names, player names, or any information not visible in the video
2. NEVER assume this is a college game - many videos are high school, youth, or club lacrosse
3. If you cannot see jersey numbers clearly, use descriptions like "player in white #7" or "attackman in blue"
4. If you cannot determine the level of play, mark it as "unknown" - DO NOT GUESS
5. Record exact timestamps for every observable action
6. For highlight tapes, focus on the featured player if one is evident
7. ONLY report what you can directly observe - no assumptions or fabrications

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

For each play, track ONLY what you can see:
- Passes (describe players by jersey color/number if visible)
- Dodges (type and outcome if clear)
- Shots (location and result)
- Defensive actions (if visible)
- Ground balls (if observable)
- DO NOT make up formations or strategies you cannot see
- DO NOT assume team names or player identities

Be accurate, not creative. Only report observable facts.`;

// Phase 2: Format extracted data into specific analysis types
const PHASE2_FORMATTING_PROMPTS = {
  playerEvaluation: `Given the extracted JSON data, create detailed player evaluations.

STRICT RULES:
- ONLY evaluate players you can actually see in the video
- NEVER make up player names, numbers, or teams
- If this is a highlight tape, focus primarily on the featured player
- Use exact descriptions from the JSON data (e.g., "player in white #23" not "Syracuse #23")
- Include specific timestamps and observable actions
- For recruiting potential, be appropriate to the actual level shown (high school, club, etc.)
- If you cannot determine something, say "cannot be determined from video"

Focus on:
- Observable technical skills
- Decision-making visible in the clips
- Physical attributes you can actually see
- Areas for improvement based on what's shown
- Appropriate level recruiting potential`,
  
  statistics: `Given the extracted JSON data, calculate and format comprehensive statistics:
- Individual player stats (goals, assists, shots, shooting %, ground balls, caused turnovers)
- Team stats (possession time, shot differential, clearing %, riding %)
- Situation stats (man-up %, man-down %, faceoff %)
- Advanced metrics (points per possession, defensive efficiency)
Include both raw numbers and percentages.`,
  
  tactical: `Given the extracted JSON data, provide tactical analysis ONLY for what you can observe:

STRICT RULES:
- DO NOT make up team names (no "Syracuse", "Johns Hopkins", etc. unless clearly visible)
- DO NOT assume college-level tactics for what might be high school play
- ONLY describe formations and strategies you can actually see
- Use generic terms like "attacking team" or "team in white jerseys"
- If this is a highlight reel, note that tactical analysis is limited

Focus on observable patterns:
- Offensive movements you can see
- Defensive positioning that's visible
- Transition play if shown
- Only recommend strategies based on actual observed play`,
  
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
        model: "gemini-2.5-pro",
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
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
        },
        contents: [
          youtubeUrl,
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
        model: "gemini-2.5-pro",
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