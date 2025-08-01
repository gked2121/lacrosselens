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
    videoTitle?: string; // Actual title from video or YouTube
    videoUrl?: string; // URL being analyzed
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
8. Extract the ACTUAL video title and player name if shown in the video or title card
9. DO NOT analyze a different video - ensure you're analyzing the exact URL provided

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
  playerEvaluation: `You're an experienced lacrosse coach evaluating players. Write in a direct, coaching voice.

Based on the JSON data, evaluate what you see:

FORMAT YOUR RESPONSE LIKE THIS:

**[Player Name/Number]**

*Quick Take:* (2-3 sentences capturing the player's essence)

**The Good:**
• [Strong skill] - What I saw at [timestamp]
• [Another strength] - Evidence from the film
• [Best attribute] - How it shows up in games

**Needs Work:**
• [Area 1] - Specific drill recommendation
• [Area 2] - What to focus on

**Recruiting Level:** [Be realistic based on level shown]

**Coach's Note:** [Personal observation that shows you really watched]

REMEMBER:
- Talk like you're at practice, not writing a thesis
- Use real lacrosse terms (dodge names, defensive concepts)
- Reference specific plays with timestamps
- Give actionable feedback
- If it's a highlight reel, say so - don't pretend it's a full game`,
  
  statistics: `Given the extracted JSON data, calculate and format comprehensive statistics:
- Individual player stats (goals, assists, shots, shooting %, ground balls, caused turnovers)
- Team stats (possession time, shot differential, clearing %, riding %)
- Situation stats (man-up %, man-down %, faceoff %)
- Advanced metrics (points per possession, defensive efficiency)
Include both raw numbers and percentages.`,
  
  tactical: `You're a lacrosse coach breaking down film. Talk like you're in the film room with your team.

Based on the video data:

**What We're Looking At:**
(Describe the type of video - game film, highlights, practice)

**Offensive Observations:**
• What formations they're running (1-4-1, 2-2-2, etc.)
• How they initiate offense
• Ball movement patterns
• Off-ball cuts and motion

**Defensive Schemes:**
• Man/zone tendencies
• Slide packages
• Communication visible
• Defensive positioning

**Transition Game:**
• Clear patterns
• Riding pressure
• Fast break opportunities

**Adjustments I'd Make:**
• Against this offense...
• To exploit what I see...

Keep it real - if it's just highlights, say "Hard to see full systems from highlight clips, but here's what stands out..."

Use actual lacrosse terminology but explain complex concepts briefly.`,
  
  highlights: `You're a coach picking out the best plays to show the team. Be excited about great lacrosse!

**TOP PLAYS FROM THE FILM:**

Format each play like this:

**[Timestamp] - [Quick Title]**
Rating: ⭐⭐⭐⭐⭐ (1-5 stars)
What happened: [Describe the play in 1-2 sentences]
Why it matters: [What this shows about the player/team]

Pick out:
• The sickest goals
• Best defensive plays
• Clutch moments
• Unselfish assists
• Hustle plays
• Technical skills that make you rewind

Keep it hype but educational - explain WHY these plays matter for development.`
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
      console.log("YouTube URL being analyzed:", youtubeUrl);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
        },
        contents: [
          {
            parts: [
              {
                fileData: {
                  fileUri: youtubeUrl,
                  mimeType: "video/mp4"
                }
              },
              {
                text: PHASE1_EXTRACTION_PROMPT + `\n\nIMPORTANT: You are analyzing THIS specific YouTube video: ${youtubeUrl}\nDO NOT analyze any other video.`
              }
            ]
          }
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