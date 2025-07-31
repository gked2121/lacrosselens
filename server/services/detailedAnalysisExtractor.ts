import type { LacrosseAnalysis } from "./gemini";

export interface DetailedAnalysisMetrics {
  // Player-specific detailed tracking
  playerMetrics: {
    [playerNumber: string]: {
      totalClips: number;
      actions: {
        // Offensive metrics
        dodges: number;
        shots: number;
        passes: number;
        assists: number;
        goals: number;
        slidesDrawn: number; // Times beat defender and drew help defense
        hockeyAssists: number; // Pass to player who made assist
        turnovers: number;
        
        // Defensive metrics
        checksThrown: number; // Total defensive contact attempts
        successfulChecks: number; // Checks that disrupted opponent
        causedTurnovers: number; // Direct turnovers from defensive pressure
        timesDodgedOn: number; // Times beaten by offensive player
        timesSlid: number; // Times provided help defense
        groundBalls: number;
        saves: number; // For goalies
        clears: number; // Successfully moving ball out of defensive zone
      };
      locations: string[];
      techniques: string[];
      skillsObserved: string[];
      averageConfidence: number;
      timeRange: {
        firstAppearance: number;
        lastAppearance: number;
      };
    };
  };
  
  // Team-level metrics
  teamMetrics: {
    [teamColor: string]: {
      possessionTime: number;
      shotsOnGoal: number;
      turnovers: number;
      clears: { successful: number; failed: number };
      faceOffsWon: number;
      faceOffsLost: number;
      transitionOpportunities: number;
      players: string[];
    };
  };
  
  // Game flow analysis
  gameFlow: {
    momentumShifts: {
      timestamp: number;
      description: string;
      impact: "major" | "moderate" | "minor";
    }[];
    scoringRuns: {
      team: string;
      startTime: number;
      endTime: number;
      goals: number;
    }[];
    criticalPeriods: {
      timestamp: number;
      duration: number;
      description: string;
    }[];
  };
  
  // Advanced statistics
  advancedStats: {
    ballMovementPatterns: {
      averagePassesPerPossession: number;
      skipPassFrequency: number;
      adjacentPassFrequency: number;
      behindTheBackFrequency: number;
    };
    defensiveMetrics: {
      totalChecksThrown: number;
      checkSuccessRate: number; // successful checks / total checks
      causedTurnoverRate: number; // turnovers / defensive possessions
      slidesPerPossession: number;
      averageSlideRecoveryTime: number;
      clearingSuccessRate: number;
      groundBallsWon: number;
      aggressiveCheckCount: number; // Well-timed aggressive checks
      timesBeaten: number; // Times defenders were beaten
    };
    offensiveMetrics: {
      dodgeSuccessRate: number;
      assistToGoalRatio: number;
      shotAccuracy: number;
      timeOfPossession: number;
      totalSlidesDrawn: number; // Times offensive players beat defender and drew help
      hockeyAssistTotal: number; // Secondary assists (pass to assist player)
      creativePlays: number; // Behind-the-back, no-look passes, etc.
      ballMovementEfficiency: number; // Passes per goal scored
    };
  };
  
  // Communication and leadership
  communicationTracking: {
    defensiveCalls: number;
    offensiveSets: number;
    transitionOrganization: number;
    leadershipMoments: string[];
  };
  
  // Physical performance indicators
  physicalPerformance: {
    sprintCount: number;
    highIntensityPeriods: number;
    fatigueIndicators: string[];
    explosivePlays: number;
  };
}

