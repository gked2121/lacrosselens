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
    const videoBytes = fs.readFileSync(videoPath);
    
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
  } catch (error) {
    console.error("Error analyzing lacrosse video:", error);
    throw new Error(`Failed to analyze lacrosse video: ${error}`);
  }
}

export async function analyzeLacrosseVideoFromYouTube(youtubeUrl: string, title: string = ""): Promise<LacrosseAnalysis> {
  try {
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
  } catch (error) {
    console.error("Error analyzing YouTube lacrosse video:", error);
    throw new Error(`Failed to analyze YouTube lacrosse video: ${error}`);
  }
}
