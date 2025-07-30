import { BaseAnalysisModule, AnalysisContext, AnalysisResult, AnalysisHelpers } from './baseAnalysisModule';

export class StatisticalAnalysisModule extends BaseAnalysisModule {
  name = 'statistical-analysis';
  version = '1.0.0';
  description = 'Comprehensive game statistics and performance metrics';
  
  async analyze(context: AnalysisContext): Promise<AnalysisResult[]> {
    this.logInfo('Starting statistical analysis');
    const results: AnalysisResult[] = [];
    return results;
  }
  
  getPrompts(context: AnalysisContext): string[] {
    return [
      `Track all game statistics with timestamps:
      - Goals (scorer, assist, time)
      - Shots (on goal, off target, saved)
      - Ground balls (won/lost, player)
      - Face-offs (won/lost, technique)
      - Turnovers (caused, committed)
      - Penalties (type, player, time)
      - Saves (type, difficulty)
      - Clears (successful/failed)`,
      
      `Calculate advanced metrics:
      - Possession percentage
      - Shot efficiency
      - Turnover differential
      - Face-off win percentage
      - Clear percentage
      - Save percentage
      - Extra-man opportunities
      - Shooting percentage by location`
    ];
  }
  
  async processResults(rawData: any, context: AnalysisContext): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    // Process raw statistics into structured format
    if (rawData.statistics) {
      const stats = rawData.statistics;
      
      results.push({
        type: 'game_statistics',
        confidence: 95,
        data: {
          goals: stats.goals || [],
          assists: stats.assists || [],
          shots: stats.shots || { onGoal: 0, offTarget: 0, total: 0 },
          groundBalls: stats.groundBalls || { won: 0, lost: 0 },
          faceoffs: stats.faceoffs || { won: 0, lost: 0 },
          turnovers: stats.turnovers || { caused: 0, committed: 0 },
          penalties: stats.penalties || [],
          saves: stats.saves || 0,
          clears: stats.clears || { successful: 0, failed: 0 }
        },
        insights: this.generateStatisticalInsights(stats)
      });
    }
    
    return results;
  }
  
  private generateStatisticalInsights(stats: any): string[] {
    const insights: string[] = [];
    
    // Shot efficiency
    if (stats.shots && stats.goals) {
      const shootingPct = (stats.goals.length / stats.shots.total * 100).toFixed(1);
      insights.push(`Shooting percentage: ${shootingPct}%`);
    }
    
    // Face-off performance
    if (stats.faceoffs) {
      const faceoffPct = (stats.faceoffs.won / (stats.faceoffs.won + stats.faceoffs.lost) * 100).toFixed(1);
      insights.push(`Face-off win percentage: ${faceoffPct}%`);
    }
    
    // Turnover differential
    if (stats.turnovers) {
      const differential = stats.turnovers.caused - stats.turnovers.committed;
      insights.push(`Turnover differential: ${differential > 0 ? '+' : ''}${differential}`);
    }
    
    return insights;
  }
}