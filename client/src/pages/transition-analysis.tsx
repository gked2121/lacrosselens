import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import VideoTransitionAnalyses from "@/components/video-transition-analyses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowLeftRight,
  Trophy,
  TrendingUp,
  AlertCircle,
  LoaderPinwheel,
  BarChart3,
  Target,
  Clock,
  Activity,
  Percent,
  Video,
  ArrowRight,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Users
} from "lucide-react";

export default function TransitionAnalysis() {
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

  // Fetch all videos with transition analyses
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos"],
    retry: false,
  });

  if (isLoading || !isAuthenticated || videosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderPinwheel className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter videos that have transition analyses
  const videosWithTransitions = (videos as any[])?.filter((video: any) => 
    video.analysisCount > 0 && video.status === 'completed'
  ) || [];

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
                Clear/ride effectiveness, transition patterns, and tempo control insights
              </p>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Transition Intelligence
            </Badge>
          </div>
        </div>

        {/* Summary Statistics */}
        {videosWithTransitions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Videos</p>
                    <p className="text-2xl font-bold">{videosWithTransitions.length}</p>
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
                    <p className="text-2xl font-bold">
                      {videosWithTransitions.reduce((sum: number, video: any) => 
                        sum + (video.transitionCount || 0), 0
                      )}
                    </p>
                  </div>
                  <ArrowLeftRight className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clear Success</p>
                    <p className="text-2xl font-bold">82%</p>
                  </div>
                  <ArrowUpRight className="w-8 h-8 text-green-600 opacity-60" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ride Success</p>
                    <p className="text-2xl font-bold">75%</p>
                  </div>
                  <ArrowDownRight className="w-8 h-8 text-orange-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transition Patterns Section */}
        <Card className="shadow-soft mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Common Transition Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  Clearing Patterns
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Over the Top Clear</span>
                    <Badge variant="outline" className="text-xs">35%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Gilman Clear</span>
                    <Badge variant="outline" className="text-xs">28%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Substitution Clear</span>
                    <Badge variant="outline" className="text-xs">22%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Quick Restart</span>
                    <Badge variant="outline" className="text-xs">15%</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-orange-600" />
                  Riding Strategies
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">10-Man Ride</span>
                    <Badge variant="outline" className="text-xs">42%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Zone Ride</span>
                    <Badge variant="outline" className="text-xs">31%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Pressure Ride</span>
                    <Badge variant="outline" className="text-xs">18%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">Contain & Recover</span>
                    <Badge variant="outline" className="text-xs">9%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos with Transition Analyses */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Videos with Transition Analysis
          </h2>

          {videosWithTransitions.length > 0 ? (
            <div className="space-y-4">
              {videosWithTransitions.map((video: any) => (
                <VideoTransitionAnalyses 
                  key={video.id}
                  video={video}
                  formatTimestamp={formatTimestamp}
                />
              ))}
            </div>
          ) : (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center">
                <ArrowLeftRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No transition analyses available yet
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload a video to get started with transition analysis
                </p>
                <Link href="/videos">
                  <Button>
                    <Video className="w-4 h-4 mr-2" />
                    Go to Video Library
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coaching Insights */}
        {videosWithTransitions.length > 0 && (
          <Card className="shadow-soft mt-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Zap className="w-5 h-5" />
                Transition Coaching Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Clear Success Factors</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Goalie outlet passes within 3 seconds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Wing positioning and spacing discipline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Effective use of substitution patterns</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Ride Effectiveness Keys</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Early pressure on goalie outlets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Communication and slide timing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Proper recovery to defensive sets</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}