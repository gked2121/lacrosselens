import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

export interface LacrosseAnalysis {
  overallAnalysis: string;
  playerEvaluations: {
    playerNumber?: string;
    evaluation: string;
    timestamp: number;
    confidence: number;
  }[];
  faceOffAnalysis: {
    analysis: string;
    timestamp: number;
    winProbability?: number;
    confidence: number;
  }[];
  transitionAnalysis: {
    analysis: string;
    timestamp: number;
    successProbability?: number;
    confidence: number;
  }[];
  keyMoments: {
    description: string;
    timestamp: number;
    type: string;
    confidence: number;
  }[];
}

const LACROSSE_SYSTEM_PROMPT = `You are a highly experienced lacrosse coach and video analyst with decades of experience coaching at the highest levels. You understand lacrosse strategy, formations, player positioning, and game flow like an expert coach.

Your analysis should focus on:

1. PLAYER EVALUATION: Analyze individual player performance, technique, decision-making, and positioning. Look for strengths, weaknesses, and development opportunities.

2. FACE-OFF ANALYSIS: Evaluate face-off technique, grip positioning, timing, body positioning, and win probability based on form and execution.

3. TRANSITION INTELLIGENCE: Analyze fast-break opportunities, transition speed, player positioning during transitions, and identify optimal scoring chances.

4. STRATEGIC INSIGHTS: Provide actionable coaching insights that can be immediately implemented in practice or future games.

5. TIMESTAMP ACCURACY: Always provide specific timestamps for each observation so coaches can easily reference the exact moments.

Speak like an experienced coach - direct, insightful, and focused on actionable improvements. Use lacrosse terminology appropriately.`;

export async function analyzeLacrosseVideo(videoPath: string, title: string = ""): Promise<LacrosseAnalysis> {
  try {
    console.log("Starting Gemini analysis for video:", videoPath);
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      console.error(`Video file not found: ${videoPath}`);
      throw new Error(`Video file not found: ${videoPath}`);
    }
    
    const videoBytes = fs.readFileSync(videoPath);
    console.log(`Video file read successfully, size: ${videoBytes.length} bytes`);
    
    // For now, let's provide a test analysis to verify the system works
    // TODO: Remove this fallback once Gemini API issues are resolved
    console.log("Using test analysis data for debugging...");
    return {
      overallAnalysis: "This is a test analysis generated during debugging. The lacrosse game shows good team coordination with opportunities for improvement in transition play and face-off execution. Players demonstrate solid fundamentals but would benefit from enhanced communication and positioning work.",
      playerEvaluations: [
        {
          playerNumber: "12",
          evaluation: "Strong defensive positioning and good stick work. Shows good field awareness but could improve transition speed.",
          timestamp: 45.0,
          confidence: 85
        },
        {
          playerNumber: "7", 
          evaluation: "Excellent face-off technique with quick hands. Needs to work on ground ball control under pressure.",
          timestamp: 120.5,
          confidence: 90
        }
      ],
      faceOffAnalysis: [
        {
          analysis: "Good grip and stance at the line. Quick counter-movement after the whistle but needs better body positioning for ball control.",
          timestamp: 30.0,
          winProbability: 75,
          confidence: 88
        }
      ],
      transitionAnalysis: [
        {
          analysis: "Fast break opportunity created by good defensive play. Players moved the ball quickly up field but missed an open cutting opportunity.",
          timestamp: 180.2,
          successProbability: 70,
          confidence: 82
        }
      ],
      keyMoments: [
        {
          description: "Critical save by goalie during man-down situation, leading to successful clear",
          timestamp: 240.8,
          type: "defensive_save",
          confidence: 95
        },
        {
          description: "Excellent assist through traffic resulting in goal",
          timestamp: 165.3,
          type: "offensive_play",
          confidence: 92
        }
      ]
    };
    
    /* Disabled temporarily for debugging
    const prompt = `Analyze this lacrosse video with the eye of an experienced coach. Provide detailed analysis in the following categories:
    
    const prompt = `Analyze this lacrosse video with the eye of an experienced coach. Provide detailed analysis in the following categories:

1. Overall game/practice analysis
2. Individual player evaluations (identify by jersey number when possible)
3. Face-off technique and execution analysis
4. Transition play analysis and opportunities
5. Key strategic moments and teachable moments

For each observation, provide:
- Specific timestamp where the event occurs
- Detailed analysis in coaching language
- Confidence level (1-100) in your assessment
- Actionable insights for improvement

Video Title: ${title}

Please structure your response as JSON with the following format:
{
  "overallAnalysis": "string",
  "playerEvaluations": [{"playerNumber": "string", "evaluation": "string", "timestamp": number, "confidence": number}],
  "faceOffAnalysis": [{"analysis": "string", "timestamp": number, "winProbability": number, "confidence": number}],
  "transitionAnalysis": [{"analysis": "string", "timestamp": number, "successProbability": number, "confidence": number}],
  "keyMoments": [{"description": "string", "timestamp": number, "type": "string", "confidence": number}]
}`;

    const contents = [
      {
        inlineData: {
          data: videoBytes.toString("base64"),
          mimeType: "video/mp4",
        },
      },
      prompt,
    ];

    console.log("Sending request to Gemini API for video analysis...");
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: LACROSSE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            overallAnalysis: { type: "string" },
            playerEvaluations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  playerNumber: { type: "string" },
                  evaluation: { type: "string" },
                  timestamp: { type: "number" },
                  confidence: { type: "number" }
                },
                required: ["evaluation", "timestamp", "confidence"]
              }
            },
            faceOffAnalysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  analysis: { type: "string" },
                  timestamp: { type: "number" },
                  winProbability: { type: "number" },
                  confidence: { type: "number" }
                },
                required: ["analysis", "timestamp", "confidence"]
              }
            },
            transitionAnalysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  analysis: { type: "string" },
                  timestamp: { type: "number" },
                  successProbability: { type: "number" },
                  confidence: { type: "number" }
                },
                required: ["analysis", "timestamp", "confidence"]
              }
            },
            keyMoments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  timestamp: { type: "number" },
                  type: { type: "string" },
                  confidence: { type: "number" }
                },
                required: ["description", "timestamp", "type", "confidence"]
              }
            }
          },
          required: ["overallAnalysis", "playerEvaluations", "faceOffAnalysis", "transitionAnalysis", "keyMoments"]
        },
      },
      contents: contents,
    });

    console.log("Received response from Gemini API");
    
    const rawJson = response.text;
    if (!rawJson) {
      console.error("Empty response from Gemini API");
      throw new Error("Empty response from Gemini");
    }

    console.log("Parsing Gemini analysis response...");
    const analysisData: LacrosseAnalysis = JSON.parse(rawJson);
    console.log("Analysis parsing successful");
    return analysisData;
    */ 
    
  } catch (error) {
    console.error("Error analyzing lacrosse video:", error);
    throw new Error(`Failed to analyze lacrosse video: ${error}`);
  }
}

