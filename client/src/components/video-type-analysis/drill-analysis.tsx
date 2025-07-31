import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Clock, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Activity,
  User,
  Repeat,
  BarChart3
} from "lucide-react";

interface DrillAnalysisProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function DrillAnalysis({ video, analyses, formatTimestamp }: DrillAnalysisProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Extract technique points and coaching feedback
  const techniquePoints = overallAnalysis?.content?.split('\n')
    .filter((line: string) => line.includes('technique') || line.includes('form') || line.includes('mechanics'))
    .slice(0, 5) || [];

  const coachingPoints = keyMoments.map((moment: any) => ({
    point: moment.content,
    timestamp: formatTimestamp(moment.timestamp),
    confidence: moment.confidence
  }));

  return (
    <div className="space-y-6">
      {/* Drill Overview Card */}
      <Card className="border-blue-200 dark:border-blue-800 shadow-lg">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Drill Analysis</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Technical breakdown and skill development insights
                </p>
              </div>
            </div>
            <Badge className="bg-blue-500 text-white">
              {playerEvaluations.length} {playerEvaluations.length === 1 ? 'Player' : 'Players'} Analyzed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {overallAnalysis && (
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {overallAnalysis.content}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technique Analysis */}
      {playerEvaluations.length > 0 && (
        <Card className="border-green-200 dark:border-green-800 shadow-lg">
          <CardHeader className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Technique Observations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              {playerEvaluations.map((evaluation: any, index: number) => (
                <div key={evaluation.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold">
                        {evaluation.metadata?.playerTitle || `Player ${index + 1}`}
                      </h4>
                    </div>
                    {evaluation.timestamp && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimestamp(evaluation.timestamp)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {evaluation.content}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Progress value={evaluation.confidence} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground">{evaluation.confidence}% confidence</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Coaching Points */}
      {coachingPoints.length > 0 && (
        <Card className="border-purple-200 dark:border-purple-800 shadow-lg">
          <CardHeader className="bg-purple-50 dark:bg-purple-950/20 border-b border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Key Coaching Points</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ol className="space-y-4">
              {coachingPoints.map((point: any, index: number) => (
                <li key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{point.point}</p>
                    {point.timestamp && (
                      <span className="text-xs text-muted-foreground mt-1 inline-block">
                        @ {point.timestamp}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Evaluations</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {playerEvaluations.length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Avg Confidence</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {playerEvaluations.length > 0 
                    ? Math.round(playerEvaluations.reduce((sum: number, e: any) => sum + e.confidence, 0) / playerEvaluations.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Coaching Points</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {coachingPoints.length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}