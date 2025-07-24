import { useEffect } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import VideoPlayer from "@/components/video-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderPinwheel, Users, Target, Zap, Star, Clock, TrendingUp } from "lucide-react";

export default function AnalysisDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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
    queryKey: ["/api/videos", id],
    retry: false,
  });

  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ["/api/videos", id, "analyses"],
    retry: false,
    enabled: !!(video as any) && (video as any)?.status === 'completed',
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderPinwheel className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="aspect-video bg-muted rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!(video as any)) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-foreground mb-2">Video Not Found</h1>
              <p className="text-muted-foreground">The video you're looking for doesn't exist.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnalysisByType = (type: string) => {
    return Array.isArray(analyses) ? (analyses as any[]).filter((analysis: any) => analysis.type === type) : [];
  };

  const overallAnalysis = getAnalysisByType('overall')[0];
  const playerEvaluations = getAnalysisByType('player_evaluation');
  const faceOffAnalyses = getAnalysisByType('face_off');
  const transitionAnalyses = getAnalysisByType('transition');
  const keyMoments = getAnalysisByType('key_moment');

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{(video as any).title}</h1>
                <p className="text-muted-foreground mt-1">
                  {(video as any).description || "Video analysis and coaching insights"}
                </p>
              </div>
              <Badge 
                variant={(video as any).status === 'completed' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {(video as any).status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <VideoPlayer video={video as any} />
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Upload Date</span>
                    <span className="text-sm font-medium">
                      {new Date((video as any).createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {(video as any).duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="text-sm font-medium">
                        {formatTimestamp((video as any).duration)}
                      </span>
                    </div>
                  )}

                  {analyses && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Insights</span>
                        <span className="text-sm font-medium">{(analyses as any[]).length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Confidence</span>
                        <span className="text-sm font-medium">
                          {Math.round((analyses as any[]).reduce((acc: number, a: any) => acc + (a.confidence || 0), 0) / (analyses as any[]).length)}%
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {(video as any).youtubeUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">YouTube</Badge>
                    <p className="text-xs text-muted-foreground mt-2 break-all">
                      {(video as any).youtubeUrl}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Analysis Content */}
          {(video as any).status === 'completed' && analyses ? (
            <div className="mt-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="players">Players</TabsTrigger>
                  <TabsTrigger value="faceoffs">Face-Offs</TabsTrigger>
                  <TabsTrigger value="transitions">Transitions</TabsTrigger>
                  <TabsTrigger value="moments">Key Moments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Overall Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {overallAnalysis ? (
                        <div className="prose prose-sm max-w-none">
                          <p className="text-muted-foreground whitespace-pre-line">
                            {overallAnalysis.content}
                          </p>
                          {overallAnalysis.confidence && (
                            <div className="mt-4">
                              <Badge variant="outline">
                                Confidence: {overallAnalysis.confidence}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Overall analysis not available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="players" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Player Evaluations
                      </h2>
                      <Badge variant="outline">
                        {playerEvaluations.length} Players Analyzed
                      </Badge>
                    </div>
                    
                    {playerEvaluations.length > 0 ? (
                      <div className="grid gap-4">
                        {playerEvaluations.map((evaluation: any) => (
                          <Card key={evaluation.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-foreground">
                                  {evaluation.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {evaluation.timestamp && (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatTimestamp(evaluation.timestamp)}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {evaluation.confidence}% confidence
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-muted-foreground whitespace-pre-line">
                                {evaluation.content}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No player evaluations available.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="faceoffs" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Face-Off Analysis
                      </h2>
                      <Badge variant="outline">
                        {faceOffAnalyses.length} Face-Offs Analyzed
                      </Badge>
                    </div>
                    
                    {faceOffAnalyses.length > 0 ? (
                      <div className="grid gap-4">
                        {faceOffAnalyses.map((faceOff: any) => (
                          <Card key={faceOff.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-foreground">
                                  {faceOff.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {faceOff.timestamp && (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatTimestamp(faceOff.timestamp)}
                                    </Badge>
                                  )}
                                  {faceOff.metadata?.winProbability && (
                                    <Badge variant="outline" className="text-xs">
                                      {faceOff.metadata.winProbability}% win rate
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-muted-foreground whitespace-pre-line">
                                {faceOff.content}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No face-off analysis available.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="transitions" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Transition Intelligence
                      </h2>
                      <Badge variant="outline">
                        {transitionAnalyses.length} Transitions Analyzed
                      </Badge>
                    </div>
                    
                    {transitionAnalyses.length > 0 ? (
                      <div className="grid gap-4">
                        {transitionAnalyses.map((transition: any) => (
                          <Card key={transition.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-foreground">
                                  {transition.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {transition.timestamp && (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatTimestamp(transition.timestamp)}
                                    </Badge>
                                  )}
                                  {transition.metadata?.successProbability && (
                                    <Badge variant="outline" className="text-xs">
                                      {transition.metadata.successProbability}% success rate
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-muted-foreground whitespace-pre-line">
                                {transition.content}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No transition analysis available.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="moments" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Key Moments
                      </h2>
                      <Badge variant="outline">
                        {keyMoments.length} Moments Identified
                      </Badge>
                    </div>
                    
                    {keyMoments.length > 0 ? (
                      <div className="grid gap-4">
                        {keyMoments.map((moment: any) => (
                          <Card key={moment.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-foreground">
                                  {moment.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {moment.timestamp && (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatTimestamp(moment.timestamp)}
                                    </Badge>
                                  )}
                                  {moment.metadata?.momentType && (
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {moment.metadata.momentType}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-muted-foreground whitespace-pre-line">
                                {moment.content}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No key moments identified.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (video as any).status === 'processing' ? (
            <div className="mt-8">
              <Card>
                <CardContent className="p-8 text-center">
                  <LoaderPinwheel className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    AI Analysis in Progress
                  </h3>
                  <p className="text-muted-foreground">
                    Our AI is analyzing your lacrosse video. This usually takes a few minutes.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mt-8">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-xl">!</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Analysis Failed
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    There was an issue analyzing this video. Please try uploading again.
                  </p>
                  <Button variant="outline">
                    Retry Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