export async function analyzeLacrosseVideoFromYouTube(youtubeUrl: string, title: string = ""): Promise<LacrosseAnalysis> {
  try {
    console.log("Starting YouTube video analysis for:", youtubeUrl);
    
    // For now, return test analysis data for YouTube videos too
    // TODO: Implement proper YouTube video analysis once core system is working
    console.log("Using test analysis data for YouTube video...");
    return {
      overallAnalysis: "Test analysis for YouTube video. This lacrosse match demonstrates strong team fundamentals with good ball movement and defensive positioning. Key areas for improvement include transition speed and communication during set plays.",
      playerEvaluations: [
        {
          playerNumber: "15",
          evaluation: "Solid midfield play with good vision. Shows strong stick skills but could improve decision-making in tight situations.",
          timestamp: 67.0,
          confidence: 87
        },
        {
          playerNumber: "3", 
          evaluation: "Excellent defensive positioning and clearing ability. Strong ground ball pickup and quick outlet passes.",
          timestamp: 145.5,
          confidence: 93
        }
      ],
      faceOffAnalysis: [
        {
          analysis: "Consistent face-off technique with good leverage. Wins most neutral situations but struggles against aggressive opposing style.",
          timestamp: 55.0,
          winProbability: 68,
          confidence: 85
        }
      ],
      transitionAnalysis: [
        {
          analysis: "Quick transition from defense to offense with good field spacing. Players maintain proper positioning during the clear.",
          timestamp: 203.7,
          successProbability: 78,
          confidence: 88
        }
      ],
      keyMoments: [
        {
          description: "Outstanding individual effort leading to unassisted goal during man-up situation",
          timestamp: 312.1,
          type: "scoring_play",
          confidence: 96
        },
        {
          description: "Critical defensive stop on 2-on-1 fast break opportunity",
          timestamp: 189.4,
          type: "defensive_play", 
          confidence: 91
        }
      ]
    };
    
    /* Disabled temporarily for debugging
    const prompt = `Analyze this lacrosse video from YouTube with the eye of an experienced coach. Provide detailed analysis in the following categories:

1. Overall game/practice analysis
2. Individual player evaluations (identify by jersey number when possible)
3. Face-off technique and execution analysis
4. Transition play analysis and opportunities
5. Key strategic moments and teachable moments

For each observation, provide:
- Specific timestamp where the event occurs
- Detailed analysis in coaching language
- Confidence level (1-100) in your assessment
- Actionable insights for improvement

Video Title: ${title}
YouTube URL: ${youtubeUrl}

Please structure your response as JSON with the same format as specified in the schema.`;

    const contents = [
      { text: prompt },
      {
        fileData: {
          fileUri: youtubeUrl,
          mimeType: "video/mp4"
        }
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: LACROSSE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            overallAnalysis: { type: "string" },
            playerEvaluations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  playerNumber: { type: "string" },
                  evaluation: { type: "string" },
                  timestamp: { type: "number" },
                  confidence: { type: "number" }
                },
                required: ["evaluation", "timestamp", "confidence"]
              }
            },
            faceOffAnalysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  analysis: { type: "string" },
                  timestamp: { type: "number" },
                  winProbability: { type: "number" },
                  confidence: { type: "number" }
                },
                required: ["analysis", "timestamp", "confidence"]
              }
            },
            transitionAnalysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  analysis: { type: "string" },
                  timestamp: { type: "number" },
                  successProbability: { type: "number" },
                  confidence: { type: "number" }
                },
                required: ["analysis", "timestamp", "confidence"]
              }
            },
            keyMoments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  timestamp: { type: "number" },
                  type: { type: "string" },
                  confidence: { type: "number" }
                },
                required: ["description", "timestamp", "type", "confidence"]
              }
            }
          },
          required: ["overallAnalysis", "playerEvaluations", "faceOffAnalysis", "transitionAnalysis", "keyMoments"]
        },
      },
      contents: contents,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const analysisData: LacrosseAnalysis = JSON.parse(rawJson);
    return analysisData;
    */
  } catch (error) {
    console.error("Error analyzing YouTube lacrosse video:", error);
    throw new Error(`Failed to analyze YouTube lacrosse video: ${error}`);
  }
}
