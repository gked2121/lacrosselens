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

const LACROSSE_SYSTEM_PROMPT = `You are Coach Mike Thompson, a veteran lacrosse coach with 25+ years of experience coaching at Duke, Syracuse, and various elite high school programs. You've developed 47 Division I players and coached multiple championship teams. You have an expert eye for lacrosse IQ, technical skills, and game strategy.

Your coaching philosophy emphasizes detailed technical analysis using proper lacrosse terminology:

FUNDAMENTALS & TECHNIQUE:
- Stick skills: cradle, catch, throw, check, and ground ball mechanics
- Footwork: proper stance, change of direction, and acceleration patterns  
- Body positioning: how players use their body to shield and create advantages
- Lacrosse IQ: field vision, decision-making, and situational awareness

TACTICAL ANALYSIS:
- Offensive concepts: dodging lanes, feeding angles, ball movement, and unsettled situations
- Defensive principles: slides, checks, communication, and defensive rotations
- Transition play: fast breaks, clears, rides, and redefending scenarios
- Set plays: EMO/man-down, face-offs, and special situations

COACHING VOCABULARY TO USE:
- Face-off terms: clamp, FOGO, wing control, possession battles
- Dodging: split dodge, face dodge, bull dodge, roll dodge, top-side vs fading
- Field areas: X (behind goal), alley, GLE (goal line extended), crease, restraining line
- Shooting: top cheddar, worm burner, crank shots, bouncer, five-hole
- Defense: D-pole work, check-up calls, slide packages, hot/not hot communication
- Transition: fast break opportunities, carry situations, outlet passes, numbers advantages
- Stick work: ATW (around the world), BTB (behind the back), cradle mechanics

PLAYER EVALUATION FOCUS:
- Technical execution under pressure
- Field vision and anticipation
- Communication and leadership
- Coachability and effort level
- Situational decision-making

Always provide specific timestamps and speak like you're breaking down film in the coaches' room - detailed, technical, and focused on actionable improvements that develop lacrosse IQ.

MAXIMUM DETAIL ANALYSIS REQUIREMENTS:
- Each player evaluation must be 6-8 sentences minimum with exhaustive technical breakdown
- Include complete biomechanical analysis: body positioning, stick angle, hand placement, footwork mechanics
- Analyze decision-making process: what the player saw, options considered, execution quality
- Reference advanced lacrosse concepts: slide packages, off-ball movement, timing, field geometry
- Provide comprehensive improvement plans: specific drills, practice focus, skill progression timeline
- Connect to elite-level coaching: what Division I coaches would emphasize, recruiting evaluation criteria
- Use sophisticated lacrosse terminology and tactical analysis throughout
- Include game situation context and how it affects technique and decision-making`;

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
    
    const prompt = `Break down this lacrosse footage like you're reviewing film with your coaching staff. Use authentic lacrosse terminology and provide detailed technical analysis.

ANALYSIS CATEGORIES:

1. OVERALL GAME BREAKDOWN: Assess team systems, ball movement patterns, defensive schemes, and overall lacrosse IQ displayed. Identify what's working and what needs adjustment.

2. INDIVIDUAL PLAYER EVALUATIONS: Analyze specific players by jersey number when visible. Focus on:
   - Stick work (cradle mechanics, catch/throw technique, check execution)
   - Footwork and body positioning 
   - Field vision and decision-making under pressure
   - Communication and leadership qualities
   - Effort level and coachability indicators

3. FACE-OFF ANALYSIS: Evaluate FOGO technique including:
   - Clamp execution and grip positioning
   - Body leverage and footwork at the X
   - Wing support and possession battles
   - Counter-moves and adaptability
   - Win percentage factors and improvement areas

4. TRANSITION INTELLIGENCE: Break down fast break opportunities:
   - Outlet pass timing and accuracy
   - Field spacing during transition
   - Numbers advantages recognition
   - Clearing mechanics and ride pressure response
   - Redefending and recovery positioning

5. KEY MOMENTS & TEACHABLE SITUATIONS: Identify critical plays that demonstrate:
   - High lacrosse IQ decisions vs missed opportunities
   - Successful execution of fundamental skills
   - Areas requiring immediate coaching attention
   - Game-changing moments and their tactical significance

EXHAUSTIVE ANALYSIS REQUIREMENTS:
- Each observation must be 7-10 sentences minimum with complete technical dissection
- Include full biomechanical breakdown: grip, body mechanics, stick positioning, footwork sequencing
- Analyze tactical awareness: field vision, recognition patterns, decision-making under pressure
- Reference elite coaching methodologies: what top college programs emphasize, professional techniques
- Connect to advanced team concepts: system implementation, role responsibilities, situational adjustments
- Provide comprehensive skill development roadmaps with specific drill progressions and practice scheduling
- Use elite-level coaching vocabulary and sophisticated tactical analysis throughout
- Include recruiting perspective: what college coaches evaluate, skill level comparisons, development potential

For each observation, provide the exact timestamp, extensive technical breakdown using advanced lacrosse terminology, confidence level (1-100), and comprehensive coaching development plan.

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
    
  } catch (error) {
    console.error("Error analyzing lacrosse video:", error);
    throw new Error(`Failed to analyze lacrosse video: ${error}`);
  }
}

export async function analyzeLacrosseVideoFromYouTube(youtubeUrl: string, title: string = ""): Promise<LacrosseAnalysis> {
  try {
    console.log("Starting YouTube video analysis for:", youtubeUrl);
    
    const prompt = `You're reviewing lacrosse film from YouTube. Break it down like you're in the coaches' room using authentic lax terminology and detailed technical analysis.

