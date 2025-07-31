import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Shield, TrendingUp } from "lucide-react";

interface GameAnalysisSimpleProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function GameAnalysisSimple({ video, analyses, formatTimestamp }: GameAnalysisSimpleProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const faceOffAnalyses = analyses?.filter(a => a.type === 'face_off') || [];
  const transitionAnalyses = analyses?.filter(a => a.type === 'transition') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Players</span>
            </div>
            <p className="text-2xl font-bold">{playerEvaluations.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Face-offs</span>
            </div>
            <p className="text-2xl font-bold">{faceOffAnalyses.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Transitions</span>
            </div>
            <p className="text-2xl font-bold">{transitionAnalyses.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Key Moments</span>
            </div>
            <p className="text-2xl font-bold">{keyMoments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Analysis */}
      {overallAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Game Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{overallAnalysis.content}</p>
            <Badge variant="outline">
              {overallAnalysis.confidence}% confidence
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Top Player Evaluations */}
      {playerEvaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Player Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playerEvaluations.slice(0, 5).map((player: any, index: number) => (
                <div key={player.id} className="pb-3 border-b last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {player.metadata?.playerNumber ? `#${player.metadata.playerNumber}` : `Player ${index + 1}`}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {formatTimestamp(player.timestamp)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {player.content}
                  </p>
                </div>
              ))}
              {playerEvaluations.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  + {playerEvaluations.length - 5} more player evaluations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Moments */}
      {keyMoments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Moments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {keyMoments.map((moment: any, index: number) => (
                <div key={moment.id} className="flex items-start gap-3">
                  <Badge className="mt-0.5">{formatTimestamp(moment.timestamp)}</Badge>
                  <p className="text-sm text-muted-foreground">{moment.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}