import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import PersonalHighlightEvaluations from "@/components/personal-highlight-evaluations";
import { DetailedAnalysisView } from "@/components/detailed-analysis-view";
import { 
  Trophy,
  Users,
  Shield,
  Clock,
  TrendingUp,
  Sparkles,
  Eye,
  Activity
} from "lucide-react";

interface GameAnalysisCleanProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function GameAnalysisClean({ video, analyses, formatTimestamp }: GameAnalysisCleanProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const faceOffAnalyses = analyses?.filter(a => a.type === 'face_off') || [];
  const transitionAnalyses = analyses?.filter(a => a.type === 'transition') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  return (
    <div className="w-full space-y-8">
      {/* Overall Analysis Section */}
      {overallAnalysis && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold">Game Overview</h2>
          </div>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
                {overallAnalysis.content}
              </p>
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="secondary" className="bg-white/50 dark:bg-gray-800/50">
                  <Eye className="w-3 h-3 mr-1" />
                  {overallAnalysis.confidence}% confidence
                </Badge>
                <Badge variant="secondary" className="bg-white/50 dark:bg-gray-800/50">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimestamp(overallAnalysis.timestamp) || 'Full Game'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Game Stats Summary */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Players</span>
            </div>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{playerEvaluations.length}</p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Analyzed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Face-offs</span>
            </div>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{faceOffAnalyses.length}</p>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Tracked</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Transitions</span>
            </div>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">{transitionAnalyses.length}</p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">Analyzed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Key Moments</span>
            </div>
            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{keyMoments.length}</p>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Identified</p>
          </CardContent>
        </Card>
      </section>

      {/* Player Evaluations Section */}
      {playerEvaluations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold">Player Analysis</h2>
            <Badge variant="secondary" className="ml-auto">{playerEvaluations.length} players</Badge>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            {(video.title?.toLowerCase().includes('highlight') || 
              video.metadata?.videoType === 'highlight_tape') ? (
              <PersonalHighlightEvaluations
                evaluations={playerEvaluations}
                formatTimestamp={formatTimestamp as (timestamp: number) => string}
                playerName={video.title?.split(' ')[0] || 'Target Player'}
              />
            ) : (
              <PlayerEvaluationsGrouped 
                evaluations={playerEvaluations}
                formatTimestamp={formatTimestamp as (timestamp: number) => string}
              />
            )}
          </div>
        </section>
      )}

      {/* Face-offs Section */}
      {faceOffAnalyses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold">Face-off Analysis</h2>
            <Badge variant="secondary" className="ml-auto">{faceOffAnalyses.length} face-offs</Badge>
          </div>
          
          <div className="space-y-3">
            {faceOffAnalyses.map((faceoff: any, index: number) => (
              <Card key={faceoff.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">Face-off #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {formatTimestamp(faceoff.timestamp)}
                      </Badge>
                      {faceoff.metadata?.winProbability && (
                        <Badge 
                          className={
                            faceoff.metadata.winProbability >= 70 ? 'bg-green-500 text-white' : 
                            faceoff.metadata.winProbability >= 50 ? 'bg-amber-500 text-white' : 
                            'bg-red-500 text-white'
                          }
                        >
                          {faceoff.metadata.winProbability}% win
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faceoff.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Transitions Section */}
      {transitionAnalyses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold">Transition Analysis</h2>
            <Badge variant="secondary" className="ml-auto">{transitionAnalyses.length} transitions</Badge>
          </div>
          
          <div className="space-y-3">
            {transitionAnalyses.map((transition: any, index: number) => (
              <Card key={transition.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">Transition #{index + 1}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {formatTimestamp(transition.timestamp)}
                      </Badge>
                      {transition.metadata?.successProbability && (
                        <Badge 
                          className={
                            transition.metadata.successProbability >= 70 ? 'bg-green-500 text-white' : 
                            transition.metadata.successProbability >= 50 ? 'bg-amber-500 text-white' : 
                            'bg-red-500 text-white'
                          }
                        >
                          {transition.metadata.successProbability}% success
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{transition.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Key Moments Section */}
      {keyMoments.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Sparkles className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold">Key Moments</h2>
            <Badge variant="secondary" className="ml-auto">{keyMoments.length} moments</Badge>
          </div>
          
          <div className="grid gap-3">
            {keyMoments.map((moment: any, index: number) => (
              <Card key={moment.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {formatTimestamp(moment.timestamp)}
                        </Badge>
                        <Badge variant="outline">
                          {moment.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{moment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Advanced Metrics Section */}
      {playerEvaluations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold">Advanced Metrics</h2>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-6">
            <DetailedAnalysisView 
              videoId={video.id}
              playerEvaluations={playerEvaluations}
              formatTimestamp={formatTimestamp}
            />
          </div>
        </section>
      )}
    </div>
  );
}