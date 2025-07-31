import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import { 
  Swords, 
  Users, 
  TrendingUp, 
  Shield,
  Activity,
  Award,
  Clock,
  BarChart3
} from "lucide-react";

interface ScrimmageAnalysisProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function ScrimmageAnalysis({ video, analyses, formatTimestamp }: ScrimmageAnalysisProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const faceOffAnalyses = analyses?.filter(a => a.type === 'face_off') || [];
  const transitionAnalyses = analyses?.filter(a => a.type === 'transition') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Scrimmage-specific stats
  const scrimmageStats = {
    totalPlayers: playerEvaluations.length,
    possessions: Math.ceil(keyMoments.length / 2),
    faceOffs: faceOffAnalyses.length,
    transitions: transitionAnalyses.length
  };

  return (
    <div className="space-y-6">
      {/* Scrimmage Overview */}
      <Card className="border-red-200 dark:border-red-800 shadow-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl shadow-lg">
                <Swords className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Scrimmage Analysis</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Competitive game-like situation evaluation
                </p>
              </div>
            </div>
            <Badge className="bg-red-500 text-white text-sm px-4 py-2">
              Live Competition
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Scrimmage Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <Users className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{scrimmageStats.totalPlayers}</p>
              <p className="text-sm text-muted-foreground">Players</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <Activity className="w-6 h-6 text-rose-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{scrimmageStats.possessions}</p>
              <p className="text-sm text-muted-foreground">Possessions</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <Shield className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{scrimmageStats.faceOffs}</p>
              <p className="text-sm text-muted-foreground">Face-offs</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <TrendingUp className="w-6 h-6 text-rose-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{scrimmageStats.transitions}</p>
              <p className="text-sm text-muted-foreground">Transitions</p>
            </div>
          </div>

          {overallAnalysis && (
            <div className="prose prose-sm max-w-none bg-white dark:bg-gray-900 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <p className="text-muted-foreground leading-relaxed">
                {overallAnalysis.content}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* White Team Performance */}
        <Card className="border-gray-300 dark:border-gray-700 shadow-lg">
          <CardHeader className="bg-gray-100 dark:bg-gray-900 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white border-2 border-gray-400 rounded-full shadow"></div>
                <CardTitle>White Team Performance</CardTitle>
              </div>
              <Badge variant="outline">Team A</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Extract white team stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {playerEvaluations.filter((e: any) => 
                      e.content?.toLowerCase().includes('white') || 
                      e.metadata?.teamColor === 'white'
                    ).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Players Analyzed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {Math.round(faceOffAnalyses.filter((f: any) => 
                      f.metadata?.winProbability > 50
                    ).length / 2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Face-offs Won</p>
                </div>
              </div>
              
              {/* Key performers */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Key Performers</h4>
                <ul className="space-y-1">
                  {playerEvaluations
                    .filter((e: any) => e.content?.toLowerCase().includes('white'))
                    .slice(0, 3)
                    .map((player: any, index: number) => (
                      <li key={index} className="text-xs text-muted-foreground">
                        • {player.metadata?.playerTitle || `Player ${index + 1}`}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dark Team Performance */}
        <Card className="border-gray-700 dark:border-gray-300 shadow-lg">
          <CardHeader className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border-b border-gray-700 dark:border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 dark:bg-gray-700 border-2 border-gray-600 dark:border-gray-500 rounded-full shadow"></div>
                <CardTitle>Dark Team Performance</CardTitle>
              </div>
              <Badge variant="outline" className="text-white dark:text-gray-900 border-white dark:border-gray-700">Team B</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Extract dark team stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {playerEvaluations.filter((e: any) => 
                      !e.content?.toLowerCase().includes('white') && 
                      e.metadata?.teamColor !== 'white'
                    ).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Players Analyzed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {Math.round(faceOffAnalyses.filter((f: any) => 
                      f.metadata?.winProbability <= 50
                    ).length / 2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Face-offs Won</p>
                </div>
              </div>
              
              {/* Key performers */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Key Performers</h4>
                <ul className="space-y-1">
                  {playerEvaluations
                    .filter((e: any) => !e.content?.toLowerCase().includes('white'))
                    .slice(0, 3)
                    .map((player: any, index: number) => (
                      <li key={index} className="text-xs text-muted-foreground">
                        • {player.metadata?.playerTitle || `Player ${index + 1}`}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Flow Analysis */}
      {keyMoments.length > 0 && (
        <Card className="border-rose-200 dark:border-rose-800 shadow-lg">
          <CardHeader className="bg-rose-50 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Game Flow & Key Moments</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {keyMoments.map((moment: any, index: number) => (
                <div key={moment.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-rose-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {formatTimestamp(moment.timestamp) || 'N/A'}
                      </Badge>
                      <Badge className={`text-xs ${
                        moment.confidence >= 80 ? 'bg-green-500' : 
                        moment.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      } text-white`}>
                        {moment.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{moment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Evaluations */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-b">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-red-600" />
            <CardTitle>Individual Player Evaluations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <PlayerEvaluationsGrouped
            evaluations={playerEvaluations}
            formatTimestamp={formatTimestamp as (timestamp: number) => string}
          />
        </CardContent>
      </Card>

      {/* Scrimmage Takeaways */}
      <Card className="bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Award className="w-10 h-10 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Scrimmage Takeaways</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Competitive intensity was high with both teams showing good execution. 
                Focus areas: White team needs better transition defense, Dark team should 
                improve face-off execution. Overall, good preparation for game situations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}