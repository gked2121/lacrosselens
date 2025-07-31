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
import { DrillAnalysis } from "@/components/video-type-analysis/drill-analysis";
import { HighlightAnalysisEnhanced } from "@/components/video-type-analysis/highlight-analysis-enhanced";
import { RecruitingAnalysisEnhanced } from "@/components/video-type-analysis/recruiting-analysis-enhanced";
import { PracticeAnalysisEnhanced } from "@/components/video-type-analysis/practice-analysis-enhanced";
import { ScrimmageAnalysisEnhanced } from "@/components/video-type-analysis/scrimmage-analysis-enhanced";
import { GameAnalysis } from "@/components/video-type-analysis/game-analysis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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

  // Fetch video details
  const { data: video, isLoading: videoLoading, error: videoError } = useQuery({
    queryKey: [`/api/videos/${id}`],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  // Fetch analyses for the video
  const { data: analyses = [], isLoading: analysesLoading, error: analysesError } = useQuery({
    queryKey: [`/api/videos/${id}/analyses`],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  // Handle errors
  useEffect(() => {
    if (videoError && isUnauthorizedError(videoError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [videoError, toast]);

  // Loading state
  if (isLoading || videoLoading || analysesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Card className="shadow-soft">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <LoaderPinwheel className="w-12 h-12 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-semibold">Loading analysis...</h3>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Not found
  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Video not found</h2>
                <p className="text-muted-foreground mb-4">
                  The video you're looking for doesn't exist or you don't have access to it.
                </p>
                <Link href="/videos">
                  <Button>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Videos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: number | null): string => {
    if (!timestamp) return '';
    const minutes = Math.floor(timestamp / 60);
    const seconds = timestamp % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Group analyses by type
  const overallAnalysis = (analyses as any[]).find(a => a.type === 'overall');
  const playerEvaluations = (analyses as any[]).filter(a => a.type === 'player_evaluation');
  const faceOffAnalyses = (analyses as any[]).filter(a => a.type === 'face_off');
  const transitionAnalyses = (analyses as any[]).filter(a => a.type === 'transition');
  const keyMoments = (analyses as any[]).filter(a => a.type === 'key_moment');

  // Create sections data
  const analysisSections: AnalysisSection[] = [
    {
      id: 'overview',
      title: 'Overall Analysis',
      icon: Trophy,
      count: overallAnalysis ? 1 : 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'players',
      title: 'Player Analysis',
      icon: Users,
      count: playerEvaluations.length,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'faceoffs',
      title: 'Face-off Analysis',
      icon: Target,
      count: faceOffAnalyses.length,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      id: 'transitions',
      title: 'Transition Analysis',
      icon: TrendingUp,
      count: transitionAnalyses.length,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-800'
    },
    {
      id: 'moments',
      title: 'Key Moments',
      icon: Sparkles,
      count: keyMoments.length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      id: 'detailed',
      title: 'Detailed Metrics',
      icon: BarChart3,
      count: playerEvaluations.length > 0 ? 1 : 0,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
    }
  ];

  // Filter out empty sections
  const activeSections = analysisSections.filter(section => section.count > 0);

  // Determine video type from metadata or title
  const videoType = (video as any).metadata?.videoType || 
    ((video as any).title?.toLowerCase().includes('drill') || 
     (video as any).title?.toLowerCase().includes('training') || 
     (video as any).title?.toLowerCase().includes('shooting') ? 'drill' : 
    (video as any).title?.toLowerCase().includes('highlight') ? 'highlight' :
    (video as any).title?.toLowerCase().includes('recruiting') ? 'recruiting' :
    (video as any).title?.toLowerCase().includes('practice') ? 'practice' :
    (video as any).title?.toLowerCase().includes('scrimmage') ? 'scrimmage' : 'game');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/videos">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Library
                </Button>
              </Link>
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
              <Badge 
                variant={
                  (video as any).status === 'completed' ? 'default' : 
                  (video as any).status === 'processing' ? 'secondary' : 
                  'destructive'
                } 
                className="font-medium"
              >
                {(video as any).status === 'completed' ? '✓ Analyzed' : 
                 (video as any).status === 'processing' ? '⟳ Processing' : 
                 '✗ Failed'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {(video as any).duration && (
                <Badge variant="outline" className="font-mono">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.floor((video as any).duration / 60)}:{((video as any).duration % 60).toString().padStart(2, '0')}
                </Badge>
              )}
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              {(video as any).youtubeUrl && (
                <Button 
                  className="btn-primary"
                  size="sm"
                  onClick={() => window.open((video as any).youtubeUrl, '_blank')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Video
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Video Info & Preview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Video Info Card */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <h1 className="text-xl font-bold line-clamp-2">{(video as any).title}</h1>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Preview */}
                {(video as any).thumbnailUrl && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                    <img 
                      src={(video as any).thumbnailUrl} 
                      alt={(video as any).title}
                      className="w-full h-full object-cover"
                    />
                    {(video as any).youtubeUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer"
                           onClick={() => window.open((video as any).youtubeUrl, '_blank')}>
                        <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors">
                          <Play className="w-6 h-6 text-gray-900" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Video Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {videoType || 'Game'}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Uploaded:</span>
                    <span>{new Date((video as any).createdAt).toLocaleDateString()}</span>
                  </div>
                  {(video as any).metadata?.channelTitle && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Channel:</span>
                      <span>{(video as any).metadata.channelTitle}</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {(video as any).description || 
                      ((video as any).metadata?.videoType === 'drill' ? 
                        'Training drill analysis for technique improvement and skill development.' :
                        'Video analysis for comprehensive coaching insights.')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Score Info - Moved to sidebar */}
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader 
                className="cursor-pointer pb-3"
                onClick={() => setShowConfidenceInfo(!showConfidenceInfo)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-base">About Confidence Scores</CardTitle>
                  </div>
                  {showConfidenceInfo ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {showConfidenceInfo && (
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    AI confidence based on video clarity.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs">90%+ Excellent visibility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs">75-89% Good visibility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-xs">60-74% Fair visibility</span>
                    </div>
                  </div>
                  <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs">
                      Analyses below 60% are filtered out.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right Column - Analysis Content */}
          <div className="lg:col-span-2">
            {(video as any).status === 'completed' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-1">Analysis Results</h2>
                  <p className="text-muted-foreground mb-6">
                    Detailed breakdown of your {videoType || 'game'} footage
                  </p>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {(() => {
                    switch (videoType) {
                      case 'drill':
                        return <DrillAnalysis video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                      case 'highlight':
                        return <HighlightAnalysisEnhanced video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                      case 'recruiting':
                        return <RecruitingAnalysisEnhanced video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                      case 'practice':
                        return <PracticeAnalysisEnhanced video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                      case 'scrimmage':
                        return <ScrimmageAnalysisEnhanced video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                      case 'game':
                      default:
                        return <GameAnalysis video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                    }
                  })()}
                </div>
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <LoaderPinwheel className="w-8 h-8 animate-spin text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Analysis in Progress</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Our AI is analyzing your video. This typically takes 2-5 minutes depending on video length.
                    </p>
                    <Progress value={65} className="w-full max-w-xs mb-2" />
                    <span className="text-sm text-muted-foreground">Processing...</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}