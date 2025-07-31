import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import PersonalHighlightEvaluations from "@/components/personal-highlight-evaluations";
import { DetailedAnalysisView } from "@/components/detailed-analysis-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  ChevronUp,
  Activity,
  Info,
  Zap
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
  const [showConfidenceInfo, setShowConfidenceInfo] = useState(false);

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
            <Button className="btn-outline">
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
      title: (video as any).title?.toLowerCase().includes('highlight') ? 
        `All Players in ${(video as any).title.split(' ')[0]}'s Highlights` : 
        'Player Evaluations',
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
    },
    {
      id: 'detailed',
      title: 'Detailed Metrics',
      icon: Activity,
      count: playerEvaluations.length > 0 ? 1 : 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/5',
      borderColor: 'border-purple-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <Link href="/videos">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <Badge 
              variant={(video as any).status === 'completed' ? 'default' : 'secondary'}
              className="gradient-primary text-primary-foreground border-0 text-xs sm:text-sm"
            >
              {(video as any).status === 'completed' ? 'Analysis Complete' : 'Processing'}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                {(video as any).title}
              </h1>
              {/* Check if this is a drill video */}
              {((video as any).metadata?.videoType === 'drill' || 
                (video as any).title?.toLowerCase().includes('drill') ||
                (video as any).title?.toLowerCase().includes('training') ||
                (video as any).title?.toLowerCase().includes('shooting')) ? (
                <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                  {(video as any).youtubeUrl ? 'YouTube video' : 'Training drill'} by {(video as any).metadata?.channel || 'coach'}
                  {(video as any).metadata?.publishedAt ? `, published on ${new Date((video as any).metadata.publishedAt).toLocaleDateString()}` : ''}. 
                  Drill analysis for technique improvement and skill development
                </p>
              ) : (
                <>
                  {(video as any).description && (
                    <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-none">
                      {(video as any).description}
                    </p>
                  )}
                  {/* Special notice for highlight tapes */}
                  {(video as any).title && ((video as any).title.toLowerCase().includes('highlight') || 
                    (video as any).metadata?.videoType === 'highlight_tape') && playerEvaluations.length > 1 && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Player Highlight Analysis:</strong> This analysis evaluates all players visible in {(video as any).title.split(' ')[0]}'s highlights, 
                          including opponents and teammates. {playerEvaluations.length} different players were identified and analyzed throughout the video.
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <Button className="btn-secondary text-xs sm:text-sm px-2 sm:px-4">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export Report</span>
              </Button>
              {(video as any).youtubeUrl && (
                <Button 
                  className="btn-primary text-xs sm:text-sm px-2 sm:px-4"
                  onClick={() => window.open((video as any).youtubeUrl, '_blank')}
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Watch on YouTube</span>
                  <span className="sm:hidden">Watch</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Video Preview */}
        {(video as any).thumbnailUrl && (
          <Card className="mb-4 sm:mb-6 overflow-hidden shadow-soft">
            <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
              <img 
                src={(video as any).thumbnailUrl} 
                alt={(video as any).title}
                className="w-full h-full object-cover"
              />
              {(video as any).youtubeUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    size="sm"
                    className="glass text-white border-white/20 hover:bg-white/20 text-xs sm:text-sm sm:size-lg px-3 sm:px-6 py-2 sm:py-3"
                    onClick={() => window.open((video as any).youtubeUrl, '_blank')}
                  >
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 sm:mr-2" />
                    <span className="hidden sm:inline">Play Video</span>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Confidence Score Info */}
        <div className="mb-6">
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader 
              className="cursor-pointer p-3 sm:p-4"
              onClick={() => setShowConfidenceInfo(!showConfidenceInfo)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-sm sm:text-base">What are Confidence Scores?</CardTitle>
                </div>
                {showConfidenceInfo ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {showConfidenceInfo && (
              <CardContent className="pt-0 px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Confidence scores (0-100%) show how certain the AI is about each analysis based on video quality and visibility.
                  </p>
                  <div className="grid gap-2">
                    <div className="flex items-start gap-2">
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">90-100%</Badge>
                      <span className="text-xs text-muted-foreground">Crystal clear view, all details visible</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">75-89%</Badge>
                      <span className="text-xs text-muted-foreground">Good visibility, minor details unclear</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">60-74%</Badge>
                      <span className="text-xs text-muted-foreground">Minimum acceptable visibility</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                      <AlertCircle className="inline w-3 h-3 mr-1" />
                      Note: Analyses with confidence below 60% are automatically filtered out to ensure reliability.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Higher confidence means better video quality, clearer jersey numbers, and optimal camera angles.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Analysis Content */}
        {(video as any).status === 'completed' ? (
          <div className="space-y-3 sm:space-y-6">
            {/* Check if this is a drill/training video */}
            {((video as any).metadata?.videoType === 'drill' || 
              (video as any).title?.toLowerCase().includes('drill') ||
              (video as any).title?.toLowerCase().includes('training') ||
              (video as any).title?.toLowerCase().includes('shooting')) ? (
              /* Drill-specific UI */
              <div className="space-y-6">
                {/* Drill Overview */}
                {overallAnalysis && (
                  <Card className="shadow-soft border-blue-200/50 bg-blue-50/30">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Target className="w-6 h-6 text-blue-600" />
                        Drill Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {overallAnalysis.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Technique Breakdown */}
                {playerEvaluations.length > 0 && (
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        Technique Observations
                      </CardTitle>
                      <CardDescription>Individual technique analysis from the drill</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {playerEvaluations.map((evaluation: any, index: number) => (
                          <div key={evaluation.id} className="border-l-4 border-green-500/50 pl-4 py-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">
                                {evaluation.title || `Player ${index + 1}`}
                              </h4>
                              {evaluation.timestamp && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(evaluation.timestamp)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {evaluation.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Key Coaching Points */}
                {keyMoments.length > 0 && (
                  <Card className="shadow-soft border-purple-200/50 bg-purple-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        Key Coaching Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {keyMoments.map((moment: any, index: number) => (
                          <div key={moment.id} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-700">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {moment.content}
                              </p>
                              {moment.timestamp && (
                                <span className="text-xs text-muted-foreground mt-1 inline-block">
                                  @ {formatTimestamp(moment.timestamp)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Summary Stats for Drill */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Analysis Summary</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{overallAnalysis ? 1 : 0} Overview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{playerEvaluations.length} Technique{playerEvaluations.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">{keyMoments.length} Coaching Point{keyMoments.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Regular game analysis UI */
              <>
                {/* Overall Analysis - Always Visible */}
                {overallAnalysis && (
              <Card className="shadow-soft">
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg p-3 sm:p-6" onClick={() => toggleSection('overview')}>
                  <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Overall Analysis
                    </div>
                    {expandedSections.has('overview') ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
                {expandedSections.has('overview') && (
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                    {/* Parse and format the overall analysis content */}
                    {overallAnalysis.content.split('\n\n').map((section: string, idx: number) => {
                      const [title, ...contentLines] = section.split('\n');
                      return (
                        <div key={idx} className="space-y-2">
                          {title && title.includes(':') ? (
                            <>
                              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                                {title.replace(':', '')}
                              </h3>
                              <div className="pl-2 sm:pl-4 space-y-1">
                                {contentLines.map((line: string, lineIdx: number) => (
                                  <p key={lineIdx} className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                                    {line}
                                  </p>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                              {section}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t flex flex-wrap items-center gap-2 sm:gap-4">
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
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${section.bgColor} ${section.borderColor} border-b p-3 sm:p-6`}
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${section.bgColor} ${section.borderColor} border flex-shrink-0`}>
                          <section.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${section.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm sm:text-lg leading-tight">{section.title}</CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {section.count} {section.count === 1 ? 'analysis' : 'analyses'} available
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <Badge variant="secondary" className="text-sm sm:text-lg font-bold px-2 sm:px-3">
                          {section.count}
                        </Badge>
                        {expandedSections.has(section.id) ? (
                          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedSections.has(section.id) && (
                    <CardContent className="p-3 sm:p-6">
                      {/* Player Evaluations */}
                      {section.id === 'players' && (
                        <div className="space-y-3 sm:space-y-4">
                          {/* Check if this is a personal highlight video */}
                          {((video as any).title?.toLowerCase().includes('highlight') || 
                            (video as any).metadata?.videoType === 'highlight_tape') ? (
                            <>
                              {/* Extract player name from title (first word before "highlight") */}
                              {(() => {
                                const titleWords = (video as any).title?.split(' ') || [];
                                const highlightIndex = titleWords.findIndex((word: string) => 
                                  word.toLowerCase().includes('highlight')
                                );
                                const playerName = highlightIndex > 0 ? titleWords[0] : 'Target Player';
                                
                                return (
                                  <PersonalHighlightEvaluations
                                    evaluations={playerEvaluations}
                                    formatTimestamp={formatTimestamp as (timestamp: number) => string}
                                    playerName={playerName}
                                  />
                                );
                              })()}
                            </>
                          ) : (
                            /* Regular team game analysis */
                            <PlayerEvaluationsGrouped 
                              evaluations={playerEvaluations}
                              formatTimestamp={formatTimestamp as (timestamp: number) => string}
                            />
                          )}
                        </div>
                      )}
                      
                      {/* Face-off Analysis */}
                      {section.id === 'faceoffs' && (
                        <div className="space-y-3 sm:space-y-4">
                          {faceOffAnalyses.map((faceoff: any, index: number) => (
                            <Card key={faceoff.id} className="shadow-sm hover:shadow-md transition-all">
                              <CardHeader className="p-3 sm:p-6">
                                <CardTitle className="text-sm sm:text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <span>Face-off #{index + 1}</span>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                    {faceoff.metadata?.winProbability && (
                                      <Badge 
                                        className={`text-xs ${
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
                              <CardContent className="p-3 sm:p-6 pt-0">
                                <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                                  {faceoff.content}
                                </p>
                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
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
                        <div className="space-y-3 sm:space-y-4">
                          {transitionAnalyses.map((transition: any, index: number) => (
                            <Card key={transition.id} className="shadow-sm hover:shadow-md transition-all">
                              <CardHeader className="p-3 sm:p-6">
                                <CardTitle className="text-sm sm:text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <span>Transition #{index + 1}</span>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                    {transition.metadata?.successProbability && (
                                      <Badge 
                                        className={`text-xs ${
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
                              <CardContent className="p-3 sm:p-6 pt-0">
                                <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                                  {transition.content}
                                </p>
                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
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
                        <div className="space-y-3 sm:space-y-4">
                          {keyMoments.map((moment: any, index: number) => (
                            <Card key={moment.id} className="shadow-sm hover:shadow-md transition-all">
                              <CardHeader className="p-3 sm:p-6">
                                <CardTitle className="text-sm sm:text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <span className="line-clamp-2 sm:line-clamp-none">{moment.title || `Moment #${index + 1}`}</span>
                                  {moment.timestamp && (
                                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                                      {formatTimestamp(moment.timestamp)}
                                    </Badge>
                                  )}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 sm:p-6 pt-0">
                                <p className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                                  {moment.content}
                                </p>
                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex flex-wrap items-center gap-2">
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
                      
                      {/* Detailed Metrics */}
                      {section.id === 'detailed' && (
                        <DetailedAnalysisView videoId={parseInt(id || '0')} />
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
            </>
            )}
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