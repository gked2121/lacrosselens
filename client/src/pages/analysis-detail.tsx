import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  Users, 
  Target, 
  Clock, 
  Download, 
  ArrowLeft,
  Play,
  ChevronRight,
  Trophy,
  TrendingUp,
  AlertCircle,
  LoaderPinwheel,
  BarChart3,
  Activity,
  CheckCircle2,
  Shield,
  AlertTriangle,
  ArrowLeftRight
} from "lucide-react";

export default function AnalysisDetail() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { id } = useParams();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: video, isLoading: videoLoading } = useQuery({
    queryKey: [`/api/videos/${id}`],
    enabled: !!id,
    retry: false,
  });

  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: [`/api/videos/${id}/analyses`],
    enabled: !!id,
    retry: false,
  });

  // Fetch video statistics
  // Removed statistics query as it was showing misleading aggregated data

  if (isLoading || !isAuthenticated || videoLoading || analysesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderPinwheel className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Video not found</h3>
          <Link href="/videos">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Videos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const overallAnalysis = (analyses as any[])?.find(a => a.type === 'overall');
  const playerEvaluations = (analyses as any[])?.filter(a => a.type === 'player_evaluation') || [];
  const faceOffAnalyses = (analyses as any[])?.filter(a => a.type === 'face_off') || [];
  const transitionAnalyses = (analyses as any[])?.filter(a => a.type === 'transition') || [];
  const keyMoments = (analyses as any[])?.filter(a => a.type === 'key_moment') || [];

  const formatTimestamp = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to extract and format sections from analysis content
  const formatAnalysisContent = (content: string) => {
    const sections = content.split('\n\n').filter(s => s.trim());
    return sections.map((section, idx) => {
      // Check for labeled sections
      const labelPatterns = [
        /^(BIOMECHANICS|TECHNIQUE|TACTICAL|DECISION MAKING|IMPROVEMENT|ANALYSIS|OBSERVATION):/i,
        /^(Clearing|Ride|Fast Break|Wing Play|Clamp|Rake):/i,
        /^(Goal|Save|Penalty|Turnover|Ground Ball):/i
      ];
      
      for (const pattern of labelPatterns) {
        const match = section.match(pattern);
        if (match) {
          const [label, ...contentParts] = section.split(':');
          return {
            type: 'labeled',
            label: label.trim(),
            content: contentParts.join(':').trim()
          };
        }
      }
      
      // Check for bullet points
      if (section.includes('•') || section.includes('-')) {
        const lines = section.split('\n');
        return {
          type: 'bulleted',
          items: lines.filter(line => line.trim())
        };
      }
      
      // Default paragraph
      return {
        type: 'paragraph',
        content: section
      };
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/videos">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Badge 
                variant={(video as any).status === 'completed' ? 'default' : 'secondary'}
                className="gradient-primary text-primary-foreground border-0"
              >
                {(video as any).status === 'completed' ? 'Analysis Complete' : 'Processing'}
              </Badge>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {(video as any).title}
                </h1>
                {(video as any).description && (
                  <p className="text-muted-foreground mt-1">
                    {(video as any).description}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                {(video as any).youtubeUrl && (
                  <Button 
                    className="btn-primary"
                    onClick={() => window.open((video as any).youtubeUrl, '_blank')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch on YouTube
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Video Preview */}
          {(video as any).thumbnailUrl && (
            <Card className="mb-6 overflow-hidden shadow-soft">
              <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                <img 
                  src={(video as any).thumbnailUrl} 
                  alt={(video as any).title}
                  className="w-full h-full object-cover"
                />
                {(video as any).youtubeUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button 
                      size="lg"
                      className="glass text-white border-white/20 hover:bg-white/20"
                      onClick={() => window.open((video as any).youtubeUrl, '_blank')}
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Play Video
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Analysis Content */}
          {(video as any).status === 'completed' ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full p-2 rounded-2xl" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                <TabsTrigger value="overview" className="rounded-xl font-semibold">Overview</TabsTrigger>
                <TabsTrigger value="players" className="rounded-xl font-semibold">Players</TabsTrigger>
                <TabsTrigger value="faceoffs" className="rounded-xl font-semibold">Face-offs</TabsTrigger>
                <TabsTrigger value="transitions" className="rounded-xl font-semibold">Transitions</TabsTrigger>
                <TabsTrigger value="moments" className="rounded-xl font-semibold">Key Moments</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Analysis Summary Card */}
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                          {playerEvaluations.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Players Analyzed</div>
                      </div>
                      <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                          {faceOffAnalyses.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Face-offs Analyzed</div>
                      </div>
                      <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                          {transitionAnalyses.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Transitions Analyzed</div>
                      </div>
                      <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                          {keyMoments.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Key Moments</div>
                      </div>
                    </div>
                    
                    {/* Analysis Coverage */}
                    <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">Analysis Coverage</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Player Evaluations</span>
                          <Badge variant={playerEvaluations.length >= 10 ? "default" : "secondary"}>
                            {playerEvaluations.length >= 10 ? "Comprehensive" : "Limited"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Technical Detail</span>
                          <Badge variant="default">High</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Analysis Type</span>
                          <Badge variant="outline">
                            {(video as any).metadata?.analysisType || 'Standard'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Note about statistics */}
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <span className="font-semibold">Note:</span> For accurate team-specific statistics, 
                        please specify your team name when uploading videos. This analysis includes observations 
                        from all visible plays and players.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {overallAnalysis && (
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Overall Game Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Parse and format the overall analysis content */}
                      {overallAnalysis.content.split('\n\n').map((section: string, idx: number) => {
                        const [title, ...contentLines] = section.split('\n');
                        return (
                          <div key={idx} className="space-y-2">
                            {title && title.includes(':') ? (
                              <>
                                <h3 className="font-semibold text-foreground">
                                  {title.replace(':', '')}
                                </h3>
                                <div className="pl-4 space-y-1">
                                  {contentLines.map((line: string, lineIdx: number) => (
                                    <p key={lineIdx} className="text-muted-foreground">
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p className="text-muted-foreground">
                                {section}
                              </p>
                            )}
                          </div>
                        );
                      })}
                      <div className="mt-6 pt-4 border-t flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">
                          Confidence: {overallAnalysis.confidence}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Analysis Method: {overallAnalysis.metadata?.analysisMethod || 'Standard'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="players" className="space-y-4">
                {/* Player Count Summary */}
                {playerEvaluations.length > 0 && (
                  <Card className="shadow-soft bg-primary/5 border-primary/20">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-6 h-6 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {playerEvaluations.length} Players Evaluated
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Analysis includes players from both teams visible in the video
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Team identification helper */}
                <Card className="shadow-soft bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="py-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-semibold">How to identify teams:</span> Look for jersey colors, 
                      player numbers, and position descriptions in each evaluation. The AI analyzes all visible 
                      players from both teams to provide comprehensive insights.
                    </p>
                  </CardContent>
                </Card>
                
                {playerEvaluations.length > 0 ? (
                  <PlayerEvaluationsGrouped 
                    evaluations={playerEvaluations}
                    formatTimestamp={formatTimestamp}
                  />
                ) : (
                  <Card className="shadow-soft">
                    <CardContent className="py-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No player evaluations available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="faceoffs" className="space-y-4">
                {/* Face-off Summary Stats */}
                {faceOffAnalyses.length > 0 && (
                  <Card className="shadow-soft bg-primary/5 border-primary/20">
                    <CardContent className="py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">
                            {faceOffAnalyses.length}
                          </p>
                          <p className="text-sm text-muted-foreground">Face-offs Analyzed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">
                            {Math.round(
                              faceOffAnalyses.reduce((sum: number, fo: any) => 
                                sum + (fo.metadata?.winProbability || 0), 0
                              ) / faceOffAnalyses.length
                            )}%
                          </p>
                          <p className="text-sm text-muted-foreground">Avg Win Probability</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">
                            {Math.round(
                              faceOffAnalyses.reduce((sum: number, fo: any) => 
                                sum + fo.confidence, 0
                              ) / faceOffAnalyses.length
                            )}%
                          </p>
                          <p className="text-sm text-muted-foreground">Avg Confidence</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {faceOffAnalyses.length > 0 ? (
                  faceOffAnalyses.map((faceoff: any, index: number) => (
                    <Card key={faceoff.id} className="shadow-soft hover:shadow-glow transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Face-off #{index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            {faceoff.metadata?.winProbability && (
                              <Badge 
                                className={`${
                                  faceoff.metadata.winProbability >= 70 
                                    ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                    : faceoff.metadata.winProbability >= 50
                                    ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}
                              >
                                {faceoff.metadata.winProbability}% Win
                              </Badge>
                            )}
                            {faceoff.timestamp && (
                              <Badge variant="secondary" className="text-xs">
                                {formatTimestamp(faceoff.timestamp)}
                              </Badge>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Format face-off analysis with sections */}
                          {faceoff.content.split('\n').map((line: string, idx: number) => {
                            // Check for technique indicators
                            if (line.includes('clamp') || line.includes('rake') || 
                                line.includes('plunger') || line.includes('jam')) {
                              return (
                                <div key={idx} className="pl-4 border-l-2 border-primary/30">
                                  <p className="text-muted-foreground">
                                    <span className="font-semibold text-primary">Technique: </span>
                                    {line}
                                  </p>
                                </div>
                              );
                            }
                            // Check for wing play
                            if (line.toLowerCase().includes('wing')) {
                              return (
                                <div key={idx} className="pl-4 border-l-2 border-blue-500/30">
                                  <p className="text-muted-foreground">
                                    <span className="font-semibold text-blue-600">Wing Play: </span>
                                    {line}
                                  </p>
                                </div>
                              );
                            }
                            return (
                              <p key={idx} className="text-muted-foreground">
                                {line}
                              </p>
                            );
                          })}
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Confidence: {faceoff.confidence}%
                          </Badge>
                          {faceoff.metadata?.technique && (
                            <Badge variant="outline" className="text-xs">
                              Technique: {faceoff.metadata.technique}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="shadow-soft">
                    <CardContent className="py-12 text-center">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No face-off analyses available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="transitions" className="space-y-4">
                {/* Transition Summary */}
                {transitionAnalyses.length > 0 && (
                  <Card className="shadow-soft bg-primary/5 border-primary/20">
                    <CardContent className="py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">
                            {transitionAnalyses.length}
                          </p>
                          <p className="text-sm text-muted-foreground">Transitions Analyzed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {transitionAnalyses.filter((t: any) => 
                              (t.metadata?.successProbability || 0) >= 70
                            ).length}
                          </p>
                          <p className="text-sm text-muted-foreground">High Success (70%+)</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">
                            {Math.round(
                              transitionAnalyses.reduce((sum: number, t: any) => 
                                sum + (t.metadata?.successProbability || 0), 0
                              ) / transitionAnalyses.length
                            )}%
                          </p>
                          <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {transitionAnalyses.length > 0 ? (
                  transitionAnalyses.map((transition: any, index: number) => (
                    <Card key={transition.id} className="shadow-soft hover:shadow-glow transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Transition #{index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            {transition.metadata?.successProbability && (
                              <Badge 
                                className={`${
                                  transition.metadata.successProbability >= 70 
                                    ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                    : transition.metadata.successProbability >= 50
                                    ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}
                              >
                                {transition.metadata.successProbability}% Success
                              </Badge>
                            )}
                            {transition.timestamp && (
                              <Badge variant="secondary" className="text-xs">
                                {formatTimestamp(transition.timestamp)}
                              </Badge>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Parse transition content for key elements */}
                          {transition.content.split('\n').map((line: string, idx: number) => {
                            // Highlight clearing elements
                            if (line.toLowerCase().includes('clear') || line.toLowerCase().includes('outlet')) {
                              return (
                                <div key={idx} className="pl-4 border-l-2 border-green-500/30">
                                  <p className="text-muted-foreground">
                                    <span className="font-semibold text-green-600">Clearing: </span>
                                    {line}
                                  </p>
                                </div>
                              );
                            }
                            // Highlight ride elements
                            if (line.toLowerCase().includes('ride') || line.toLowerCase().includes('pressure')) {
                              return (
                                <div key={idx} className="pl-4 border-l-2 border-red-500/30">
                                  <p className="text-muted-foreground">
                                    <span className="font-semibold text-red-600">Ride: </span>
                                    {line}
                                  </p>
                                </div>
                              );
                            }
                            // Highlight fast break
                            if (line.toLowerCase().includes('fast break') || line.toLowerCase().includes('numbers')) {
                              return (
                                <div key={idx} className="pl-4 border-l-2 border-blue-500/30">
                                  <p className="text-muted-foreground">
                                    <span className="font-semibold text-blue-600">Fast Break: </span>
                                    {line}
                                  </p>
                                </div>
                              );
                            }
                            return (
                              <p key={idx} className="text-muted-foreground">
                                {line}
                              </p>
                            );
                          })}
                        </div>
                        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Type</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {transition.metadata?.transitionType || 'General Transition'}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Confidence</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {transition.confidence}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="shadow-soft">
                    <CardContent className="py-12 text-center">
                      <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No transition analyses available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="moments" className="space-y-4">
                {/* Key Moments Timeline */}
                {keyMoments.length > 0 && (
                  <Card className="shadow-soft bg-primary/5 border-primary/20">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-semibold text-foreground">
                            {keyMoments.length} Key Moments Identified
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Critical plays and game-changing situations
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {keyMoments.length > 0 ? (
                  <div className="space-y-4">
                    {/* Sort moments by timestamp */}
                    {keyMoments
                      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
                      .map((moment: any, index: number) => {
                        // Determine moment type icon and color
                        const momentType = moment.metadata?.momentType || moment.metadata?.playType || 'general';
                        const isGoal = momentType.toLowerCase().includes('goal');
                        const isSave = momentType.toLowerCase().includes('save');
                        const isPenalty = momentType.toLowerCase().includes('penalty');
                        const isTurnover = momentType.toLowerCase().includes('turnover');
                        
                        return (
                          <Card key={moment.id} className="shadow-soft hover:shadow-glow transition-all">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  {isGoal ? (
                                    <Trophy className="w-5 h-5 text-green-600" />
                                  ) : isSave ? (
                                    <Shield className="w-5 h-5 text-blue-600" />
                                  ) : isPenalty ? (
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                  ) : isTurnover ? (
                                    <ArrowLeftRight className="w-5 h-5 text-red-600" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-primary" />
                                  )}
                                  {moment.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isGoal && (
                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                      GOAL
                                    </Badge>
                                  )}
                                  {isSave && (
                                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                                      SAVE
                                    </Badge>
                                  )}
                                  {isPenalty && (
                                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                      PENALTY
                                    </Badge>
                                  )}
                                  {moment.timestamp !== null && moment.timestamp !== undefined && (
                                    <Badge variant="secondary" className="text-xs">
                                      {formatTimestamp(moment.timestamp)}
                                    </Badge>
                                  )}
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* Format moment content with rich details */}
                                {moment.content.split('\n').map((line: string, idx: number) => {
                                  // Highlight player references
                                  if (line.includes('#') || line.includes('Player')) {
                                    return (
                                      <p key={idx} className="text-muted-foreground">
                                        {line.split(/(\#\d+|Player \d+)/).map((part, partIdx) => 
                                          /\#\d+|Player \d+/.test(part) ? (
                                            <span key={partIdx} className="font-semibold text-primary">
                                              {part}
                                            </span>
                                          ) : part
                                        )}
                                      </p>
                                    );
                                  }
                                  return (
                                    <p key={idx} className="text-muted-foreground">
                                      {line}
                                    </p>
                                  );
                                })}
                              </div>
                              
                              {/* Metadata display */}
                              <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Type</p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {moment.metadata?.momentType || moment.metadata?.playType || 'Key Moment'}
                                    </Badge>
                                  </div>
                                  {moment.metadata?.players && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Players Involved</p>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {Array.isArray(moment.metadata.players) 
                                          ? moment.metadata.players.join(', ')
                                          : moment.metadata.players}
                                      </Badge>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-xs text-muted-foreground">Confidence</p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {moment.confidence}%
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                ) : (
                  <Card className="shadow-soft">
                    <CardContent className="py-12 text-center">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No key moments identified</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="shadow-soft">
              <CardContent className="py-16 text-center">
                <LoaderPinwheel className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Processing Video</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your video is being analyzed by our AI. This may take a few minutes depending on the video length.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
    </div>
  );
}