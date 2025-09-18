import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import PlayerBoxScore from "@/components/player-box-score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Analysis, Video } from "@shared/schema";
import { 
  Users, 
  Trophy,
  TrendingUp,
  AlertCircle,
  LoaderPinwheel,
  BarChart3,
  UserCheck,
  Star,
  Award,
  Target,
  Activity,
  Video,
  ArrowRight,
  Shield,
  Zap
} from "lucide-react";

type PlayerEvaluationRecord = Analysis & { videoTitle: string };

interface PlayerAccumulator {
  player: string;
  evaluations: PlayerEvaluationRecord[];
  totalClips: number;
  confidenceSum: number;
  videos: Set<string>;
}

interface PlayerAggregate {
  player: string;
  evaluations: PlayerEvaluationRecord[];
  totalClips: number;
  avgConfidence: number;
  videoCount: number;
  videos: string[];
}

export default function PlayerEvaluation() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view player evaluations.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch all videos
  const { data: videos = [], isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    retry: false,
  });

  // Fetch all player evaluations from all videos
  const { data: allEvaluations = [], isLoading: evaluationsLoading } = useQuery<PlayerEvaluationRecord[]>({
    queryKey: ["/api/videos/all-evaluations"],
    enabled: videos.length > 0,
    queryFn: async () => {
      const completedVideos = videos.filter((video) => video.status === 'completed');

      const evaluationPromises = completedVideos.map(async (video) => {
        const response = await fetch(`/api/videos/${video.id}/analyses`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to load analyses for video ${video.id}`);
        }

        const analyses: Analysis[] = await response.json();

        return analyses
          .filter((analysis): analysis is Analysis => analysis.type === 'player_evaluation')
          .map((analysis) => ({
            ...analysis,
            videoTitle: video.title,
          }));
      });

      const results = await Promise.all(evaluationPromises);
      return results.flat();
    },
  });

  if (authLoading || videosLoading || evaluationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderPinwheel className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Group evaluations by player
  const playerGroups = allEvaluations.reduce<Record<string, PlayerAccumulator>>((acc, evaluation) => {
    const playerMatch = evaluation.content.match(
      /(?:Player\s+)?#?(\d+)|(\w+\s+Team\s+(?:Player|Member))/,
    );
    const playerKey = playerMatch ? playerMatch[0] : 'Unknown Player';

    if (!acc[playerKey]) {
      acc[playerKey] = {
        player: playerKey,
        evaluations: [],
        totalClips: 0,
        confidenceSum: 0,
        videos: new Set<string>(),
      };
    }

    const accumulator = acc[playerKey];
    accumulator.evaluations.push(evaluation);
    accumulator.totalClips += 1;
    accumulator.confidenceSum += evaluation.confidence ?? 0;
    accumulator.videos.add(evaluation.videoTitle);

    return acc;
  }, {});

  // Calculate averages and sort by clip count
  const sortedPlayers: PlayerAggregate[] = Object.values(playerGroups)
    .map((group) => ({
      player: group.player,
      evaluations: group.evaluations,
      totalClips: group.totalClips,
      avgConfidence: group.evaluations.length
        ? Math.round(group.confidenceSum / group.evaluations.length)
        : 0,
      videoCount: group.videos.size,
      videos: Array.from(group.videos),
    }))
    .sort((a, b) => b.totalClips - a.totalClips);

  // Format timestamp helper
  const formatTimestamp = (seconds: number | null | undefined) => {
    if (typeof seconds !== 'number') {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="page-title">Player Evaluation Center</h1>
              <p className="page-description">
                Comprehensive player analysis across all your lacrosse videos
              </p>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              <UserCheck className="w-4 h-4 mr-2" />
              Elite Scouting View
            </Badge>
          </div>
        </div>

        {/* Player Box Score Summary */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Player Box Scores - All Videos Combined
          </h2>
          <PlayerBoxScore />
        </div>

        {/* Summary Statistics */}
        {sortedPlayers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Players</p>
                    <p className="text-2xl font-bold">{sortedPlayers.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Evaluations</p>
                    <p className="text-2xl font-bold">
                      {sortedPlayers.reduce((sum, player) => sum + player.totalClips, 0)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Videos Analyzed</p>
                    <p className="text-2xl font-bold">{videos?.length || 0}</p>
                  </div>
                  <Video className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        sortedPlayers.reduce((sum, player) => sum + player.avgConfidence, 0) /
                          sortedPlayers.length
                      )}%
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Players Section */}
        {sortedPlayers.length > 0 && (
          <Card className="shadow-soft mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Most Evaluated Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sortedPlayers.slice(0, 3).map((player, index) => (
                  <div key={player.player} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        'bg-orange-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{player.player}</p>
                        <p className="text-sm text-muted-foreground">{player.totalClips} evaluations</p>
                      </div>
                    </div>
                    <Badge variant="outline">{player.avgConfidence}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Players List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            All Player Evaluations
          </h2>

          {sortedPlayers.length > 0 ? (
            <div className="space-y-4">
              {sortedPlayers.map((player) => (
                <Card key={player.player} className="shadow-soft hover:shadow-glow transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-primary" />
                        {player.player}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {player.totalClips} {player.totalClips === 1 ? 'Clip' : 'Clips'}
                        </Badge>
                        <Badge variant="outline">
                          {player.avgConfidence}% Avg
                        </Badge>
                      </div>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Evaluated across {player.videoCount} {player.videoCount === 1 ? 'video' : 'videos'}: {player.videos.join(', ')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {player.evaluations.slice(0, 3).map((evaluation: PlayerEvaluation, index: number) => (
                        <div key={evaluation.id} className="pl-4 border-l-2 border-primary/20">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Clip {index + 1}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                from "{evaluation.videoTitle}"
                              </span>
                              {evaluation.timestamp && (
                                <Badge variant="secondary" className="text-xs">
                                  {formatTimestamp(evaluation.timestamp)}
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {evaluation.confidence}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {evaluation.content.split('\n')[0]}
                          </p>
                        </div>
                      ))}
                      
                      {player.evaluations.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center pt-2">
                          +{player.evaluations.length - 3} more evaluations
                        </p>
                      )}
                    </div>
                    
                    {/* View Full Player Analysis */}
                    <div className="mt-4 pt-4 border-t">
                      <Link href={`/analysis/${player.evaluations[0].videoId}?tab=players`}>
                        <Button className="w-full" variant="outline">
                          View Full Player Analysis
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No player evaluations available yet
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload and analyze videos to see player evaluations
                </p>
                <Link href="/videos">
                  <Button>
                    <Video className="w-4 h-4 mr-2" />
                    Go to Video Library
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pro Tips */}
        {sortedPlayers.length > 0 && (
          <Card className="shadow-soft mt-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <AlertCircle className="w-5 h-5" />
                Scouting Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Players with multiple evaluations across videos show consistency patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Higher confidence scores indicate clearer video quality and player visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Look for players who appear in multiple game situations for comprehensive assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Cross-reference player numbers with team rosters for accurate identification</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
