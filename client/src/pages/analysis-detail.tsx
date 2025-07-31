import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  Users, 
  Target, 
  Clock, 
  Download, 
  ArrowLeft,
  Play,
  Trophy,
  TrendingUp,
  AlertCircle,
  LoaderPinwheel,
  BarChart3,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface AnalysisSection {
  id: string;
  title: string;
  icon: any;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function AnalysisDetail() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { id } = useParams();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  // Extract tab from query parameters
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialTab = searchParams.get('tab') || 'overview';

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
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: [`/api/videos/${id}/analyses`],
    enabled: !!id,
    retry: false,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Force refresh when id changes
  useEffect(() => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${id}/analyses`] });
    }
  }, [id, queryClient]);

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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const analysisSections: AnalysisSection[] = [
    {
      id: 'players',
      title: 'Player Evaluations',
      icon: Users,
      count: playerEvaluations.length,
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/10'
    },
    {
      id: 'faceoffs',
      title: 'Face-off Analysis',
      icon: Target,
      count: faceOffAnalyses.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/5',
      borderColor: 'border-blue-500/10'
    },
    {
      id: 'transitions',
      title: 'Transition Analysis',
      icon: TrendingUp,
      count: transitionAnalyses.length,
      color: 'text-green-600',
      bgColor: 'bg-green-500/5',
      borderColor: 'border-green-500/10'
    },
    {
      id: 'moments',
      title: 'Key Moments',
      icon: Sparkles,
      count: keyMoments.length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/5',
      borderColor: 'border-orange-500/10'
    }
  ];

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
          <div className="space-y-6">
            {/* Overall Analysis - Always Visible */}
            {overallAnalysis && (
              <Card className="shadow-soft">
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg" onClick={() => toggleSection('overview')}>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Overall Analysis
                    </div>
                    {expandedSections.has('overview') ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
                {expandedSections.has('overview') && (
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
                )}
              </Card>
            )}

            {/* Dynamic Analysis Sections */}
            {analysisSections.map((section) => {
              if (section.count === 0) return null;
              
              return (
                <Card key={section.id} className="shadow-soft overflow-hidden">
                  <CardHeader 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${section.bgColor} ${section.borderColor} border-b`}
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${section.bgColor} ${section.borderColor} border`}>
                          <section.icon className={`w-5 h-5 ${section.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {section.count} {section.count === 1 ? 'analysis' : 'analyses'} available
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="text-lg font-bold">
                          {section.count}
                        </Badge>
                        {expandedSections.has(section.id) ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedSections.has(section.id) && (
                    <CardContent className="p-6">
                      {/* Player Evaluations */}
                      {section.id === 'players' && (
                        <PlayerEvaluationsGrouped 
                          evaluations={playerEvaluations}
                          formatTimestamp={formatTimestamp as (timestamp: number) => string}
                        />
                      )}
                      
                      {/* Face-off Analysis */}
                      {section.id === 'faceoffs' && (
                        <div className="space-y-4">
                          {faceOffAnalyses.map((faceoff: any, index: number) => (
                            <Card key={faceoff.id} className="shadow-sm hover:shadow-md transition-all">
                              <CardHeader>
                                <CardTitle className="text-base flex items-center justify-between">
                                  <span>Face-off #{index + 1}</span>
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
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                  {faceoff.content}
                                </p>
                                <div className="mt-4 pt-4 border-t">
                                  <Badge variant="outline" className="text-xs">
                                    Confidence: {faceoff.confidence}%
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                      
                      {/* Transition Analysis */}
                      {section.id === 'transitions' && (
                        <div className="space-y-4">
                          {transitionAnalyses.map((transition: any, index: number) => (
                            <Card key={transition.id} className="shadow-sm hover:shadow-md transition-all">
                              <CardHeader>
                                <CardTitle className="text-base flex items-center justify-between">
                                  <span>Transition #{index + 1}</span>
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
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                  {transition.content}
                                </p>
                                <div className="mt-4 pt-4 border-t">
                                  <Badge variant="outline" className="text-xs">
                                    Confidence: {transition.confidence}%
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                      
                      {/* Key Moments */}
                      {section.id === 'moments' && (
                        <div className="space-y-4">
                          {keyMoments.map((moment: any, index: number) => (
                            <Card key={moment.id} className="shadow-sm hover:shadow-md transition-all">
                              <CardHeader>
                                <CardTitle className="text-base flex items-center justify-between">
                                  <span>{moment.title || `Moment #${index + 1}`}</span>
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
                                <div className="mt-4 pt-4 border-t flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    Confidence: {moment.confidence}%
                                  </Badge>
                                  {moment.metadata?.type && (
                                    <Badge variant="outline" className="text-xs">
                                      {moment.metadata.type}
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {/* Analysis Summary Stats */}
            <Card className="shadow-soft bg-primary/5 border-primary/20">
              <CardContent className="py-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Analysis Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analysisSections.map((section) => (
                    <div key={section.id} className="text-center">
                      <div className={`text-2xl font-bold ${section.color}`}>
                        {section.count}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {section.title.replace(' Analysis', '')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Total of {(analyses as any[]).length} analyses generated from this video
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-soft">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <LoaderPinwheel className="w-12 h-12 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analysis in Progress</h3>
                <p className="text-muted-foreground mb-4">
                  Your video is being analyzed by our AI. This may take a few minutes.
                </p>
                <Progress value={65} className="w-full max-w-xs" />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}