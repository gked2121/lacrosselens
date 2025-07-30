// Enhanced Prompt System for Maximum Detail Extraction
// This system provides different analysis strategies and prompt chaining approaches

export interface AnalysisStrategy {
  name: string;
  description: string;
  promptChain: string[];
  expectedOutputs: string[];
}

export class EnhancedPromptSystem {
  
  // Strategy 1: Time-Based Sequential Analysis
  static getTimeBasedStrategy(): AnalysisStrategy {
    return {
      name: "Sequential Time Analysis",
      description: "Analyze video in 30-second chunks for maximum detail coverage",
      promptChain: [
        "CHUNK_IDENTIFICATION", 
        "DETAILED_CHUNK_ANALYSIS", 
        "CROSS_CHUNK_PATTERNS",
        "STATISTICAL_AGGREGATION"
      ],
      expectedOutputs: ["segments", "technical_details", "patterns", "comprehensive_stats"]
    };
  }

  // Strategy 2: Player-Focused Deep Dive
  static getPlayerFocusedStrategy(): AnalysisStrategy {
    return {
      name: "Individual Player Analysis",
      description: "Track each visible player throughout the video for comprehensive evaluation",
      promptChain: [
        "PLAYER_IDENTIFICATION",
        "INDIVIDUAL_TRACKING", 
        "SKILL_ASSESSMENT",
        "PERFORMANCE_SUMMARY"
      ],
      expectedOutputs: ["player_roster", "play_by_play", "skill_grades", "recommendations"]
    };
  }

  // Strategy 3: Situational Analysis
  static getSituationalStrategy(): AnalysisStrategy {
    return {
      name: "Game Situation Analysis", 
      description: "Analyze different game situations (face-offs, man-up, transitions, etc.) separately",
      promptChain: [
        "SITUATION_CLASSIFICATION",
        "SITUATION_DEEP_DIVE",
        "TACTICAL_EVALUATION", 
        "COACHING_INSIGHTS"
      ],
      expectedOutputs: ["situation_map", "execution_analysis", "tactical_grade", "coaching_plan"]
    };
  }

  // Advanced Prompt Templates
  static getTimeChunkPrompt(startTime: number, endTime: number): string {
    return `
LACROSSE VIDEO ANALYSIS - TIME SEGMENT ${startTime}s to ${endTime}s

You are Coach Mike Thompson, analyzing this specific ${endTime - startTime}-second segment with microscopic detail.

EXHAUSTIVE ANALYSIS REQUIREMENTS for this time segment:

POSSESSION TRACKING:
- Track every ball touch with player numbers and jersey colors
- Document every possession change with exact cause (turnover, shot, etc.)
- Note ball location and player positioning throughout

TECHNIQUE ANALYSIS:
- Analyze stick work: cradle mechanics, hand positioning, protection techniques
- Evaluate footwork: acceleration, direction changes, body positioning
- Assess decision-making: field vision, option selection, execution timing
- Document shooting mechanics: hand placement, follow-through, accuracy

TACTICAL ELEMENTS:
- Identify offensive/defensive formations and adjustments
- Track off-ball movement patterns and spacing
- Note communication and team coordination
- Evaluate transition execution and defensive slides

STATISTICAL EXTRACTION:
- Count and classify every statistical event (goals, assists, ground balls, etc.)
- Document checks, both successful and unsuccessful
- Track clearing attempts and their outcomes
- Note any penalties or rule violations

COACHING OBSERVATIONS:
- Identify teaching moments and technique corrections needed
- Suggest specific drills for observed weaknesses
- Evaluate game IQ and lacrosse-specific decision making
- Provide recruiting-level assessment for key players

OUTPUT REQUIREMENT: 
Provide 15-20 detailed observations for this time segment, each 4-6 sentences long.
Use precise timestamps and specific lacrosse terminology.
Focus on actionable coaching insights and technical improvements.
`;
  }

  static getPlayerTrackingPrompt(playerNumber: string): string {
    return `
INDIVIDUAL PLAYER ANALYSIS - Player #${playerNumber}

You are an elite lacrosse scout creating a comprehensive evaluation report for Player #${playerNumber}.

COMPREHENSIVE PLAYER EVALUATION:

TECHNICAL SKILLS ASSESSMENT:
- Stick skills: cradling, catching, passing accuracy under pressure
- Shooting: mechanics, accuracy, shot selection, release speed
- Dodging: variety of moves, timing, effectiveness, body control
- Defensive skills: positioning, checking technique, recovery speed

ATHLETIC EVALUATION:
- Speed and acceleration in different situations
- Agility and change of direction ability
- Strength in physical battles and ground ball situations
- Endurance and performance consistency throughout video

LACROSSE IQ ANALYSIS:
- Field vision and awareness of teammates/opponents
- Decision-making speed and accuracy under pressure
- Understanding of game situations and appropriate responses
- Leadership and communication on the field

STATISTICAL TRACKING:
- All statistical events involving this player
- Success rates in different situations (face-offs, clears, shots, etc.)
- Efficiency metrics (turnovers per possession, shot accuracy, etc.)
- Plus/minus impact when player is on/off the field

DEVELOPMENT ASSESSMENT:
- Primary strengths to build upon
- Key weaknesses requiring immediate attention
- Specific drill recommendations for improvement
- Comparison to college recruiting standards
- Position-specific evaluation criteria

GAME IMPACT EVALUATION:
- Influence on team success and momentum
- Performance in pressure situations
- Consistency throughout the game
- Intangibles (hustle, attitude, communication)

OUTPUT REQUIREMENT:
Create a comprehensive scouting report with:
- Overall player grade (A+ to F scale)
- Position-specific evaluation
- College recruiting projection
- Detailed development plan with specific drills
- Game-by-game improvement tracking recommendations
`;
  }

