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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <Link href="/videos">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
            </Link>
            <Badge variant={
              (video as any).status === 'completed' ? 'default' : 
              (video as any).status === 'processing' ? 'secondary' : 
              'destructive'
            } className="text-xs sm:text-sm">
              {(video as any).status === 'completed' ? 'Analyzed' : 
               (video as any).status === 'processing' ? 'Processing' : 
               'Failed'}
            </Badge>
            {(video as any).duration && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {Math.floor((video as any).duration / 60)}:{((video as any).duration % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{(video as any).title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {(video as any).metadata?.videoType === 'drill' || (video as any).title?.toLowerCase().includes('drill') || (video as any).title?.toLowerCase().includes('training') ? 
              ((video as any).description || (video as any).youtubeUrl ? 
                `YouTube video by ${(video as any).metadata?.channelTitle || 'Unknown'}, published on ${new Date((video as any).createdAt).toLocaleDateString()}. Drill analysis for technique improvement and skill development.` : 
                'Training drill uploaded for technique analysis and skill development.') :
              ((video as any).description || 
                ((video as any).youtubeUrl ? 
                  `YouTube video by ${(video as any).metadata?.channelTitle || 'Unknown'}, published on ${new Date((video as any).createdAt).toLocaleDateString()}. Video analysis uploaded for coaching insights.` : 
                  'Uploaded video analysis for comprehensive coaching insights.'))}
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
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
          (() => {
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
          })()
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