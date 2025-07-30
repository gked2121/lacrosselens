import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import VideoFaceoffAnalyses from "@/components/video-faceoff-analyses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Users, 
  Trophy,
  TrendingUp,
  AlertCircle,
  LoaderPinwheel,
  BarChart3,
  Target,
  Clock,
  CircleDot,
  Percent,
  Video,
  ArrowRight,
  Zap,
  Shield,
  Swords,
  Timer
} from "lucide-react";

export default function FaceoffAnalysis() {
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

  // Fetch all videos with face-off analyses
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

  // Filter videos that have face-off analyses
  const videosWithFaceoffs = (videos as any[])?.filter((video: any) => 
    video.analysisCount > 0 && video.status === 'completed'
  ) || [];

  // Format timestamp helper
  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="page-title">Face-off Analysis</h1>
              <p className="page-description">
                Advanced insights into face-off performance, technique, and strategy
              </p>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              <CircleDot className="w-4 h-4 mr-2" />
              FOGO Specialist View
            </Badge>
          </div>
        </div>

        {/* Summary Statistics */}
        {videosWithFaceoffs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Videos</p>
                    <p className="text-2xl font-bold">{videosWithFaceoffs.length}</p>
                  </div>
                  <Video className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Face-offs Analyzed</p>
                    <p className="text-2xl font-bold">
                      {videosWithFaceoffs.reduce((sum: number, video: any) => 
                        sum + (video.faceoffCount || 0), 0
                      )}
                    </p>
                  </div>
                  <CircleDot className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Win Rate</p>
                    <p className="text-2xl font-bold">68%</p>
                  </div>
                  <Trophy className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Key Insights</p>
                    <p className="text-2xl font-bold">124</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Key Techniques Section */}
        <Card className="shadow-soft mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Common Techniques Identified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-full justify-center py-2">
                  <Swords className="w-4 h-4 mr-2" />
                  Clamp Technique
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-full justify-center py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  Jump Counter
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-full justify-center py-2">
                  <Target className="w-4 h-4 mr-2" />
                  Rake & Pull
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-full justify-center py-2">
                  <Timer className="w-4 h-4 mr-2" />
                  Quick Exit
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos with Face-off Analyses */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Videos with Face-off Analysis
          </h2>

          {videosWithFaceoffs.length > 0 ? (
            <div className="space-y-4">
              {videosWithFaceoffs.map((video: any) => (
                <VideoFaceoffAnalyses 
                  key={video.id}
                  video={video}
                  formatTimestamp={formatTimestamp}
                />
              ))}
            </div>
          ) : (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center">
                <CircleDot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No face-off analyses available yet
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload a video to get started with face-off analysis
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

        {/* Pro Tips */}
        {videosWithFaceoffs.length > 0 && (
          <Card className="shadow-soft mt-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <AlertCircle className="w-5 h-5" />
                Face-off Analysis Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Upload videos with clear face-off angles for best analysis accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Include multiple face-offs in your video for comprehensive technique evaluation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>The AI analyzes stance, hand positioning, and exit strategies automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Compare face-off specialists across different games to track improvement</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}