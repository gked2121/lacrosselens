import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Target, Users, TrendingUp } from "lucide-react";

interface PlayerMetric {
  totalClips: number;
  averageConfidence: number;
  actions: {
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
  timeRange: {
    firstAppearance: number;
    lastAppearance: number;
  };
}

interface TeamMetric {
  players: string[];
  faceOffsWon: number;
  faceOffsLost: number;
  transitionOpportunities: number;
  clears: {
    successful: number;
    failed: number;
  };
  rides: {
    successful: number;
    failed: number;
  };
}

interface DetailedMetrics {
  playerMetrics: Record<string, PlayerMetric>;
  teamMetrics: Record<string, TeamMetric>;
  gameFlow: {
    momentumShifts: Array<{
      timestamp: number;
      description: string;
      impact: "major" | "moderate" | "minor";
    }>;
    criticalPeriods: Array<{ start: number; end: number; description: string }>;
  };
  advancedStats: any;
  communicationTracking: {
    defensiveCalls: number;
    offensiveSets: number;
    leadershipMoments: string[];
  };
  physicalPerformance: {
    sprintCount: number;
    explosivePlays: number;
    fatigueIndicators: string[];
  };
}

interface DetailedAnalysisViewProps {
  videoId: number;
}

export function DetailedAnalysisView({ videoId }: DetailedAnalysisViewProps) {
  const { data: detailedMetrics, isLoading } = useQuery<DetailedMetrics>({
    queryKey: [`/api/videos/${videoId}/detailed-metrics`],
    enabled: !!videoId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="h-48 bg-muted rounded-lg"></div>
        <div className="h-48 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (!detailedMetrics) {
    return null;
  }

  const { playerMetrics, teamMetrics, gameFlow, advancedStats, communicationTracking, physicalPerformance } = detailedMetrics;

  // Get top 5 players by clip count
  const topPlayers = Object.entries(playerMetrics || {})
    .sort(([, a], [, b]) => b.totalClips - a.totalClips)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Player Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Player Activity Overview
          </CardTitle>
          <CardDescription>Detailed tracking of all player actions and performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topPlayers.map(([playerNumber, data]) => (
            <div key={playerNumber} className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">{playerNumber}</h4>
                <div className="flex items-center gap-2">
                  <Badge>{data.totalClips} clips</Badge>
                  <Badge variant="secondary">{Math.round(data.averageConfidence)}% confidence</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dodges:</span>
                  <span className="font-medium">{data.actions.dodges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shots:</span>
                  <span className="font-medium">{data.actions.shots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passes:</span>
                  <span className="font-medium">{data.actions.passes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Defense:</span>
                  <span className="font-medium">{data.actions.defensivePlays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ground Balls:</span>
                  <span className="font-medium">{data.actions.groundBalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goals:</span>
                  <span className="font-medium">{data.actions.goals}</span>
                </div>
              </div>
              
              {data.skillsObserved.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.skillsObserved.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Active from {Math.floor(data.timeRange.firstAppearance / 60)}:{(data.timeRange.firstAppearance % 60).toFixed(0).padStart(2, '0')} 
                {' '}to {Math.floor(data.timeRange.lastAppearance / 60)}:{(data.timeRange.lastAppearance % 60).toFixed(0).padStart(2, '0')}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Team Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Team Performance Metrics
          </CardTitle>
          <CardDescription>Comparative team statistics and performance indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(teamMetrics || {}).map(([team, data]) => (
            <div key={team} className="space-y-2">
              <h4 className="font-semibold capitalize">{team} Team</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Face-offs Won</span>
                    <span className="text-sm font-medium">{data.faceOffsWon}</span>
                  </div>
                  <Progress value={(data.faceOffsWon / (data.faceOffsWon + data.faceOffsLost || 1)) * 100} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Clears</span>
                    <span className="text-sm font-medium">
                      {data.clears.successful}/{data.clears.successful + data.clears.failed}
                    </span>
                  </div>
                  <Progress value={(data.clears.successful / (data.clears.successful + data.clears.failed || 1)) * 100} />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {data.transitionOpportunities} transition opportunities • {data.players.length} players tracked
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Physical Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Physical Performance Indicators
          </CardTitle>
          <CardDescription>Sprint counts, explosive plays, and fatigue tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{physicalPerformance?.sprintCount || 0}</div>
              <div className="text-sm text-muted-foreground">Sprint Count</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{physicalPerformance?.explosivePlays || 0}</div>
              <div className="text-sm text-muted-foreground">Explosive Plays</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{physicalPerformance?.fatigueIndicators?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Fatigue Indicators</div>
            </div>
          </div>
          {physicalPerformance?.fatigueIndicators && physicalPerformance.fatigueIndicators.length > 0 && (
            <div className="mt-4 space-y-1">
              <div className="text-sm font-medium">Fatigue Observed:</div>
              {physicalPerformance.fatigueIndicators.map((indicator, idx) => (
                <div key={idx} className="text-xs text-muted-foreground">{indicator}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Game Flow Analysis
          </CardTitle>
          <CardDescription>Momentum shifts and critical game periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Momentum Shifts</span>
              <span className="font-medium">{gameFlow?.momentumShifts?.length || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Communication Instances</span>
              <span className="font-medium">
                {(communicationTracking?.defensiveCalls || 0) + (communicationTracking?.offensiveSets || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Leadership Moments</span>
              <span className="font-medium">{communicationTracking?.leadershipMoments?.length || 0}</span>
            </div>
          </div>
          
          {gameFlow?.momentumShifts && gameFlow.momentumShifts.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium">Key Momentum Shifts:</div>
              {gameFlow.momentumShifts.slice(0, 3).map((shift, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Badge variant={shift.impact === "major" ? "default" : shift.impact === "moderate" ? "secondary" : "outline"}>
                    {shift.impact}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor(shift.timestamp / 60)}:{(shift.timestamp % 60).toFixed(0).padStart(2, '0')} - {shift.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}