export class DetailedAnalysisExtractor {
  static extractDetailedMetrics(analysis: LacrosseAnalysis): DetailedAnalysisMetrics {
    const metrics: DetailedAnalysisMetrics = {
      playerMetrics: {},
      teamMetrics: {},
      gameFlow: {
        momentumShifts: [],
        scoringRuns: [],
        criticalPeriods: []
      },
      advancedStats: {
        ballMovementPatterns: {
          averagePassesPerPossession: 0,
          skipPassFrequency: 0,
          adjacentPassFrequency: 0,
          behindTheBackFrequency: 0
        },
        defensiveMetrics: {
          totalChecksThrown: 0,
          checkSuccessRate: 0,
          causedTurnoverRate: 0,
          slidesPerPossession: 0,
          averageSlideRecoveryTime: 0,
          clearingSuccessRate: 0,
          groundBallsWon: 0,
          aggressiveCheckCount: 0,
          timesBeaten: 0
        },
        offensiveMetrics: {
          dodgeSuccessRate: 0,
          assistToGoalRatio: 0,
          shotAccuracy: 0,
          timeOfPossession: 0,
          totalSlidesDrawn: 0,
          hockeyAssistTotal: 0,
          creativePlays: 0,
          ballMovementEfficiency: 0
        }
      },
      communicationTracking: {
        defensiveCalls: 0,
        offensiveSets: 0,
        transitionOrganization: 0,
        leadershipMoments: []
      },
      physicalPerformance: {
        sprintCount: 0,
        highIntensityPeriods: 0,
        fatigueIndicators: [],
        explosivePlays: 0
      }
    };
    
    // Extract player metrics from evaluations
    analysis.playerEvaluations.forEach(evaluation => {
      const playerKey = evaluation.playerNumber || "Unknown Player";
      
      if (!metrics.playerMetrics[playerKey]) {
        metrics.playerMetrics[playerKey] = {
          totalClips: 0,
          actions: {
            // Offensive metrics
            dodges: 0,
            shots: 0,
            passes: 0,
            assists: 0,
            goals: 0,
            slidesDrawn: 0,
            hockeyAssists: 0,
            turnovers: 0,
            
            // Defensive metrics
            checksThrown: 0,
            successfulChecks: 0,
            causedTurnovers: 0,
            timesDodgedOn: 0,
            timesSlid: 0,
            groundBalls: 0,
            saves: 0,
            clears: 0
          },
          locations: [],
          techniques: [],
          skillsObserved: [],
          averageConfidence: 0,
          timeRange: {
            firstAppearance: evaluation.timestamp,
            lastAppearance: evaluation.timestamp
          }
        };
      }
      
      const player = metrics.playerMetrics[playerKey];
      player.totalClips++;
      
      // Update time range
      player.timeRange.firstAppearance = Math.min(player.timeRange.firstAppearance, evaluation.timestamp);
      player.timeRange.lastAppearance = Math.max(player.timeRange.lastAppearance, evaluation.timestamp);
      
      // Extract actions from evaluation text with enhanced defensive and offensive tracking
      const evalText = evaluation.evaluation.toLowerCase();
      
      // Offensive metrics
      if (evalText.includes("dodge") || evalText.includes("split") || evalText.includes("roll")) player.actions.dodges++;
      if (evalText.includes("shot") || evalText.includes("shoot") || evalText.includes("rip")) player.actions.shots++;
      if (evalText.includes("pass") || evalText.includes("feed") || evalText.includes("dish")) player.actions.passes++;
      if (evalText.includes("assist") && !evalText.includes("hockey")) player.actions.assists++;
      if (evalText.includes("goal") && (evalText.includes("score") || evalText.includes("net"))) player.actions.goals++;
      if (evalText.includes("turnover") || evalText.includes("lost possession") || evalText.includes("stripped")) player.actions.turnovers++;
      
      // Advanced offensive metrics
      if (evalText.includes("drew slide") || evalText.includes("beat defender") || evalText.includes("forced help")) player.actions.slidesDrawn++;
      if (evalText.includes("hockey assist") || evalText.includes("secondary assist") || evalText.includes("pass to assist")) player.actions.hockeyAssists++;
      
      // Defensive metrics
      if (evalText.includes("check") || evalText.includes("poke") || evalText.includes("stick check")) player.actions.checksThrown++;
      if (evalText.includes("successful check") || evalText.includes("disrupted") || evalText.includes("stripped ball")) player.actions.successfulChecks++;
      if (evalText.includes("caused turnover") || evalText.includes("forced turnover") || evalText.includes("defensive pressure")) player.actions.causedTurnovers++;
      if (evalText.includes("beaten") || evalText.includes("dodged on") || evalText.includes("got by")) player.actions.timesDodgedOn++;
      if (evalText.includes("slide") || evalText.includes("help defense") || evalText.includes("provided support")) player.actions.timesSlid++;
      if (evalText.includes("ground ball") || evalText.includes("scoop") || evalText.includes("loose ball")) player.actions.groundBalls++;
      if (evalText.includes("save") || evalText.includes("stop")) player.actions.saves++;
      if (evalText.includes("clear") || evalText.includes("outlet") || evalText.includes("moved ball out")) player.actions.clears++;
      
      // Extract locations
      const locations = ["X", "crease", "wing", "top center", "GLE", "alley"];
      locations.forEach(loc => {
        if (evalText.includes(loc.toLowerCase()) && !player.locations.includes(loc)) {
          player.locations.push(loc);
        }
      });
      
      // Extract techniques
      const techniques = ["roll dodge", "split dodge", "face dodge", "bull dodge", "BTB", "skip pass", "bounce pass"];
      techniques.forEach(tech => {
        if (evalText.includes(tech.toLowerCase()) && !player.techniques.includes(tech)) {
          player.techniques.push(tech);
        }
      });
      
      // Extract skills
      const skills = ["stick handling", "field vision", "footwork", "communication", "leadership", "speed", "agility"];
      skills.forEach(skill => {
        if (evalText.includes(skill.toLowerCase()) && !player.skillsObserved.includes(skill)) {
          player.skillsObserved.push(skill);
        }
      });
      
      // Update average confidence
      player.averageConfidence = ((player.averageConfidence * (player.totalClips - 1)) + evaluation.confidence) / player.totalClips;
    });
    
    // Extract team metrics
    const teamColors = new Set<string>();
    analysis.playerEvaluations.forEach(evaluation => {
      const evalText = evaluation.evaluation.toLowerCase();
      if (evalText.includes("white")) teamColors.add("white");
      if (evalText.includes("dark") || evalText.includes("blue") || evalText.includes("red") || evalText.includes("black")) {
        teamColors.add("dark");
      }
    });
    
    teamColors.forEach(color => {
      metrics.teamMetrics[color] = {
        possessionTime: 0,
        shotsOnGoal: 0,
        turnovers: 0,
        clears: { successful: 0, failed: 0 },
        faceOffsWon: 0,
        faceOffsLost: 0,
        transitionOpportunities: 0,
        players: []
      };
    });
    
    // Extract face-off metrics
    analysis.faceOffAnalysis.forEach(faceOff => {
      const winProb = faceOff.winProbability || 50;
      if (winProb > 50) {
        const teamKey = Object.keys(metrics.teamMetrics)[0];
        if (teamKey) metrics.teamMetrics[teamKey].faceOffsWon++;
      } else {
        const teamKey = Object.keys(metrics.teamMetrics)[1];
        if (teamKey) metrics.teamMetrics[teamKey].faceOffsWon++;
      }
    });
    
    // Extract transition metrics
    analysis.transitionAnalysis.forEach(transition => {
      const successProb = transition.successProbability || 50;
      Object.values(metrics.teamMetrics).forEach(team => {
        team.transitionOpportunities++;
        if (successProb > 50) {
          team.clears.successful++;
        } else {
          team.clears.failed++;
        }
      });
    });
    
    // Extract game flow from key moments
    analysis.keyMoments.forEach(moment => {
      if (moment.type.includes("momentum") || moment.description.toLowerCase().includes("momentum")) {
        metrics.gameFlow.momentumShifts.push({
          timestamp: moment.timestamp,
          description: moment.description,
          impact: moment.confidence > 90 ? "major" : moment.confidence > 75 ? "moderate" : "minor"
        });
      }
    });
    
    // Extract communication and leadership
    analysis.playerEvaluations.forEach(evaluation => {
      const evalText = evaluation.evaluation.toLowerCase();
      if (evalText.includes("communication") || evalText.includes("call")) {
        metrics.communicationTracking.defensiveCalls++;
      }
      if (evalText.includes("leadership") || evalText.includes("organize")) {
        metrics.communicationTracking.leadershipMoments.push(
          `${evaluation.playerNumber || "Player"} at ${evaluation.timestamp}s`
        );
      }
    });
    
    // Extract physical performance indicators
    analysis.playerEvaluations.forEach(evaluation => {
      const evalText = evaluation.evaluation.toLowerCase();
      if (evalText.includes("sprint") || evalText.includes("fast break")) {
        metrics.physicalPerformance.sprintCount++;
      }
      if (evalText.includes("explosive") || evalText.includes("burst")) {
        metrics.physicalPerformance.explosivePlays++;
      }
      if (evalText.includes("tired") || evalText.includes("fatigue")) {
        metrics.physicalPerformance.fatigueIndicators.push(
          `${evaluation.playerNumber || "Player"} at ${evaluation.timestamp}s`
        );
      }
    });
    
    // Calculate advanced metrics from extracted data
    this.calculateAdvancedMetrics(metrics);
    
    return metrics;
  }
  
