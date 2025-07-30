// Advanced Multi-Pass Video Analysis System
// This system uses multiple specialized prompts to extract maximum detail from lacrosse videos

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import { getAnalysisModules } from './analysisModules/analysisRegistry';
import { AnalysisContext, AnalysisResult, AnalysisModule } from './analysisModules/baseAnalysisModule';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface VideoSegment {
  startTime: number;
  endTime: number;
  description: string;
  players: string[];
  playType: string;
  importance: 'high' | 'medium' | 'low';
}

export interface DetailedAnalysis {
  segments: VideoSegment[];
  technicalBreakdowns: TechnicalBreakdown[];
  tacticalInsights: TacticalInsight[];
  statisticalData: StatisticalExtraction[];
  playerProfiles: PlayerProfile[];
}

export interface TechnicalBreakdown {
  timestamp: number;
  playerNumber: string;
  skillArea: string;
  biomechanics: string;
  decisionMaking: string;
  improvement: string;
  confidence: number;
}

export interface TacticalInsight {
  timestamp: number;
  situation: string;
  formation: string;
  execution: string;
  alternatives: string;
  coaching: string;
  confidence: number;
}

export interface StatisticalExtraction {
  timestamp: number;
  playType: string;
  playerInvolved: string;
  outcome: string;
  metrics: Record<string, any>;
}

export interface PlayerProfile {
  playerNumber: string;
  position: string;
  strengths: string[];
  weaknesses: string[];
  recommendedDrills: string[];
  overallGrade: string;
}

export class AdvancedVideoAnalyzer {
  
