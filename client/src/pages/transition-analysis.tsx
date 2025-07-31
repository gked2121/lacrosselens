import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Trophy,
  TrendingUp,
  LoaderPinwheel,
  BarChart3,
  Clock,
  Percent,
  Video,
  ArrowRight,
  Zap,
  Shield,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Users
} from "lucide-react";

interface TransitionAnalysis {
  id: number;
  videoId: number;
  videoTitle?: string;
  content: string;
  timestamp: number;
  confidence: number;
  metadata?: {
    clearingSuccess?: number;
    ridingSuccess?: number;
    strategy?: string;
    outcome?: string;
  };
}

interface TransitionData {
  totalTransitions: number;
  avgClearingSuccess: number;
  avgRidingSuccess: number;
  videoBreakdown: Array<{
    videoId: number;
    videoTitle: string;
    uploadDate: string;
    transitions: TransitionAnalysis[];
  }>;
  strategies: Array<{ name: string; count: number }>;
  recentTransitions: TransitionAnalysis[];
}

export default function TransitionAnalysis() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view transition analysis.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch transition specific data
  const { data: transitionData, isLoading: dataLoading } = useQuery<TransitionData>({
    queryKey: ["/api/transition-analyses"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderPinwheel className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const { 
    totalTransitions = 0, 
    avgClearingSuccess = 0, 
    avgRidingSuccess = 0, 
    videoBreakdown = [], 
    strategies = [],
    recentTransitions = []
  } = transitionData || {};

  // Format timestamp helper
  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get strategy badge color
  const getStrategyColor = (strategy: string) => {
    const colors: Record<string, string> = {
      'banana split': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'wide break': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'over the shoulder': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'fast break': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'slow break': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'substitution pattern': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'defensive slide': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[strategy.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="page-title">Transition Analysis</h1>
              <p className="page-description">
                Clearing, riding, and transition play intelligence
              </p>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Transition Intelligence
            </Badge>
          </div>
        </div>

        {/* Summary Statistics */}
        {totalTransitions > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Videos</p>
                      <p className="text-2xl font-bold">{videoBreakdown.length}</p>
                    </div>
                    <Video className="w-8 h-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Transitions Analyzed</p>
                      <p className="text-2xl font-bold">{totalTransitions}</p>
                    </div>
                    <Activity className="w-8 h-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Clearing Success</p>
                      <p className="text-2xl font-bold flex items-center gap-1">
                        {avgClearingSuccess}%
                        {avgClearingSuccess > 80 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : avgClearingSuccess < 60 ? (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        ) : null}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Riding Success</p>
                      <p className="text-2xl font-bold flex items-center gap-1">
                        {avgRidingSuccess}%
                        {avgRidingSuccess > 40 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : avgRidingSuccess < 20 ? (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        ) : null}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Strategies Section */}
            {strategies.length > 0 && (
              <Card className="shadow-soft mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Transition Strategies Identified ({strategies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {strategies.slice(0, 8).map((strategy, idx) => (
                      <div key={idx} className={`rounded-lg p-3 ${getStrategyColor(strategy.name)}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{strategy.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {strategy.count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Breakdown */}
            {videoBreakdown.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Transitions by Video ({videoBreakdown.length} videos)
                </h2>

                <div className="grid gap-4">
                  {videoBreakdown.map((video) => (
                    <Card key={video.videoId} className="shadow-soft hover:shadow-glow transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{video.videoTitle}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {new Date(video.uploadDate).toLocaleDateString()} • {video.transitions.length} transitions
                            </p>
                          </div>
                          <Link href={`/analysis/${video.videoId}?tab=transitions`}>
                            <Button size="sm" variant="outline">
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {video.transitions.slice(0, 3).map((transition) => (
                            <div key={transition.id} className="border-l-4 border-primary/30 pl-4 py-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {formatTimestamp(transition.timestamp)}
                                  </Badge>
                                  {transition.metadata?.strategy && (
                                    <Badge className={getStrategyColor(transition.metadata.strategy)}>
                                      {transition.metadata.strategy}
                                    </Badge>
                                  )}
                                  {transition.metadata?.clearingSuccess !== undefined && (
                                    <Badge variant="secondary">
                                      Clear: {transition.metadata.clearingSuccess}%
                                    </Badge>
                                  )}
                                  {transition.metadata?.ridingSuccess !== undefined && (
                                    <Badge variant="secondary">
                                      Ride: {transition.metadata.ridingSuccess}%
                                    </Badge>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {transition.confidence}% confidence
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {transition.content}
                              </p>
                            </div>
                          ))}
                          {video.transitions.length > 3 && (
                            <p className="text-sm text-muted-foreground text-center">
                              +{video.transitions.length - 3} more transitions
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <Card className="shadow-soft">
            <CardContent className="p-12 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">No Transition Data Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload lacrosse videos to get detailed transition analysis including clearing success rates, 
                riding effectiveness, and strategic insights.
              </p>
              <Link href="/videos">
                <Button className="btn-primary">
                  <Video className="w-4 h-4 mr-2" />
                  Upload Your First Video
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}