  private static calculateAdvancedMetrics(metrics: DetailedAnalysisMetrics): void {
    // Calculate defensive metrics
    let totalChecks = 0;
    let successfulChecks = 0;
    let totalCausedTurnovers = 0;
    let totalSlidesDrawn = 0;
    let totalHockeyAssists = 0;
    
    Object.values(metrics.playerMetrics).forEach(player => {
      totalChecks += player.actions.checksThrown;
      successfulChecks += player.actions.successfulChecks;
      totalCausedTurnovers += player.actions.causedTurnovers;
      totalSlidesDrawn += player.actions.slidesDrawn;
      totalHockeyAssists += player.actions.hockeyAssists;
    });
    
    // Update advanced defensive metrics
    metrics.advancedStats.defensiveMetrics.totalChecksThrown = totalChecks;
    metrics.advancedStats.defensiveMetrics.checkSuccessRate = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;
    metrics.advancedStats.defensiveMetrics.aggressiveCheckCount = successfulChecks;
    
    // Update advanced offensive metrics
    metrics.advancedStats.offensiveMetrics.totalSlidesDrawn = totalSlidesDrawn;
    metrics.advancedStats.offensiveMetrics.hockeyAssistTotal = totalHockeyAssists;
    
    // Calculate creative plays (BTB, behind-the-back passes, etc.)
    let creativePlays = 0;
    Object.values(metrics.playerMetrics).forEach(player => {
      player.techniques.forEach(tech => {
        if (tech.includes("BTB") || tech.includes("behind") || tech.includes("no-look")) {
          creativePlays++;
        }
      });
    });
    metrics.advancedStats.offensiveMetrics.creativePlays = creativePlays;
  }
  
