import { Badge } from "@/components/ui/badge";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import PersonalHighlightEvaluations from "@/components/personal-highlight-evaluations";
import { 
  Clock,
  Eye,
  ChevronRight
} from "lucide-react";

interface GameAnalysisMinimalProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function GameAnalysisMinimal({ video, analyses, formatTimestamp }: GameAnalysisMinimalProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const faceOffAnalyses = analyses?.filter(a => a.type === 'face_off') || [];
  const transitionAnalyses = analyses?.filter(a => a.type === 'transition') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-16">
      {/* Overview */}
      {overallAnalysis && (
        <div className="space-y-6">
          <h2 className="text-3xl font-light tracking-tight">Overview</h2>
          <div className="pl-8 border-l-2 border-gray-200 dark:border-gray-700">
            <p className="text-lg leading-8 text-gray-700 dark:text-gray-300">
              {overallAnalysis.content}
            </p>
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {overallAnalysis.confidence}% confidence
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTimestamp(overallAnalysis.timestamp) || 'Full Game'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center">
          <p className="text-4xl font-light">{playerEvaluations.length}</p>
          <p className="text-sm text-gray-500 mt-2">Players Analyzed</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-light">{faceOffAnalyses.length}</p>
          <p className="text-sm text-gray-500 mt-2">Face-offs</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-light">{transitionAnalyses.length}</p>
          <p className="text-sm text-gray-500 mt-2">Transitions</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-light">{keyMoments.length}</p>
          <p className="text-sm text-gray-500 mt-2">Key Moments</p>
        </div>
      </div>

      {/* Players */}
      {playerEvaluations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-light tracking-tight">Players</h2>
            <span className="text-sm text-gray-500">{playerEvaluations.length} analyzed</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-8">
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
        </div>
      )}

      {/* Face-offs */}
      {faceOffAnalyses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-light tracking-tight">Face-offs</h2>
            <span className="text-sm text-gray-500">{faceOffAnalyses.length} tracked</span>
          </div>
          <div className="space-y-6">
            {faceOffAnalyses.map((faceoff: any, index: number) => (
              <div key={faceoff.id} className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {formatTimestamp(faceoff.timestamp)}
                      </Badge>
                      {faceoff.metadata?.winProbability && (
                        <Badge 
                          variant={faceoff.metadata.winProbability >= 70 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {faceoff.metadata.winProbability}% win
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faceoff.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transitions */}
      {transitionAnalyses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-light tracking-tight">Transitions</h2>
            <span className="text-sm text-gray-500">{transitionAnalyses.length} analyzed</span>
          </div>
          <div className="space-y-6">
            {transitionAnalyses.map((transition: any, index: number) => (
              <div key={transition.id} className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {formatTimestamp(transition.timestamp)}
                      </Badge>
                      {transition.metadata?.successProbability && (
                        <Badge 
                          variant={transition.metadata.successProbability >= 70 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {transition.metadata.successProbability}% success
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {transition.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Moments */}
      {keyMoments.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-light tracking-tight">Key Moments</h2>
            <span className="text-sm text-gray-500">{keyMoments.length} identified</span>
          </div>
          <div className="space-y-4">
            {keyMoments.map((moment: any) => (
              <div key={moment.id} className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                <ChevronRight className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {formatTimestamp(moment.timestamp)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {moment.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {moment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}