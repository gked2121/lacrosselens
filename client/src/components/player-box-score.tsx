import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Trophy,
  Target,
  Shield,
  Activity,
  Zap,
  TrendingUp,
  Video,
  Star,
  BarChart3,
  Award,
  Users,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";

interface PlayerStats {
  playerName: string;
  totalClips: number;
  totalVideos: number;
  averageConfidence: number;
  totalActions: {
    dodges: number;
    shots: number;
    passes: number;
    defensivePlays: number;
    groundBalls: number;
    goals: number;
    assists: number;
    saves: number;
    causedTurnovers: number;
  };
  skillsObserved: string[];
  videoAppearances: Array<{
    videoId: number;
    videoTitle: string;
    clipCount: number;
    timeRange: { firstAppearance: number; lastAppearance: number };
    confidence: number;
  }>;
  positions: string[];
  teams: string[];
}

export default function PlayerBoxScore() {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  const { data: playerStats, isLoading } = useQuery<PlayerStats[]>({
    queryKey: ["/api/player-stats/aggregate"],
  });

  const togglePlayer = (playerName: string) => {
    const newExpanded = new Set(expandedPlayers);
    if (newExpanded.has(playerName)) {
      newExpanded.delete(playerName);
    } else {
      newExpanded.add(playerName);
    }
    setExpandedPlayers(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-muted rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!playerStats || playerStats.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardContent className="py-12">
          <div className="text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Player Data Yet</h3>
            <p className="text-muted-foreground">
              Player stats will appear here once videos have been analyzed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft bg-primary/5 border-primary/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Players</p>
                <p className="text-2xl font-bold">{playerStats.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft bg-blue-500/5 border-blue-500/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">
                  {playerStats.reduce((sum, p) => sum + p.totalActions.goals, 0)}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-blue-600/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft bg-green-500/5 border-green-500/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assists</p>
                <p className="text-2xl font-bold">
                  {playerStats.reduce((sum, p) => sum + p.totalActions.assists, 0)}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600/60" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft bg-orange-500/5 border-orange-500/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {Math.round(playerStats.reduce((sum, p) => sum + p.averageConfidence, 0) / playerStats.length)}%
                </p>
              </div>
              <Star className="w-8 h-8 text-orange-600/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Box Scores */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {playerStats.map((player) => {
          const isExpanded = expandedPlayers.has(player.playerName);
          const totalPoints = player.totalActions.goals + player.totalActions.assists;
          
          return (
            <Card key={player.playerName} className="shadow-soft hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{player.playerName}</span>
                  <div className="flex items-center gap-2">
                    {player.positions.map((pos) => (
                      <Badge key={pos} variant="secondary" className="text-xs">
                        {pos.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="w-4 h-4" />
                  {player.totalVideos} videos • {player.totalClips} clips
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primary Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-2xl font-bold">{player.totalActions.goals}</div>
                    <div className="text-xs text-muted-foreground">Goals</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-2xl font-bold">{player.totalActions.assists}</div>
                    <div className="text-xs text-muted-foreground">Assists</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-2xl font-bold">{totalPoints}</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </div>
                </div>

                {/* Secondary Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ground Balls</span>
                    <span className="font-medium">{player.totalActions.groundBalls}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Caused Turnovers</span>
                    <span className="font-medium">{player.totalActions.causedTurnovers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saves</span>
                    <span className="font-medium">{player.totalActions.saves}</span>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Confidence</span>
                    <span className="font-medium">{player.averageConfidence}%</span>
                  </div>
                  <Progress value={player.averageConfidence} className="h-2" />
                </div>

                {/* Skills */}
                {player.skillsObserved.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {player.skillsObserved.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {player.skillsObserved.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{player.skillsObserved.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Expand/Collapse Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => togglePlayer(player.playerName)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Hide Video Appearances
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show Video Appearances
                    </>
                  )}
                </Button>

                {/* Expanded Video List */}
                {isExpanded && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-semibold mb-2">Video Appearances</h4>
                    {player.videoAppearances.map((appearance) => (
                      <Link 
                        key={appearance.videoId} 
                        href={`/analysis/${appearance.videoId}?tab=players`}
                      >
                        <div className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="text-sm font-medium line-clamp-1">
                            {appearance.videoTitle}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>{appearance.clipCount} clips</span>
                            <span>{appearance.confidence}% confidence</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Additional Stats when Expanded */}
                {isExpanded && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-semibold mb-2">Detailed Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dodges</span>
                        <span className="font-medium">{player.totalActions.dodges}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shots</span>
                        <span className="font-medium">{player.totalActions.shots}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Passes</span>
                        <span className="font-medium">{player.totalActions.passes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Defense</span>
                        <span className="font-medium">{player.totalActions.defensivePlays}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}