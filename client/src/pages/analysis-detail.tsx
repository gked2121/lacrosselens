import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";

import { DrillAnalysis } from "@/components/video-type-analysis/drill-analysis";
import { HighlightAnalysisEnhanced } from "@/components/video-type-analysis/highlight-analysis-enhanced";
import { RecruitingAnalysisEnhanced } from "@/components/video-type-analysis/recruiting-analysis-enhanced";
import { PracticeAnalysisEnhanced } from "@/components/video-type-analysis/practice-analysis-enhanced";
import { ScrimmageAnalysisEnhanced } from "@/components/video-type-analysis/scrimmage-analysis-enhanced";
import { GameAnalysisMinimal } from "@/components/video-type-analysis/game-analysis-minimal";
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Mobile-Optimized Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/videos">
              <Button variant="ghost" size="sm" className="px-2 sm:px-4">
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant={(video as any).status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                {(video as any).status}
              </Badge>
              {(video as any).youtubeUrl && (
                <Button 
                  size="sm"
                  className="btn-primary text-xs sm:text-sm px-3 sm:px-4"
                  onClick={() => window.open((video as any).youtubeUrl, '_blank')}
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Watch
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Mobile-Optimized Video Info */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">{(video as any).title}</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            <span>{videoType || 'Game'} Analysis</span>
            {(video as any).duration && (
              <span>• {Math.floor((video as any).duration / 60)}:{((video as any).duration % 60).toString().padStart(2, '0')}</span>
            )}
            <span>• {new Date((video as any).createdAt).toLocaleDateString()}</span>
          </div>
          
          {/* Mobile-Optimized Thumbnail */}
          {(video as any).thumbnailUrl && (
            <div className="relative w-full max-w-full sm:max-w-md aspect-video rounded-lg overflow-hidden bg-gray-900 mb-4">
              <img 
                src={(video as any).thumbnailUrl} 
                alt={(video as any).title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Analysis Content - Compact */}
        {(video as any).status === 'completed' ? (
          <div className="max-w-full">
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
                  return <GameAnalysisMinimal video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
              }
            })()}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <LoaderPinwheel className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analysis in Progress</h3>
                <p className="text-muted-foreground">This may take a few minutes...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}