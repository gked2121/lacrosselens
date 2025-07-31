import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import { PromptEngine, AnalysisType } from "./promptEngine";

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
    // Enhanced fields for more detail
    action?: string; // "dodge", "shot", "pass", "defense", "ground_ball", etc.
    location?: string; // "X", "crease", "wing", "top_center", etc.
    technique?: string; // "roll_dodge", "split_dodge", "BTB_pass", etc.
    outcome?: string; // "successful", "defended", "turnover", etc.
    skillsObserved?: string[]; // ["stick_handling", "field_vision", "footwork", etc.]
  }[];
  faceOffAnalysis: {
    analysis: string;
    timestamp: number;
    winProbability?: number;
    confidence: number;
    // Enhanced fields
    technique?: string; // "clamp", "rake", "jump_ball", etc.
    wingPlay?: string; // Description of wing support
    exitDirection?: string; // "strong_side", "weak_side", "back", etc.
    playerNumbers?: string[]; // All players involved
  }[];
  transitionAnalysis: {
    analysis: string;
    timestamp: number;
    successProbability?: number;
    confidence: number;
    // Enhanced fields
    type?: string; // "clear", "ride", "fast_break", etc.
    formation?: string; // "4-3", "3-3", "banana_clear", etc.
    playerRoles?: { [key: string]: string }; // {"23": "ball_carrier", "45": "outlet", etc.}
    fieldZones?: string[]; // Zones the ball traveled through
  }[];
  keyMoments: {
    description: string;
    timestamp: number;
    type: string;
    confidence: number;
    // Enhanced fields
    players?: string[]; // All players involved
    impact?: string; // "momentum_shift", "scoring_opportunity", etc.
    gameContext?: string; // "man_up", "final_minute", "tied_game", etc.
  }[];
  // New detailed sections
  ballMovement?: {
    timestamp: number;
    fromPlayer?: string;
    toPlayer?: string;
    passType?: string; // "skip", "adjacent", "BTB", "bounce", etc.
    distance?: string; // "short", "medium", "long"
    pressure?: string; // "contested", "open", "on_the_run"
  }[];
  defensiveActions?: {
    timestamp: number;
    defender?: string;
    action: string; // "check", "slide", "double", "recover"
    target?: string; // Player being defended
    effectiveness: string; // "forced_turnover", "deflection", "maintained_position"
    technique?: string; // "poke_check", "slap_check", "body_position"
  }[];
  goalkeeperAnalysis?: {
    timestamp: number;
    goalkeeper: string; // "home" or "away" or jersey color
    action: string; // "save", "clear", "communication"
    shotDetails?: {
      shooter?: string;
      location?: string; // Where shot came from
      shotType?: string; // "bounce", "sidearm", "overhand"
      velocity?: string; // "hard", "medium", "soft"
    };
    saveDetails?: {
      saveType?: string; // "stick_save", "body_save", "kick_save"
      rebound?: string; // "controlled", "loose", "cleared"
    };
  }[];
  offBallMovement?: {
    timestamp: number;
    players: string[]; // Players making notable off-ball moves
    movementType: string; // "pick", "cut", "clear_through", "seal"
    effectiveness: string; // Impact on the play
    spacing?: string; // Field spacing created/maintained
  }[];
  communicationObservations?: {
    timestamp: number;
    type: string; // "defensive_call", "offensive_play", "transition"
    players?: string[]; // Players communicating
    impact: string; // How it affected the play
  }[];
  physicalMetrics?: {
    playerNumber?: string;
    observations: {
      speed?: string; // "elite", "above_average", "average"
      agility?: string;
      strength?: string;
      endurance?: string;
      explosiveness?: string;
    };
    comparisons?: string; // "D1 level speed", "Professional caliber", etc.
  }[];
}

