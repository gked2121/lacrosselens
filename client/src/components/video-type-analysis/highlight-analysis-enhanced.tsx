import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  TrendingUp, 
  Users, 
  Clock,
  Award,
  Target,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Play,
  Sparkles
} from "lucide-react";

interface HighlightAnalysisProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function HighlightAnalysisEnhanced({ video, analyses, formatTimestamp }: HighlightAnalysisProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Extract highlight-specific metrics
  const highlightMetrics = {
    totalClips: playerEvaluations.length + keyMoments.length,
    avgConfidence: playerEvaluations.length > 0 
      ? Math.round(playerEvaluations.reduce((sum, p) => sum + p.confidence, 0) / playerEvaluations.length)
      : 0,
    standoutPlays: analyses.filter(a => 
      a.content.toLowerCase().includes('excellent') ||
      a.content.toLowerCase().includes('outstanding') ||
      a.content.toLowerCase().includes('impressive') ||
      a.content.toLowerCase().includes('elite')
    ).length,
    skillShowcase: {
      goals: analyses.filter(a => a.content.toLowerCase().includes('goal') || a.content.toLowerCase().includes('score')).length,
      assists: analyses.filter(a => a.content.toLowerCase().includes('assist') || a.content.toLowerCase().includes('feed')).length,
      saves: analyses.filter(a => a.content.toLowerCase().includes('save')).length,
      dodges: analyses.filter(a => a.content.toLowerCase().includes('dodge') || a.content.toLowerCase().includes('beat')).length,
      checks: analyses.filter(a => a.content.toLowerCase().includes('check') || a.content.toLowerCase().includes('strip')).length
    },
    weaknesses: analyses.filter(a => 
      a.content.toLowerCase().includes('mistake') ||
      a.content.toLowerCase().includes('error') ||
      a.content.toLowerCase().includes('improve') ||
      a.content.toLowerCase().includes('work on')
    ).length,
    competitionLevel: analyses.filter(a => 
      a.content.toLowerCase().includes('level') ||
      a.content.toLowerCase().includes('competition') ||
      a.content.toLowerCase().includes('opponent')
    ).length
  };

  // Calculate highlight quality ratings
  const highQualityPlays = analyses.filter(a => a.confidence > 85).length;
  const mediumQualityPlays = analyses.filter(a => a.confidence >= 70 && a.confidence <= 85).length;
  const improvementPlays = analyses.filter(a => a.confidence < 70).length;

  // Determine recruiting potential from highlights
  const recruitingIndicators = analyses.filter(a => 
    a.content.toLowerCase().includes('potential') ||
    a.content.toLowerCase().includes('college') ||
    a.content.toLowerCase().includes('recruit') ||
    a.content.toLowerCase().includes('next level')
  ).length;

  const recruitingLevel = recruitingIndicators > 3 ? 'High' : 
                         recruitingIndicators > 1 ? 'Medium' : 'Developing';

  return (
    <div className="space-y-6">
      {/* Highlight Reel Overview */}
      <Card className="border-yellow-200 dark:border-yellow-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg">
              <Play className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl">Highlight Tape Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Clips</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{highlightMetrics.totalClips}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{highlightMetrics.avgConfidence}% avg quality</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Elite Plays</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{highlightMetrics.standoutPlays}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Standout moments</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Recruiting Level</span>
              </div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{recruitingLevel}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Potential</p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Areas to Work On</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{highlightMetrics.weaknesses}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Improvement areas</p>
            </div>
          </div>

          {/* Skill Showcase Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Skills Highlighted in Tape
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(highlightMetrics.skillShowcase).map(([skill, count]) => (
                <div key={skill} className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{skill}</span>
                    <Badge variant={count > 0 ? "default" : "outline"}>{count}</Badge>
                  </div>
                  <Progress value={Math.min((count / Math.max(...Object.values(highlightMetrics.skillShowcase))) * 100, 100)} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Play Quality Distribution */}
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Highlight Quality Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Elite Clips (85%+)</span>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{highQualityPlays}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Championship level</p>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Solid Clips (70-85%)</span>
                </div>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{mediumQualityPlays}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Good execution</p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Growth Clips (&lt;70%)</span>
                </div>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{improvementPlays}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Development focus</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Highlight Analysis */}
      {overallAnalysis && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-blue-600" />
              <CardTitle>Highlight Reel Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              {overallAnalysis.content}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Individual Highlight Clips */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-b">
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-yellow-600" />
            <CardTitle>Individual Highlight Breakdowns</CardTitle>
            <Badge variant="outline">{playerEvaluations.length} clips analyzed</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {playerEvaluations.map((evaluation, index) => (
              <div key={evaluation.id} className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(evaluation.timestamp) || `Clip ${index + 1}`}
                    </Badge>
                    <Badge variant="outline">
                      {evaluation.confidence}% quality
                    </Badge>
                  </div>
                  {evaluation.confidence > 85 && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <Star className="w-3 h-3 mr-1" />
                      Elite
                    </Badge>
                  )}
                  {evaluation.content.toLowerCase().includes('improve') && (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Growth Area
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

      {/* Memorable Moments */}
      {keyMoments.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-b">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <CardTitle>Memorable Moments & Key Plays</CardTitle>
              <Badge variant="outline">{keyMoments.length} moments</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {keyMoments.map((moment, index) => (
                <div key={moment.id} className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(moment.timestamp) || `Moment ${index + 1}`}
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