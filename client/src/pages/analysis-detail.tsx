import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
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
  CheckCircle2
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
  const { data: statistics } = useQuery({
    queryKey: [`/api/videos/${id}/statistics`],
    enabled: !!id && video && (video as any).status === 'completed',
    retry: false,
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6 mobile-full">
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
                {/* Game Statistics Card */}
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Game Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                          {statistics?.goals || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Goals</div>
                      </div>
                      <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                          {statistics?.assists || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Assists</div>
                      </div>
                      <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                          {statistics?.faceOffTotal ? 
                            `${Math.round((statistics.faceOffWins / statistics.faceOffTotal) * 100)}%` : 
                            'N/A'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Face-off %</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {statistics?.faceOffWins || 0}/{statistics?.faceOffTotal || 0}
                        </div>
                      </div>
                      <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
                          {statistics?.saves || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Saves</div>
                      </div>
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
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {overallAnalysis.content}
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">
                          Confidence: {overallAnalysis.confidence}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="players" className="space-y-4">
                {playerEvaluations.length > 0 ? (
                  playerEvaluations.map((evaluation: any) => (
                    <Card key={evaluation.id} className="shadow-soft hover:shadow-glow transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            {evaluation.title}
                          </span>
                          {evaluation.timestamp && (
                            <Badge variant="secondary" className="text-xs">
                              {formatTimestamp(evaluation.timestamp)}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {evaluation.content}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Confidence: {evaluation.confidence}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
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
                {faceOffAnalyses.length > 0 ? (
                  faceOffAnalyses.map((faceoff: any) => (
                    <Card key={faceoff.id} className="shadow-soft hover:shadow-glow transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Face-off Analysis
                          </span>
                          {faceoff.timestamp && (
                            <Badge variant="secondary" className="text-xs">
                              {formatTimestamp(faceoff.timestamp)}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {faceoff.content}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Win Probability: {faceoff.metadata?.winProbability || 'N/A'}%
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Confidence: {faceoff.confidence}%
                          </Badge>
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
                {transitionAnalyses.length > 0 ? (
                  transitionAnalyses.map((transition: any) => (
                    <Card key={transition.id} className="shadow-soft hover:shadow-glow transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Transition Intelligence
                          </span>
                          {transition.timestamp && (
                            <Badge variant="secondary" className="text-xs">
                              {formatTimestamp(transition.timestamp)}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {transition.content}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Success Rate: {transition.metadata?.successProbability || 'N/A'}%
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Confidence: {transition.confidence}%
                          </Badge>
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
                {keyMoments.length > 0 ? (
                  keyMoments.map((moment: any) => (
                    <Card key={moment.id} className="shadow-soft hover:shadow-glow transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            {moment.title}
                          </span>
                          {moment.timestamp && (
                            <Badge variant="secondary" className="text-xs">
                              {formatTimestamp(moment.timestamp)}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {moment.content}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Type: {moment.metadata?.momentType || 'General'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Confidence: {moment.confidence}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
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
    </div>
  );
}