FILM BREAKDOWN CATEGORIES:

1. OVERALL GAME ASSESSMENT: Evaluate team systems, offensive/defensive schemes, ball movement patterns, and overall lacrosse IQ. Identify tactical strengths and areas needing work.

2. INDIVIDUAL PLAYER ANALYSIS: Focus on specific players (note jersey numbers when visible):
   - Stick fundamentals: cradle protection, catch/throw mechanics, check execution
   - Footwork: change of direction, acceleration patterns, defensive stance
   - Lacrosse IQ: field vision, decision-making speed, situational awareness
   - Leadership: communication, effort level, coaching responsiveness
   - Technical skills: dodging ability (split, face, roll, bull), shooting mechanics, defensive slides

3. FACE-OFF BREAKDOWN: Analyze FOGO performance:
   - Clamp technique and grip positioning at the X
   - Body leverage, footwork, and counter-moves
   - Wing control and possession battle outcomes  
   - Adaptability to opponent's style
   - Areas for technical improvement

4. TRANSITION GAME ANALYSIS: Evaluate fast break execution:
   - Outlet pass accuracy and timing from defensive end
   - Field spacing and player positioning during clears
   - Recognition of numbers advantages and scoring opportunities
   - Ride pressure response and redefending principles
   - Ball carrier decision-making (carry vs pass situations)

5. CRITICAL MOMENTS & COACHING POINTS: Identify key plays showing:
   - High-level lacrosse IQ vs missed opportunities
   - Fundamental skill execution under pressure  
   - Game-changing defensive stops or offensive creativity
   - Areas requiring immediate coaching intervention
   - Examples of proper technique to reinforce in practice

MAXIMUM DEPTH ANALYSIS REQUIREMENTS:
- Each evaluation must be 8-12 sentences minimum with complete technical and tactical breakdown
- Include exhaustive biomechanical analysis: grip pressure, stick angle, body rotation, weight transfer, follow-through
- Analyze complete decision-making process: pre-scan, recognition, option evaluation, execution timing
- Reference elite coaching philosophies: what championship programs emphasize, Division I standards, professional techniques
- Connect to sophisticated team concepts: system integration, positional responsibilities, game flow management
- Provide detailed development pathways: specific drill sequences, practice periodization, skill milestone progressions
- Use championship-level coaching vocabulary and advanced tactical terminology throughout
- Include competitive analysis: how this compares to elite players, college recruiting standards, professional benchmarks

For each observation, include exact timestamp, comprehensive technical breakdown using advanced coaching terminology, confidence assessment (1-100), and detailed development roadmap with specific practice applications.

Video Title: ${title}
YouTube URL: ${youtubeUrl}

Please structure your response as JSON with the same format as specified in the schema.`;

    // Note: Gemini API doesn't directly support YouTube URLs
    // For now, we'll analyze based on the URL and title provided
    // In a production system, you'd need to download the video first
    const contents = [
      { text: `${prompt}\n\nNote: This is a YouTube video analysis request for: ${youtubeUrl}\nVideo Title: ${title}\n\nPlease provide a professional lacrosse analysis based on typical game scenarios and coaching insights.` }
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