const LACROSSE_SYSTEM_PROMPT = `You are Coach Mike Thompson, a veteran lacrosse coach with 25+ years of experience coaching at Duke, Syracuse, and various elite high school programs. You've developed 47 Division I players and coached multiple championship teams. You have an expert eye for lacrosse IQ, technical skills, and game strategy.

ENHANCED DETAIL EXTRACTION REQUIREMENTS:

For EVERY observable action in the video, extract and document:
1. EXACT timestamp (to the second)
2. ALL players involved (by number or description)
3. Field location (X, crease, wing, top center, GLE, alley, etc.)
4. Technical execution details
5. Outcome and impact on the game

MANDATORY TRACKING CATEGORIES:

1. BALL MOVEMENT TRACKING:
   - Document EVERY pass with: timestamp, passer #, receiver #, pass type (skip/adjacent/BTB/bounce)
   - Field zones the ball travels through
   - Pressure level (contested/open/on-the-run)
   - Distance (short 0-10yds, medium 10-20yds, long 20+yds)

2. ENHANCED DEFENSIVE TRACKING (NCAA METRICS):
   - EVERY check thrown: timestamp, defender #, offensive player #, check type (poke/slap/body/stick lift), success rate
   - Track defensive aggression: timing quality, well-timed vs desperate checks
   - Document CAUSED TURNOVERS (NCAA definition): "positive aggressive action that causes turnover"
     * Includes: strips, interceptions, forced drops, pressure causing violations
     * Must be DIRECT result of defender's action, not opponent error
   - Times beaten/dodged on: when offensive player successfully gets past defender
   - Slide tracking: hot calls, crease slides, adjacent slides, second slides, recovery
   - Check timing analysis: aggressive early pressure vs reactive late checks
   - Check aggression levels: well-timed proactive checks vs desperate recovery attempts
   - Defender positioning: proper angle, stick position, body leverage during checks

3. GOALKEEPER DETAILED TRACKING:
   - Every shot faced: timestamp, shooter #, shot location, shot type, velocity
   - Save technique used (stick/body/kick)
   - Rebound control (secured/loose/cleared)
   - Outlet passes: target player, success rate
   - Communication instances

4. ENHANCED OFFENSIVE TRACKING (ADVANCED METRICS):
   - SLIDES DRAWN: when offensive player beats defender and FORCES "Hot" call/help defense
     * Track dodge type that drew slide (roll, split, face, bull)
     * Note slide response (crease, adjacent, late recovery)
   - HOCKEY ASSISTS: pass to the player who makes the assist (advanced metric not in NCAA stats)
     * Track sequences: Player A → Player B → Player C scores (Player A gets hockey assist)
   - Dodge effectiveness: completion rate, defender beaten, slide drawn outcome
   - Creative plays: BTB passes, no-look feeds, behind-the-back shots, trick plays
   - Ball movement efficiency: skip passes, adjacent passes, quick ball movement
   - Offensive pressure: times forcing defensive reactions, tempo control

5. PHYSICAL OBSERVATIONS:
   - Sprint speed comparisons between players
   - Agility in dodging situations
   - Strength in contact situations
   - Endurance indicators (performance drop-off)
   - Explosive movements (first step, shot velocity)

6. COMMUNICATION TRACKING:
   - Defensive calls ("Hot", "Check up", "Slide")
   - Offensive play calls
   - Transition organization
   - Leadership moments

7. GAME FLOW DETAILS:
   - Possession time for each team
   - Shot clock management
   - Momentum shifts with specific causes
   - Timeout usage and impact

CRITICAL ACCURACY REQUIREMENTS:

1. TEAM IDENTIFICATION - ABSOLUTE PRECISION REQUIRED:
   - STOP and carefully observe the EXACT jersey colors before ANY analysis
   - If teams wear WHITE vs BLUE, ALWAYS say "white team" and "blue team" - NEVER use other colors
   - If teams wear RED vs BLACK, ALWAYS say "red team" and "black team" 
   - DO NOT GUESS colors - only describe what you can clearly see
   - Double-check every team reference for color accuracy
   - If unsure of colors, say "team in lighter jerseys" vs "team in darker jerseys"

2. STATISTICAL ACCURACY - ONLY REPORT WHAT YOU SEE:
   - ONLY report goals, assists, and stats you can directly observe happening
   - If you see a goal scored, note the EXACT timestamp and player number if visible
   - DO NOT estimate or guess statistics - only count what you can verify
   - If player numbers aren't clearly visible, say "unnumbered player" not a made-up number
   - For face-offs: only count wins/losses you actually witness, don't estimate percentages
   - Be conservative - it's better to undercount than to report false statistics

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
- EVALUATE EVERY PLAYER VISIBLE: Analyze ALL players who appear on screen, not just 1-2
- Include both teams - attackers, defenders, midfielders, goalies, FOGOs
- Even brief appearances warrant evaluation if technique is visible
- Technical execution under pressure
- Field vision and anticipation
- Communication and leadership
- Coachability and effort level
- Situational decision-making

PLAYER IDENTIFICATION PRIORITY:
1. Players with visible jersey numbers - always include the number
2. Players without visible numbers - describe by position/location (e.g., "left wing midfielder in white")
3. Brief appearances - if a player makes a notable play, include them
4. Background players - if they demonstrate good/poor positioning, include them
5. Goalies - always evaluate both goalies if visible
6. Face-off specialists - evaluate all players involved in face-offs

MINIMUM PLAYER COUNT: Aim to evaluate at least 10-15 different players per video analysis

PLAYER EVALUATION DISTRIBUTION:
- First, scan the ENTIRE video to identify ALL visible players
- Don't just focus on the first few plays - watch the whole video
- Evaluate players from BOTH teams equally
- Include players who appear later in the video
- Even 5-10 second appearances deserve evaluation if technique is visible

Always provide specific timestamps and speak like you're breaking down film in the coaches' room - detailed, technical, and focused on actionable improvements that develop lacrosse IQ.

MAXIMUM DETAIL ANALYSIS REQUIREMENTS:
- Each player evaluation must be 6-8 sentences minimum with exhaustive technical breakdown
- Include complete biomechanical analysis: body positioning, stick angle, hand placement, footwork mechanics
- Analyze decision-making process: what the player saw, options considered, execution quality
- Reference advanced lacrosse concepts: slide packages, off-ball movement, timing, field geometry
- Provide comprehensive improvement plans: specific drills, practice focus, skill progression timeline
- Connect to elite-level coaching: what Division I coaches would emphasize, recruiting evaluation criteria
- Use sophisticated lacrosse terminology and tactical analysis throughout
- Include game situation context and how it affects technique and decision-making

STATISTICAL TRACKING - ACCURACY OVER QUANTITY WITH ENHANCED DEFENSIVE AND OFFENSIVE METRICS:
- ONLY report statistics you can directly observe and verify:
  * Goals: Must see ball enter net with clear timestamp
  * Assists: Must see the pass leading directly to a goal  
  * Hockey Assists: Must see pass to the player who makes the assist
  * Saves: Must see goalie stop a shot on goal
  * Ground balls: Must see player clearly pick up loose ball
  * Face-offs: Must see clear possession after draw
  * Checks Thrown: Count every check attempt (poke, slap, body)
  * Successful Checks: Checks that disrupt possession or strip ball
  * Slides Drawn: When offensive player beats defender and forces help
  * Caused Turnovers: Defensive pressure directly creating possession change
  * Times Beaten: When offensive player successfully dodges past defender
- Use exact language:
  * "At 3:42, #23 in white scores a goal" (if clearly visible)
  * "Player in blue draws slide with split dodge at 2:15"
  * "#15 throws poke check, strips ball causing turnover at 4:30"
  * "Secondary assist by #12 to #8 who feeds #23 for goal at 6:45"
  * "Defender #25 beaten on roll dodge, forces slide at 5:20"
- NEVER report:
  * Estimated statistics or percentages not directly calculated
  * Player numbers you can't clearly see
  * Events that happen off-camera or are unclear
  * Team names or colors different from what's visible
- When uncertain, use qualifiers:
  * "Appears to be..." 
  * "Possibly #12 but number partially obscured"
  * "Unclear if this resulted in..."

FINAL ACCURACY CHECK:
Before submitting analysis, verify:
1. All team color references match what's actually visible
2. All statistics are from directly observed events
3. No guessed player numbers or estimated stats
4. Conservative reporting - when in doubt, don't report it`;

