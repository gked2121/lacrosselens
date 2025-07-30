import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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

interface PlayerEvaluation {
  id: number;
  videoId: number;
  videoTitle: string;
  type: string;
  content: string;
  timestamp: number;
  confidence: number;
  metadata?: any;
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
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos"],
    retry: false,
  });

  // Fetch all player evaluations from all videos
  const { data: allEvaluations, isLoading: evaluationsLoading } = useQuery({
    queryKey: ["/api/videos/all-evaluations"],
    enabled: !!videos && (videos as any[]).length > 0,
    queryFn: async () => {
      // Fetch evaluations for all completed videos
      const completedVideos = (videos as any[]).filter(v => v.status === 'completed');
      const evaluationPromises = completedVideos.map(video => 
        fetch(`/api/videos/${video.id}/analyses`, { credentials: 'include' })
          .then(res => res.json())
          .then(analyses => analyses
            .filter((a: any) => a.type === 'player_evaluation')
            .map((a: any) => ({ ...a, videoTitle: video.title }))
          )
      );
      
      const results = await Promise.all(evaluationPromises);
      return results.flat();
    }
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
  const playerGroups = (allEvaluations as PlayerEvaluation[] || []).reduce((acc: any, evaluation: PlayerEvaluation) => {
    // Extract player identifier from content
    const playerMatch = evaluation.content.match(/(?:Player\s+)?#?(\d+)|(\w+\s+Team\s+(?:Player|Member))/);
    const playerKey = playerMatch ? playerMatch[0] : 'Unknown Player';
    
    if (!acc[playerKey]) {
      acc[playerKey] = {
        player: playerKey,
        evaluations: [],
        totalClips: 0,
        avgConfidence: 0,
        videos: new Set()
      };
    }
    
    acc[playerKey].evaluations.push(evaluation);
    acc[playerKey].totalClips++;
    acc[playerKey].videos.add(evaluation.videoTitle);
    
    return acc;
  }, {});

  // Calculate averages and sort by clip count
  const sortedPlayers = Object.values(playerGroups)
    .map((group: any) => ({
      ...group,
      avgConfidence: Math.round(
        group.evaluations.reduce((sum: number, e: PlayerEvaluation) => sum + e.confidence, 0) / group.evaluations.length
      ),
      videoCount: group.videos.size,
      videos: Array.from(group.videos)
    }))
    .sort((a: any, b: any) => b.totalClips - a.totalClips);

  // Format timestamp helper
  const formatTimestamp = (seconds: number) => {
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
                      {sortedPlayers.reduce((sum: number, p: any) => sum + p.totalClips, 0)}
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
                        sortedPlayers.reduce((sum: number, p: any) => sum + p.avgConfidence, 0) / sortedPlayers.length
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
                {sortedPlayers.slice(0, 3).map((player: any, index: number) => (
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
              {sortedPlayers.map((player: any) => (
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