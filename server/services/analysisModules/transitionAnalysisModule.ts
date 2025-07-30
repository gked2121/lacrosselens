import { BaseAnalysisModule, AnalysisContext, AnalysisResult, AnalysisHelpers } from './baseAnalysisModule';

export class TransitionAnalysisModule extends BaseAnalysisModule {
  name = 'transition-analysis';
  version = '1.0.0';
  description = 'Transition play analysis including clear/ride effectiveness';
  
  async analyze(context: AnalysisContext): Promise<AnalysisResult[]> {
    this.logInfo('Starting transition analysis');
    const results: AnalysisResult[] = [];
    return results;
  }
  
  getPrompts(context: AnalysisContext): string[] {
    return [
      `Analyze transition opportunities:
      - Clear attempts and success rate
      - Riding pressure effectiveness
      - Transition speed and tempo
      - Numbers advantages created
      - Fast break conversions`,
      
      `Evaluate transition defense:
      - Defensive recovery speed
      - Communication during transition
      - Matching up in unsettled situations
      - Goalie outlet passes
      - Defensive midfield play`,
      
      `Identify transition patterns:
      - Preferred clearing routes
      - Common riding schemes
      - Substitution timing
      - Energy management
      - Momentum impact`
    ];
  }
  
  async processResults(rawData: any, context: AnalysisContext): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    if (rawData.transitions) {
      for (const transition of rawData.transitions) {
        results.push({
          type: 'transition',
          confidence: transition.confidence || 80,
          timestamp: transition.timestamp,
          data: {
            type: transition.type,
            success: transition.success,
            players: transition.players,
            duration: transition.duration
          },
          insights: [
            `${transition.type} transition ${transition.success ? 'successful' : 'failed'}`,
            `Key players: ${transition.players.join(', ')}`,
            `Transition time: ${transition.duration} seconds`
          ]
        });
      }
    }
    
    return results;
  }
}