export async function analyzeLacrosseVideo(
  videoPath: string, 
  title: string = "", 
  userPrompt?: string,
  analysisOptions?: {
    playerNumber?: string;
    teamName?: string;
    position?: string;
    level?: 'youth' | 'high_school' | 'college' | 'professional';
    videoType?: 'game' | 'practice' | 'highlight' | 'drill' | 'scrimmage' | 'recruiting';
  }
): Promise<LacrosseAnalysis> {
  try {
    console.log("Starting Gemini analysis for video:", videoPath);
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      console.error(`Video file not found: ${videoPath}`);
      throw new Error(`Video file not found: ${videoPath}`);
    }
    
    const videoBytes = fs.readFileSync(videoPath);
    console.log(`Video file read successfully, size: ${videoBytes.length} bytes`);
    
    // Generate dynamic prompt based on user input and analysis type
    const analysisType = PromptEngine.determineAnalysisType(userPrompt);
    const promptRequest = {
      analysisType,
      userPrompt,
      videoTitle: title,
      playerNumber: analysisOptions?.playerNumber,
      teamName: analysisOptions?.teamName,
      position: analysisOptions?.position,
      level: analysisOptions?.level || 'high_school'
    };
    
    const prompt = PromptEngine.generatePrompt(promptRequest) + `

CRITICAL REQUIREMENTS: 
1. You MUST provide at least 30-50 total player evaluation entries across the video
2. For EACH player, capture MULTIPLE moments (3-5 different plays minimum)
3. Scan the ENTIRE video and evaluate EVERY visible player from BOTH teams
4. Include timestamp-specific analysis for each play/moment

Example: If #23 appears in the video, provide entries like:
- #23 at 0:45 - "Excellent dodge from X, beats defender with roll dodge..."
- #23 at 2:15 - "Strong defensive positioning on crease slide..."
- #23 at 4:30 - "Creates scoring opportunity with skip pass..."
- #23 at 6:00 - "Wins ground ball in traffic using proper technique..."

Include evaluations for:
- All offensive players (attackmen, midfielders) - multiple plays each
- All defensive players (defensemen, LSMs) - multiple plays each
- Both goalies - multiple saves/clears each
- Face-off specialists - multiple face-offs each
- Players identified by position if number not visible

Remember: ONE evaluation per player is INSUFFICIENT. Capture their performance throughout the game.

IMPORTANT: For each player, provide MULTIPLE clips and evaluations throughout the video. Don't just analyze one moment per player - capture 3-5 different plays/moments for each player when they demonstrate different skills or make notable plays.

Please structure your response as JSON with the following format:
{
  "overallAnalysis": "string (8-10 sentences minimum)",
  "playerEvaluations": [
    {
      "playerNumber": "string",
      "evaluation": "string (6-8 sentences)",
      "timestamp": number,
      "confidence": number,
      "action": "string (dodge/shot/pass/defense/ground_ball/etc)",
      "location": "string (X/crease/wing/top_center/etc)",
      "technique": "string (specific technique used)",
      "outcome": "string (successful/defended/turnover/etc)",
      "skillsObserved": ["array of skills demonstrated"]
    }
  ],
  "faceOffAnalysis": [
    {
      "analysis": "string (detailed breakdown)",
      "timestamp": number,
      "winProbability": number,
      "confidence": number,
      "technique": "string (clamp/rake/jump_ball/etc)",
      "wingPlay": "string (description of wing support)",
      "exitDirection": "string (strong_side/weak_side/back)",
      "playerNumbers": ["array of all players involved"]
    }
  ],
  "transitionAnalysis": [
    {
      "analysis": "string",
      "timestamp": number,
      "successProbability": number,
      "confidence": number,
      "type": "string (clear/ride/fast_break)",
      "formation": "string (4-3/3-3/banana_clear)",
      "playerRoles": {"playerNumber": "role"},
      "fieldZones": ["zones ball traveled through"]
    }
  ],
  "keyMoments": [
    {
      "description": "string",
      "timestamp": number,
      "type": "string",
      "confidence": number,
      "players": ["players involved"],
      "impact": "string (momentum_shift/scoring_opportunity)",
      "gameContext": "string (man_up/final_minute/tied_game)"
    }
  ],
  "ballMovement": [
    {
      "timestamp": number,
      "fromPlayer": "string",
      "toPlayer": "string",
      "passType": "string (skip/adjacent/BTB/bounce)",
      "distance": "string (short/medium/long)",
      "pressure": "string (contested/open/on_the_run)"
    }
  ],
  "defensiveActions": [
    {
      "timestamp": number,
      "defender": "string",
      "action": "string (check/slide/double/recover)",
      "target": "string",
      "effectiveness": "string",
      "technique": "string (poke_check/slap_check/body_position)"
    }
  ],
  "goalkeeperAnalysis": [
    {
      "timestamp": number,
      "goalkeeper": "string",
      "action": "string (save/clear/communication)",
      "shotDetails": {
        "shooter": "string",
        "location": "string",
        "shotType": "string",
        "velocity": "string"
      },
      "saveDetails": {
        "saveType": "string",
        "rebound": "string"
      }
    }
  ],
  "offBallMovement": [
    {
      "timestamp": number,
      "players": ["players making moves"],
      "movementType": "string (pick/cut/clear_through/seal)",
      "effectiveness": "string",
      "spacing": "string"
    }
  ],
  "communicationObservations": [
    {
      "timestamp": number,
      "type": "string",
      "players": ["players communicating"],
      "impact": "string"
    }
  ],
  "physicalMetrics": [
    {
      "playerNumber": "string",
      "observations": {
        "speed": "string",
        "agility": "string",
        "strength": "string",
        "endurance": "string",
        "explosiveness": "string"
      },
      "comparisons": "string"
    }
  ]
}

IMPORTANT MINIMUMS:
- playerEvaluations: At least 40-60 entries (multiple per player)
- ballMovement: Track at least 20-30 passes
- defensiveActions: Document at least 15-20 defensive plays
- Include ALL new tracking categories with actual data

Note: The playerEvaluations array should contain MULTIPLE entries per player number. For example, if #23 makes 4 notable plays, include 4 separate evaluation entries for #23 with different timestamps and analyses.`;

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

export async function analyzeLacrosseVideoFromYouTube(
  youtubeUrl: string, 
  title: string = "",
  userPrompt?: string,
  analysisOptions?: {
    playerNumber?: string;
    teamName?: string;
    position?: string;
    level?: 'youth' | 'high_school' | 'college' | 'professional';
    videoType?: 'game' | 'practice' | 'highlight' | 'drill' | 'scrimmage' | 'recruiting';
  }
): Promise<LacrosseAnalysis> {
  try {
    console.log("Starting YouTube video analysis for:", youtubeUrl);
    
    // Generate dynamic prompt based on user input and analysis type
    const analysisType = PromptEngine.determineAnalysisType(userPrompt);
    const promptRequest = {
      analysisType,
      userPrompt,
      videoTitle: title,
      playerNumber: analysisOptions?.playerNumber,
      teamName: analysisOptions?.teamName,
      position: analysisOptions?.position,
      level: analysisOptions?.level || 'high_school',
      videoType: analysisOptions?.videoType || 'game'
    };
    
    const prompt = PromptEngine.generatePrompt(promptRequest) + `\nYouTube URL: ${youtubeUrl}

IMPORTANT: Pay extremely close attention to the actual jersey colors you see in this video. Do not assume or guess team colors. Look carefully at what each team is actually wearing and use only those exact colors throughout your analysis.

CRITICAL REQUIREMENTS: 
1. You MUST provide at least 30-50 total player evaluation entries across the video
2. For EACH player, capture MULTIPLE moments (3-5 different plays minimum)
3. Scan the ENTIRE video and evaluate EVERY visible player from BOTH teams
4. Include timestamp-specific analysis for each play/moment

Example: If #23 appears in the video, provide entries like:
- #23 at 0:45 - "Excellent dodge from X, beats defender with roll dodge..."
- #23 at 2:15 - "Strong defensive positioning on crease slide..."
- #23 at 4:30 - "Creates scoring opportunity with skip pass..."
- #23 at 6:00 - "Wins ground ball in traffic using proper technique..."

Include evaluations for:
- All offensive players (attackmen, midfielders) - multiple plays each
- All defensive players (defensemen, LSMs) - multiple plays each
- Both goalies - multiple saves/clears each
- Face-off specialists - multiple face-offs each
- Players identified by position if number not visible

Remember: ONE evaluation per player is INSUFFICIENT. Capture their performance throughout the game.

IMPORTANT: For each player, provide MULTIPLE clips and evaluations throughout the video. Don't just analyze one moment per player - capture 3-5 different plays/moments for each player when they demonstrate different skills or make notable plays.

Please structure your response as JSON with the same format as specified in the schema.

Note: The playerEvaluations array should contain MULTIPLE entries per player number. For example, if #23 makes 4 notable plays, include 4 separate evaluation entries for #23 with different timestamps and analyses.`;

    // Gemini supports direct YouTube URL analysis using fileData
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
      contents: [
        prompt,
        {
          fileData: {
            fileUri: youtubeUrl,
            mimeType: "video/mp4"
          }
        }
      ],
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