  static getSituationalAnalysisPrompt(situation: string): string {
    return `
LACROSSE SITUATION ANALYSIS - ${situation.toUpperCase()}

You are analyzing all instances of ${situation} situations in this video with championship-level expertise.

SPECIALIZED ${situation.toUpperCase()} ANALYSIS:

EXECUTION EVALUATION:
- Technical execution quality for this specific situation
- Player positioning and spacing optimization
- Timing and coordination between teammates
- Decision-making appropriateness for the situation

TACTICAL ASSESSMENT:
- Formation and system effectiveness
- Strategic approach and game plan execution
- Adjustments made during the situation
- Counter-strategies employed by opposition

COACHING INSIGHTS:
- Teaching points specific to this situation
- Common mistakes and correction methods
- Advanced techniques for elite-level execution
- Practice drill recommendations for improvement

STATISTICAL BREAKDOWN:
- Success rate in this situation type
- Key performance indicators specific to ${situation}
- Player contributions and effectiveness ratings
- Comparison to standard benchmarks

STRATEGIC RECOMMENDATIONS:
- Alternative approaches that could be more effective
- Personnel adjustments for optimal execution
- Timing and game management considerations
- Long-term development strategies for this situation

OUTPUT REQUIREMENT:
Provide detailed analysis of every ${situation} instance with:
- Situation setup and context
- Execution quality assessment
- Outcome evaluation and contributing factors
- Specific coaching recommendations
- Practice priorities for improvement
`;
  }

  // Prompt Chain Orchestrator
  static buildPromptChain(strategy: AnalysisStrategy, videoContext: any): string[] {
    const prompts: string[] = [];
    
    switch (strategy.name) {
      case "Sequential Time Analysis":
        // Create time-based prompts for video segments
        const duration = videoContext.duration || 300; // Default 5 minutes
        const chunkSize = 30; // 30-second chunks
        for (let i = 0; i < duration; i += chunkSize) {
          prompts.push(this.getTimeChunkPrompt(i, Math.min(i + chunkSize, duration)));
        }
        break;
        
      case "Individual Player Analysis":
        // Create player-specific prompts
        const players = videoContext.identifiedPlayers || ["12", "23", "7", "15"];
        players.forEach((player: string) => {
          prompts.push(this.getPlayerTrackingPrompt(player));
        });
        break;
        
      case "Game Situation Analysis":
        // Create situation-specific prompts
        const situations = ["face_off", "man_up", "man_down", "transition", "settled_offense", "clearing"];
        situations.forEach(situation => {
          prompts.push(this.getSituationalAnalysisPrompt(situation));
        });
        break;
    }
    
    return prompts;
  }

  // Meta-Analysis Prompt (combines results from multiple passes)
  static getMetaAnalysisPrompt(previousResults: any[]): string {
    return `
LACROSSE VIDEO META-ANALYSIS

You have received detailed analysis results from multiple specialized passes. Now synthesize this information into a comprehensive coaching report.

PREVIOUS ANALYSIS RESULTS:
${JSON.stringify(previousResults, null, 2)}

META-ANALYSIS REQUIREMENTS:

SYNTHESIS AND PATTERNS:
- Identify recurring themes across all analysis passes
- Connect individual player performances to team success
- Highlight correlations between technical execution and outcomes
- Map tactical decisions to statistical results

COMPREHENSIVE PLAYER RANKINGS:
- Rank all identified players by overall performance
- Provide position-specific evaluations and comparisons
- Identify standout performers and areas of concern
- Create development priority lists for each player

TEAM-LEVEL INSIGHTS:
- Overall team strengths and weaknesses
- System effectiveness and tactical execution quality
- Chemistry and coordination assessment
- Game management and coaching decision evaluation

ACTIONABLE COACHING PLAN:
- Practice priorities based on observed weaknesses
- Individual player development plans
- Team tactical adjustments and system modifications
- Game preparation strategies for future opponents

ADVANCED METRICS:
- Calculate advanced statistics from extracted data
- Provide efficiency ratings and performance indexes
- Create comparison benchmarks and improvement targets
- Generate predictive insights for player development

OUTPUT REQUIREMENT:
Create a comprehensive coaching report that synthesizes all previous analysis into:
- Executive summary with key findings
- Individual player development plans
- Team tactical recommendations
- Practice planning and drill prioritization
- Long-term improvement strategies
`;
  }
}

// Implementation example of how to use the enhanced prompt system
export interface PromptChainResult {
  strategy: string;
  results: any[];
  metaAnalysis: any;
  recommendations: string[];
}