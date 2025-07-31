import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  Brain,
  Activity
} from "lucide-react";

interface PracticeAnalysisProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function PracticeAnalysisEnhanced({ video, analyses, formatTimestamp }: PracticeAnalysisProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Extract practice metrics from actual database fields
  const practiceMetrics = {
    totalPlayers: playerEvaluations.length,
    avgConfidence: playerEvaluations.length > 0 
      ? Math.round(playerEvaluations.reduce((sum, p) => sum + (p.confidence || 0), 0) / playerEvaluations.length)
      : 0,
    keyMoments: keyMoments.length,
    totalAnalyses: analyses.length,
    // Use actual analysis types instead of keyword searches
    evaluationTypes: {
      player: playerEvaluations.length,
      overall: analyses.filter(a => a.type === 'overall').length,
      tactical: analyses.filter(a => a.type === 'tactical').length,
      coaching: analyses.filter(a => a.type === 'coaching_point').length
    }
  };

  // Extract skill development areas
  const skillAreas = {
    shooting: analyses.filter(a => a.content.toLowerCase().includes('shoot') || a.content.toLowerCase().includes('shot')).length,
    passing: analyses.filter(a => a.content.toLowerCase().includes('pass') || a.content.toLowerCase().includes('feed')).length,
    dodging: analyses.filter(a => a.content.toLowerCase().includes('dodge') || a.content.toLowerCase().includes('beat')).length,
    defense: analyses.filter(a => a.content.toLowerCase().includes('check') || a.content.toLowerCase().includes('defend')).length,
    groundBalls: analyses.filter(a => a.content.toLowerCase().includes('ground ball') || a.content.toLowerCase().includes('scoop')).length
  };

  // Determine practice focus
  const maxSkillArea = Object.entries(skillAreas).reduce((max, [skill, count]) => 
    count > max.count ? { skill, count } : max, { skill: 'general', count: 0 }
  );

  // Extract tempo and intensity from content
  const tempoIndicators = analyses.filter(a => 
    a.content.toLowerCase().includes('fast') ||
    a.content.toLowerCase().includes('quick') ||
    a.content.toLowerCase().includes('intense') ||
    a.content.toLowerCase().includes('high energy')
  );

  const practiceIntensity = tempoIndicators.length > 3 ? 'High' : 
                           tempoIndicators.length > 1 ? 'Medium' : 'Low';

  return (
    <div className="space-y-6">
      {/* Practice Overview */}
      <Card className="border-green-200 dark:border-green-800 shadow-lg">
        <CardHeader className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl">Practice Session Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Players</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{practiceMetrics.totalPlayers}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Active in session</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Key Moments</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{practiceMetrics.keyMoments}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Important plays</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Analyses</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{practiceMetrics.totalAnalyses}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Generated insights</p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Intensity</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{practiceIntensity}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">{practiceMetrics.avgConfidence}% confidence</p>
            </div>
          </div>

          {/* Skill Development Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Skill Development Focus Areas
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(skillAreas).map(([skill, count]) => (
                <div key={skill} className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                    <Badge variant={count > 0 ? "default" : "outline"}>{count}</Badge>
                  </div>
                  <Progress value={Math.min((count / Math.max(...Object.values(skillAreas))) * 100, 100)} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Practice Analysis */}
      {overallAnalysis && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <CardTitle>Practice Session Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              {overallAnalysis.content}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Individual Player Development */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-green-600" />
            <CardTitle>Player Development Observations</CardTitle>
            <Badge variant="outline">{playerEvaluations.length} players tracked</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {playerEvaluations.map((evaluation, index) => (
              <div key={evaluation.id} className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(evaluation.timestamp) || 'N/A'}
                    </Badge>
                    <Badge variant="outline">
                      {evaluation.confidence}% confidence
                    </Badge>
                  </div>
                  {evaluation.content.toLowerCase().includes('improve') && (
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Development Area
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

      {/* Key Practice Moments */}
      {keyMoments.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-b">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600" />
              <CardTitle>Key Teaching Moments</CardTitle>
              <Badge variant="outline">{keyMoments.length} moments captured</Badge>
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