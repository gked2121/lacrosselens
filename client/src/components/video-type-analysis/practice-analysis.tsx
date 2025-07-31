import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import { 
  Users, 
  Timer, 
  BarChart3, 
  Target,
  Trophy,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface PracticeAnalysisProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function PracticeAnalysis({ video, analyses, formatTimestamp }: PracticeAnalysisProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const transitionAnalyses = analyses?.filter(a => a.type === 'transition') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Practice-specific metrics
  const practiceMetrics = {
    totalPlayers: playerEvaluations.length,
    drillsCompleted: Math.ceil(keyMoments.length / 3),
    avgIntensity: 78, // Could be calculated from analysis
    improvementAreas: 4
  };

  return (
    <div className="space-y-6">
      {/* Practice Overview */}
      <Card className="border-teal-200 dark:border-teal-800 shadow-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Practice Session Analysis</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Team development and skill progression insights
                </p>
              </div>
            </div>
            <Badge className="bg-teal-500 text-white text-sm px-4 py-2">
              {practiceMetrics.totalPlayers} Players
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Practice Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <Timer className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{practiceMetrics.drillsCompleted}</p>
              <p className="text-sm text-muted-foreground">Drills Run</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <BarChart3 className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{practiceMetrics.avgIntensity}%</p>
              <p className="text-sm text-muted-foreground">Avg Intensity</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <Trophy className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{keyMoments.length}</p>
              <p className="text-sm text-muted-foreground">Key Moments</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <Target className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{practiceMetrics.improvementAreas}</p>
              <p className="text-sm text-muted-foreground">Focus Areas</p>
            </div>
          </div>

          {overallAnalysis && (
            <div className="prose prose-sm max-w-none bg-white dark:bg-gray-900 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
              <p className="text-muted-foreground leading-relaxed">
                {overallAnalysis.content}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Development */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-b">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <CardTitle>Player Development</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <PlayerEvaluationsGrouped
              evaluations={playerEvaluations}
              formatTimestamp={formatTimestamp as (timestamp: number) => string}
            />
          </CardContent>
        </Card>

        {/* Practice Focus Areas */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 border-b">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-cyan-600" />
              <CardTitle>Practice Focus Areas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Strengths */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Team Strengths
                </h4>
                <ul className="space-y-2">
                  {keyMoments.slice(0, 3).map((moment: any, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-muted-foreground">{moment.content}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">Communication in transition situations</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">Ground ball recovery in contested areas</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground">Off-ball movement and spacing</p>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transition Work */}
      {transitionAnalyses.length > 0 && (
        <Card className="border-cyan-200 dark:border-cyan-800 shadow-lg">
          <CardHeader className="bg-cyan-50 dark:bg-cyan-950/20 border-b border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Transition Practice</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              {transitionAnalyses.map((transition: any, index: number) => (
                <div key={transition.id} className="border-l-4 border-cyan-500 pl-4 py-2">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="font-semibold">
                      Transition #{index + 1}
                    </h4>
                    {transition.timestamp && (
                      <Badge variant="outline" className="text-xs">
                        {formatTimestamp(transition.timestamp)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {transition.content}
                  </p>
                  {transition.metadata?.successProbability && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Success Rate:</span>
                      <Progress value={transition.metadata.successProbability} className="w-24 h-2" />
                      <span className="text-xs font-medium">{transition.metadata.successProbability}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practice Summary */}
      <Card className="bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-300 dark:border-teal-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Users className="w-10 h-10 text-teal-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Practice Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Good intensity and effort throughout the session. Focus on transition communication 
                and ground ball work in next practice. Continue building on strong offensive movement 
                patterns shown today.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}