  // Pass 1: Video Segmentation and Scene Mapping
  static async segmentVideo(videoPath: string): Promise<VideoSegment[]> {
    const videoBytes = fs.readFileSync(videoPath);
    
    const segmentationPrompt = `
LACROSSE VIDEO SEGMENTATION EXPERT

Your role: Identify and timestamp every significant play, possession change, and coaching moment in this lacrosse video.

SEGMENTATION REQUIREMENTS:
- Timestamp every possession change (±2 seconds accuracy)
- Identify all face-offs, transitions, settled offense/defense
- Note every player touching the ball with jersey numbers
- Mark significant defensive plays, checks, and turnovers
- Identify scoring opportunities, shots, and saves
- Track substitutions and game flow changes
- Flag coaching/teaching moments and technique demonstrations

OUTPUT FORMAT: Create 15-30 detailed segments covering the entire video timeline.

For each segment provide:
- Exact start/end timestamps
- Play description with player numbers
- Play type classification
- Importance level (high/medium/low)
- Players involved with positions if visible

Example Output:
{
  "segments": [
    {
      "startTime": 15.5,
      "endTime": 28.3,
      "description": "Face-off won by #12 (FOGO), clamps and pulls back to #23 (LSM) who starts clearing sequence",
      "players": ["#12", "#23"],
      "playType": "face_off_win",
      "importance": "high"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            segments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  startTime: { type: "number" },
                  endTime: { type: "number" },
                  description: { type: "string" },
                  players: { type: "array", items: { type: "string" } },
                  playType: { type: "string" },
                  importance: { type: "string", enum: ["high", "medium", "low"] }
                },
                required: ["startTime", "endTime", "description", "playType", "importance"]
              }
            }
          },
          required: ["segments"]
        }
      },
      contents: [
        {
          inlineData: {
            data: videoBytes.toString("base64"),
            mimeType: "video/mp4",
          },
        },
        segmentationPrompt
      ],
    });

    const result = JSON.parse(response.text || "{}");
    return result.segments || [];
  }

  // Pass 2: Technical Deep-Dive Analysis
  static async analyzeTechnicalDetails(videoPath: string, segments: VideoSegment[]): Promise<TechnicalBreakdown[]> {
    const videoBytes = fs.readFileSync(videoPath);
    
    // Focus on high-importance segments for detailed technical analysis
    const highImportanceSegments = segments.filter(s => s.importance === 'high').slice(0, 10);
    
    const technicalPrompt = `
ELITE LACROSSE TECHNIQUE ANALYZER

Your role: Division I lacrosse coach with 20+ years experience analyzing player technique and biomechanics.

ANALYSIS FOCUS: Provide exhaustive technical breakdowns of each specified play segment.

TECHNICAL ANALYSIS REQUIREMENTS:
- Complete biomechanical breakdown: stance, grip, hand positioning, footwork, body rotation
- Stick handling technique: cradle mechanics, protection, hand speed, stick position
- Decision-making process: field vision, option recognition, timing, execution
- Advanced lacrosse technique: dodge mechanics, shooting form, passing accuracy, defensive positioning
- Specific improvement recommendations with drill suggestions
- Compare to elite-level standards and recruiting criteria

TARGET SEGMENTS: ${JSON.stringify(highImportanceSegments, null, 2)}

For each segment, provide detailed technical analysis focusing on:
1. Primary player's technique execution
2. Supporting players' positioning and movement
3. Biomechanical efficiency and areas for improvement
4. Decision-making quality and alternatives considered
5. Elite-level coaching recommendations

OUTPUT: Detailed technical breakdowns with 8-12 sentences per analysis.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            breakdowns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "number" },
                  playerNumber: { type: "string" },
                  skillArea: { type: "string" },
                  biomechanics: { type: "string" },
                  decisionMaking: { type: "string" },
                  improvement: { type: "string" },
                  confidence: { type: "number" }
                },
                required: ["timestamp", "skillArea", "biomechanics", "decisionMaking", "improvement", "confidence"]
              }
            }
          },
          required: ["breakdowns"]
        }
      },
      contents: [
        {
          inlineData: {
            data: videoBytes.toString("base64"),
            mimeType: "video/mp4",
          },
        },
        technicalPrompt
      ],
    });

    const result = JSON.parse(response.text || "{}");
    return result.breakdowns || [];
  }

  // Pass 3: Tactical and Strategic Analysis
  static async analyzeTacticalElements(videoPath: string, segments: VideoSegment[]): Promise<TacticalInsight[]> {
    const videoBytes = fs.readFileSync(videoPath);
    
    const tacticalPrompt = `
LACROSSE TACTICAL SYSTEMS EXPERT

Your role: Championship lacrosse coordinator analyzing team systems, formations, and strategic execution.

TACTICAL ANALYSIS FOCUS:
- Offensive and defensive system identification (2-3-1, 1-4-1, 6v6 settled, etc.)
- Player positioning and spacing within systems
- Off-ball movement patterns and timing
- Slide packages and defensive rotations
- Transition opportunities and execution
- Set plays and special situations
- Team coordination and communication
- Strategic decision-making and game management

ANALYSIS DEPTH:
- Identify all formation changes and system adjustments
- Analyze the effectiveness of tactical execution
- Evaluate coaching decisions and strategic timing
- Provide alternative tactical approaches
- Connect individual technique to team systems
- Assess lacrosse IQ and game understanding

TARGET: Analyze team tactical elements across all significant segments.

OUTPUT: Comprehensive tactical insights with strategic recommendations.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "number" },
                  situation: { type: "string" },
                  formation: { type: "string" },
                  execution: { type: "string" },
                  alternatives: { type: "string" },
                  coaching: { type: "string" },
                  confidence: { type: "number" }
                },
                required: ["timestamp", "situation", "formation", "execution", "alternatives", "coaching", "confidence"]
              }
            }
          },
          required: ["insights"]
        }
      },
      contents: [
        {
          inlineData: {
            data: videoBytes.toString("base64"),
            mimeType: "video/mp4",
          },
        },
        tacticalPrompt
      ],
    });

    const result = JSON.parse(response.text || "{}");
    return result.insights || [];
  }

  // Pass 4: Statistical Deep Mining
  static async extractDetailedStatistics(videoPath: string, segments: VideoSegment[]): Promise<StatisticalExtraction[]> {
    const videoBytes = fs.readFileSync(videoPath);
    
    const statisticalPrompt = `
LACROSSE STATISTICS EXTRACTION SPECIALIST

Your role: Advanced analytics expert extracting comprehensive statistical data from lacrosse video.

STATISTICAL EXTRACTION REQUIREMENTS:
Extract and quantify EVERY statistical event including:

OFFENSIVE STATS:
- Goals (with shooter number and assist credits)
- Assists (primary and hockey assists with player numbers)
- Shots (on goal, wide, blocked - with shooter and outcome)
- Ball touches and possession time per player
- Successful dodges and failed dodge attempts
- Turnovers committed (by type: unforced, forced, technical)

DEFENSIVE STATS:
- Caused turnovers (by method: check, interception, forced error)
- Checks (body checks, stick checks, successful/unsuccessful)
- Ground balls picked up (player number and situation)
- Defensive saves and goalie performance
- Slides and defensive rotations executed

SPECIALTY STATS:
- Face-off wins/losses with technique used
- Clearing attempts (successful/failed with player involvement)
- Penalties committed (type, player, time if visible)
- Fast break opportunities created/converted
- Man-up/man-down situations

ADVANCED METRICS:
- Possession efficiency by player
- Shot accuracy percentages
- Decision-making speed (quick release vs. hold time)
- Spacing and positioning grades
- Pressure situations handled

For each statistical event, provide:
- Exact timestamp
- Players involved with numbers
- Detailed outcome description
- Relevant metrics and measurements
- Context (game situation, score if visible)

OUTPUT: Comprehensive statistical breakdown of all measurable events.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            statistics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "number" },
                  playType: { type: "string" },
                  playerInvolved: { type: "string" },
                  outcome: { type: "string" },
                  metrics: { type: "object" }
                },
                required: ["timestamp", "playType", "playerInvolved", "outcome", "metrics"]
              }
            }
          },
          required: ["statistics"]
        }
      },
      contents: [
        {
          inlineData: {
            data: videoBytes.toString("base64"),
            mimeType: "video/mp4",
          },
        },
        statisticalPrompt
      ],
    });

    const result = JSON.parse(response.text || "{}");
    return result.statistics || [];
  }

  // Master function to orchestrate all analysis passes
  static async performComprehensiveAnalysis(videoPath: string): Promise<DetailedAnalysis> {
    console.log("Starting comprehensive multi-pass analysis...");
    
    try {
      // Pass 1: Segment the video
      console.log("Pass 1: Video segmentation...");
      const segments = await this.segmentVideo(videoPath);
      
      // Pass 2: Technical analysis of key segments
      console.log("Pass 2: Technical deep-dive...");
      const technicalBreakdowns = await this.analyzeTechnicalDetails(videoPath, segments);
      
      // Pass 3: Tactical analysis
      console.log("Pass 3: Tactical analysis...");
      const tacticalInsights = await this.analyzeTacticalElements(videoPath, segments);
      
      // Pass 4: Statistical extraction
      console.log("Pass 4: Statistical extraction...");
      const statisticalData = await this.extractDetailedStatistics(videoPath, segments);
      
      // Compile comprehensive analysis
      const detailedAnalysis: DetailedAnalysis = {
        segments,
        technicalBreakdowns,
        tacticalInsights,
        statisticalData,
        playerProfiles: [] // Would be generated from aggregated data
      };
      
      console.log("Comprehensive analysis complete!");
      return detailedAnalysis;
      
    } catch (error) {
      console.error("Error in comprehensive analysis:", error);
      throw error;
    }
  }
}