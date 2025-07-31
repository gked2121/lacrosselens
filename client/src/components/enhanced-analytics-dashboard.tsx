import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Trophy,
  Activity,
  Target,
  Shield,
  Zap,
  ChevronRight
} from "lucide-react";

interface PlayerMetrics {
  playerId: number;
  playerIdentifier: string;
  totalEvents: number;
  goals: number;
  assists: number;
  shots: number;
  saves: number;
  causedTurnovers: number;
  turnovers: number;
  groundBalls: number;
  faceoffWins: number;
  faceoffLosses: number;
  clearingSuccess: number;
  clearingAttempts: number;
  overallRating: number;
  recentForm: 'improving' | 'declining' | 'stable';
  keyStrengths: string[];
  areasForImprovement: string[];
}

interface TeamAnalytics {
  videoId: number;
  teamColor: string;
  offensiveEfficiency: number;
  defensiveEfficiency: number;
  transitionSuccessRate: number;
  faceoffWinPercentage: number;
  possessionTime: number;
  shotConversionRate: number;
  formationEffectiveness: Record<string, number>;
  momentumPeriods: Array<{
    start: number;
    end: number;
    strength: 'positive' | 'negative' | 'neutral';
  }>;
}

interface CoachingInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  playerDevelopment: Record<string, any>;
  tacticalAdjustments: string[];
}

export function EnhancedAnalyticsDashboard({ videoId }: { videoId: number }) {
  const [selectedTeam, setSelectedTeam] = useState<'white' | 'dark'>('white');

  // Fetch team analytics
  const { data: teamAnalytics, isLoading: teamLoading } = useQuery<TeamAnalytics>({
    queryKey: [`/api/analytics/video/${videoId}/team/${selectedTeam}`],
    enabled: !!videoId,
  });

  // Fetch game flow analysis
  const { data: gameFlow } = useQuery<any>({
    queryKey: [`/api/analytics/video/${videoId}/gameflow`],
    enabled: !!videoId,
  });

  // Fetch faceoff analytics
  const { data: faceoffData } = useQuery<any>({
    queryKey: [`/api/analytics/video/${videoId}/faceoffs`],
    enabled: !!videoId,
  });

  // Fetch coaching insights
  const { data: insights } = useQuery<CoachingInsights>({
    queryKey: [`/api/analytics/video/${videoId}/insights`],
    enabled: !!videoId,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFormBadgeColor = (form: string) => {
    switch (form) {
      case 'improving': return 'bg-green-100 text-green-800';
      case 'declining': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Selection */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={selectedTeam === 'white' ? 'default' : 'outline'}
          onClick={() => setSelectedTeam('white')}
          className="flex items-center gap-2"
        >
          <div className="w-4 h-4 bg-white border border-gray-300 rounded-full" />
          White Team
        </Button>
        <Button
          variant={selectedTeam === 'dark' ? 'default' : 'outline'}
          onClick={() => setSelectedTeam('dark')}
          className="flex items-center gap-2"
        >
          <div className="w-4 h-4 bg-gray-800 rounded-full" />
          Dark Team
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tactics">Tactics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {teamAnalytics && (
            <>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Offensive Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {teamAnalytics.offensiveEfficiency.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Shot conversion rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Defensive Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {teamAnalytics.defensiveEfficiency.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Save percentage</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Transition Success
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {teamAnalytics.transitionSuccessRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Clear/ride success</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Face-off Win %
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {teamAnalytics.faceoffWinPercentage.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Face-off success</p>
                  </CardContent>
                </Card>
              </div>

              {/* Possession and Momentum */}
              <Card>
                <CardHeader>
                  <CardTitle>Game Control</CardTitle>
                  <CardDescription>Possession time and momentum shifts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Possession Time</span>
                      <span className="text-sm text-muted-foreground">
                        {teamAnalytics.possessionTime.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={teamAnalytics.possessionTime} className="h-3" />
                  </div>

                  {teamAnalytics.momentumPeriods.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Momentum Periods</h4>
                      <div className="space-y-2">
                        {teamAnalytics.momentumPeriods.map((period, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <Badge variant={
                              period.strength === 'positive' ? 'default' : 
                              period.strength === 'negative' ? 'destructive' : 'secondary'
                            }>
                              {period.strength}
                            </Badge>
                            <span>
                              {formatTime(period.start)} - {formatTime(period.end)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {faceoffData && (
            <Card>
              <CardHeader>
                <CardTitle>Face-off Performance</CardTitle>
                <CardDescription>Detailed face-off analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Technique Success Rates</h4>
                      {Object.entries(faceoffData.techniqueStats || {}).map(([tech, stats]: [string, any]) => (
                        <div key={tech} className="flex justify-between items-center py-1">
                          <span className="text-sm capitalize">{tech}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {stats.wins}/{stats.attempts}
                            </span>
                            <Progress 
                              value={stats.attempts > 0 ? (stats.wins / stats.attempts) * 100 : 0} 
                              className="w-20 h-2" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Exit Strategies</h4>
                      {Object.entries(faceoffData.exitStats || {}).map(([direction, stats]: [string, any]) => (
                        <div key={direction} className="flex justify-between items-center py-1">
                          <span className="text-sm capitalize">{direction}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {stats.fastBreaks} fast breaks
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Technical Score</span>
                      <span className="text-lg font-bold">
                        {faceoffData.averageTechnicalScore?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {gameFlow && (
            <Card>
              <CardHeader>
                <CardTitle>Game Flow Analysis</CardTitle>
                <CardDescription>Critical moments and period breakdowns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gameFlow.keyMoments?.slice(0, 5).map((moment: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <Badge variant={
                        moment.impact === 'high' ? 'default' :
                        moment.impact === 'medium' ? 'secondary' : 'outline'
                      }>
                        {formatTime(moment.timestamp)}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm">{moment.description}</p>
                        {moment.momentum_shift && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Momentum Shift
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tactics Tab */}
        <TabsContent value="tactics" className="space-y-4">
          {teamAnalytics && teamAnalytics.formationEffectiveness && (
            <Card>
              <CardHeader>
                <CardTitle>Formation Effectiveness</CardTitle>
                <CardDescription>Success rates by tactical formation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(teamAnalytics.formationEffectiveness).map(([formation, effectiveness]) => (
                    <div key={formation}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{formation}</span>
                        <span className="text-sm text-muted-foreground">{effectiveness}%</span>
                      </div>
                      <Progress value={effectiveness} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {insights && insights.tacticalAdjustments && (
            <Card>
              <CardHeader>
                <CardTitle>Tactical Recommendations</CardTitle>
                <CardDescription>Strategic adjustments based on analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.tacticalAdjustments.map((adjustment, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <p className="text-sm">{adjustment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insights && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Team Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insights.strengths.map((strength, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                          <p className="text-sm">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-700">Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insights.weaknesses.map((weakness, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5" />
                          <p className="text-sm">{weakness}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Coaching Recommendations</CardTitle>
                  <CardDescription>Actionable insights for practice planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}