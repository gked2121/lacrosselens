import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Swords, 
  Users, 
  Clock,
  TrendingUp,
  Target,
  Brain,
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3
} from "lucide-react";

interface ScrimmageAnalysisProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function ScrimmageAnalysisEnhanced({ video, analyses, formatTimestamp }: ScrimmageAnalysisProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const faceoffs = analyses?.filter(a => a.type === 'face_off') || [];
  const transitions = analyses?.filter(a => a.type === 'transition') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Extract scrimmage-specific metrics
  const scrimmageMetrics = {
    totalPlayers: playerEvaluations.length,
    avgConfidence: playerEvaluations.length > 0 
      ? Math.round(playerEvaluations.reduce((sum, p) => sum + p.confidence, 0) / playerEvaluations.length)
      : 0,
    gameReadiness: playerEvaluations.filter(p => 
      p.content.toLowerCase().includes('ready') ||
      p.content.toLowerCase().includes('prepared') ||
      p.content.toLowerCase().includes('game-like')
    ).length,
    teamChemistry: analyses.filter(a => 
      a.content.toLowerCase().includes('chemistry') ||
      a.content.toLowerCase().includes('communication') ||
      a.content.toLowerCase().includes('together') ||
      a.content.toLowerCase().includes('connection')
    ).length,
    competitiveness: keyMoments.filter(m => 
      m.content.toLowerCase().includes('competitive') ||
      m.content.toLowerCase().includes('battle') ||
      m.content.toLowerCase().includes('fight')
    ).length,
    situationalPlays: {
      manUp: analyses.filter(a => a.content.toLowerCase().includes('man up') || a.content.toLowerCase().includes('advantage')).length,
      manDown: analyses.filter(a => a.content.toLowerCase().includes('man down') || a.content.toLowerCase().includes('short')).length,
      evenStrength: analyses.filter(a => a.content.toLowerCase().includes('even') || a.content.toLowerCase().includes('6v6')).length,
      transition: transitions.length
    }
  };

  // Calculate team performance indicators
  const teamData = playerEvaluations.reduce((acc, player) => {
    const isWhiteTeam = player.content.toLowerCase().includes('white') || 
                       player.content.toLowerCase().includes('light');
    const teamKey = isWhiteTeam ? 'white' : 'dark';
    
    if (!acc[teamKey]) acc[teamKey] = [];
    acc[teamKey].push(player);
    return acc;
  }, {} as Record<string, any[]>);

  // Evaluate decision making under pressure
  const pressureSituations = analyses.filter(a => 
    a.content.toLowerCase().includes('pressure') ||
    a.content.toLowerCase().includes('contested') ||
    a.content.toLowerCase().includes('tight')
  );

  const decisionMaking = pressureSituations.length > 3 ? 'Strong' : 
                        pressureSituations.length > 1 ? 'Developing' : 'Needs Work';

  return (
    <div className="space-y-6">
      {/* Scrimmage Overview */}
      <Card className="border-indigo-200 dark:border-indigo-800 shadow-lg">
        <CardHeader className="bg-indigo-50 dark:bg-indigo-950/20 border-b border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl">Scrimmage Performance Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Players</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{scrimmageMetrics.totalPlayers}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{scrimmageMetrics.avgConfidence}% confidence</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Game Ready</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{scrimmageMetrics.gameReadiness}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Players</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Decision Making</span>
              </div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{decisionMaking}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Under pressure</p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Team Chemistry</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{scrimmageMetrics.teamChemistry}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Moments observed</p>
            </div>
          </div>

          {/* Situational Play Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Game Situation Performance
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(scrimmageMetrics.situationalPlays).map(([situation, count]) => (
                <div key={situation} className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{situation.replace(/([A-Z])/g, ' $1')}</span>
                    <Badge variant={count > 0 ? "default" : "outline"}>{count}</Badge>
                  </div>
                  <Progress value={Math.min((count / Math.max(...Object.values(scrimmageMetrics.situationalPlays))) * 100, 100)} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance Comparison */}
          {Object.keys(teamData).length > 1 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Team vs Team Performance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(teamData).map(([teamKey, players]) => {
                  const typedPlayers = players as any[];
                  return (
                    <div key={teamKey} className={`p-4 rounded-lg border ${
                      teamKey === 'white' 
                        ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                        : 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-4 h-4 rounded-full ${
                          teamKey === 'white' ? 'bg-gray-400' : 'bg-slate-600'
                        }`}></div>
                        <span className="font-medium capitalize">{teamKey} Team</span>
                        <Badge variant="outline">{typedPlayers.length} players</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Avg Performance:</span>
                          <span className="font-medium">{Math.round(typedPlayers.reduce((sum: number, p: any) => sum + p.confidence, 0) / typedPlayers.length)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Competitiveness:</span>
                          <span className="font-medium">
                            {typedPlayers.filter((p: any) => p.content.toLowerCase().includes('competitive') || p.content.toLowerCase().includes('battle')).length > 0 ? 'High' : 'Moderate'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Scrimmage Analysis */}
      {overallAnalysis && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-indigo-600" />
              <CardTitle>Scrimmage Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              {overallAnalysis.content}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Player Readiness Assessment */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-green-600" />
            <CardTitle>Individual Player Assessment</CardTitle>
            <Badge variant="outline">{playerEvaluations.length} evaluations</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {playerEvaluations.map((evaluation, index) => (
              <div key={evaluation.id} className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(evaluation.timestamp) || 'N/A'}
                    </Badge>
                    <Badge variant="outline">
                      {evaluation.confidence}% confidence
                    </Badge>
                  </div>
                  {evaluation.content.toLowerCase().includes('ready') && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Game Ready
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {evaluation.content}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Competitive Moments */}
      {keyMoments.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-b">
            <div className="flex items-center gap-3">
              <Swords className="w-5 h-5 text-orange-600" />
              <CardTitle>Competitive Moments & Battle Testing</CardTitle>
              <Badge variant="outline">{keyMoments.length} moments</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {keyMoments.map((moment, index) => (
                <div key={moment.id} className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-orange-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(moment.timestamp) || 'N/A'}
                    </Badge>
                    <Badge variant="outline">
                      {moment.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {moment.content}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}