  static generateDetailedSummary(metrics: DetailedAnalysisMetrics): string {
    const topPlayers = Object.entries(metrics.playerMetrics)
      .sort((a, b) => b[1].totalClips - a[1].totalClips)
      .slice(0, 5);
    
    const summary = `
## Detailed Analysis Summary

### Player Activity Overview
${topPlayers.map(([player, data]) => 
  `- **${player}**: ${data.totalClips} clips analyzed, ${data.averageConfidence.toFixed(0)}% avg confidence
    - Actions: ${data.actions.dodges} dodges, ${data.actions.shots} shots, ${data.actions.passes} passes
    - Skills: ${data.skillsObserved.join(", ") || "N/A"}
    - Active from ${Math.floor(data.timeRange.firstAppearance / 60)}:${(data.timeRange.firstAppearance % 60).toFixed(0).padStart(2, '0')} to ${Math.floor(data.timeRange.lastAppearance / 60)}:${(data.timeRange.lastAppearance % 60).toFixed(0).padStart(2, '0')}`
).join("\n")}

### Team Performance Metrics
${Object.entries(metrics.teamMetrics).map(([team, data]) => 
  `- **${team.charAt(0).toUpperCase() + team.slice(1)} Team**:
    - Face-offs Won: ${data.faceOffsWon}
    - Clears: ${data.clears.successful}/${data.clears.successful + data.clears.failed}
    - Transition Opportunities: ${data.transitionOpportunities}`
).join("\n")}

### Game Flow Analysis
- Momentum Shifts: ${metrics.gameFlow.momentumShifts.length}
- Communication Instances: ${metrics.communicationTracking.defensiveCalls + metrics.communicationTracking.offensiveSets}
- Leadership Moments: ${metrics.communicationTracking.leadershipMoments.length}

### Physical Performance
- Sprint Count: ${metrics.physicalPerformance.sprintCount}
- Explosive Plays: ${metrics.physicalPerformance.explosivePlays}
- Fatigue Indicators: ${metrics.physicalPerformance.fatigueIndicators.length}
    `;
    
    return summary;
  }
}