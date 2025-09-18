import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import PersonalHighlightEvaluations from "@/components/personal-highlight-evaluations";
import { DetailedAnalysisView } from "@/components/detailed-analysis-view";
import { 
  Trophy,
  Users,
  BarChart3,
  Shield,
  Clock,
  TrendingUp,
  Activity,
  Sparkles,
  FileText,
  Target,
  Eye,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

interface GameAnalysisModernProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function GameAnalysisModern({ video, analyses, formatTimestamp }: GameAnalysisModernProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const faceOffAnalyses = analyses?.filter(a => a.type === 'face_off') || [];
  const transitionAnalyses = analyses?.filter(a => a.type === 'transition') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Calculate metrics
  const gameMetrics = {
    totalPlayers: playerEvaluations.length,
    avgPlayerConfidence: playerEvaluations.length > 0 
      ? Math.round(playerEvaluations.reduce((sum, p) => sum + p.confidence, 0) / playerEvaluations.length)
      : 0,
    totalFaceoffs: faceOffAnalyses.length,
    faceoffWinRate: faceOffAnalyses.length > 0 
      ? Math.round((faceOffAnalyses.filter(f => 
          f.content.toLowerCase().includes('win') || 
          f.content.toLowerCase().includes('won') ||
          f.content.toLowerCase().includes('successful')
        ).length / faceOffAnalyses.length) * 100)
      : 0,
    totalTransitions: transitionAnalyses.length,
    transitionSuccessRate: transitionAnalyses.length > 0
      ? Math.round((transitionAnalyses.filter(t => 
          t.content.toLowerCase().includes('success') || 
          t.content.toLowerCase().includes('effective') ||
          t.content.toLowerCase().includes('clean')
        ).length / transitionAnalyses.length) * 100)
      : 0,
    keyMoments: keyMoments.length,
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText, count: 1 },
    { id: "players", label: "Players", icon: Users, count: playerEvaluations.length },
    { id: "faceoffs", label: "Face-offs", icon: Shield, count: faceOffAnalyses.length },
    { id: "transitions", label: "Transitions", icon: TrendingUp, count: transitionAnalyses.length },
    { id: "moments", label: "Key Moments", icon: Sparkles, count: keyMoments.length },
    { id: "metrics", label: "Advanced Metrics", icon: BarChart3, count: 1 },
  ];

  return (
    <div className="w-full">
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <Badge variant="secondary" className="text-xs">{gameMetrics.avgPlayerConfidence}%</Badge>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{gameMetrics.totalPlayers}</p>
          <p className="text-xs text-blue-700 dark:text-blue-300">Players Analyzed</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <Badge variant="secondary" className="text-xs">{gameMetrics.faceoffWinRate}%</Badge>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{gameMetrics.totalFaceoffs}</p>
          <p className="text-xs text-purple-700 dark:text-purple-300">Face-offs Tracked</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <Badge variant="secondary" className="text-xs">{gameMetrics.transitionSuccessRate}%</Badge>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{gameMetrics.totalTransitions}</p>
          <p className="text-xs text-green-700 dark:text-green-300">Transitions</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <Badge variant="secondary" className="text-xs">High</Badge>
          </div>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{gameMetrics.keyMoments}</p>
          <p className="text-xs text-orange-700 dark:text-orange-300">Key Moments</p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="relative">
              <tab.icon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {overallAnalysis && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Game Overview Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {overallAnalysis.content}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    {overallAnalysis.confidence}% confidence
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimestamp(overallAnalysis.timestamp) || 'Full Game'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Game Summary Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">White Team Players</span>
                    <Badge>{playerEvaluations.filter(p => p.content.toLowerCase().includes('white')).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Dark Team Players</span>
                    <Badge>{playerEvaluations.filter(p => !p.content.toLowerCase().includes('white')).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Analysis Coverage</span>
                    <Badge variant="outline">{analyses.length} total</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Game Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Scoring Plays</span>
                    <Badge>{keyMoments.filter(m => m.content.toLowerCase().includes('goal')).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Critical Saves</span>
                    <Badge>{keyMoments.filter(m => m.content.toLowerCase().includes('save')).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Momentum Shifts</span>
                    <Badge>{keyMoments.filter(m => m.content.toLowerCase().includes('momentum')).length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Players Tab */}
        <TabsContent value="players" className="space-y-4">
          {playerEvaluations.length > 0 ? (
            <>
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
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No player evaluations available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Face-offs Tab */}
        <TabsContent value="faceoffs" className="space-y-4">
          {faceOffAnalyses.length > 0 ? (
            <div className="grid gap-4">
              {faceOffAnalyses.map((faceoff: any, index: number) => (
                <Card key={faceoff.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                        Face-off #{index + 1}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
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
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{faceoff.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No face-off analyses available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transitions Tab */}
        <TabsContent value="transitions" className="space-y-4">
          {transitionAnalyses.length > 0 ? (
            <div className="grid gap-4">
              {transitionAnalyses.map((transition: any, index: number) => (
                <Card key={transition.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Transition #{index + 1}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
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
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{transition.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No transition analyses available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Key Moments Tab */}
        <TabsContent value="moments" className="space-y-4">
          {keyMoments.length > 0 ? (
            <div className="space-y-3">
              {keyMoments.map((moment: any, index: number) => (
                <Card key={moment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimestamp(moment.timestamp)}
                          </Badge>
                          <Badge variant="outline">
                            {moment.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{moment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No key moments identified
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Advanced Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          {playerEvaluations.length > 0 ? (
            <DetailedAnalysisView videoId={video.id} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No data available for advanced metrics
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
