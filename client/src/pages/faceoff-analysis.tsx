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

interface FaceoffAnalysis {
  id: number;
  videoId: number;
  videoTitle?: string;
  content: string;
  timestamp: number;
  confidence: number;
  metadata?: {
    winProbability?: number;
    technique?: string;
    outcome?: string;
  };
}

interface FaceoffData {
  totalFaceoffs: number;
  avgWinProbability: number;
  videoBreakdown: Array<{
    videoId: number;
    videoTitle: string;
    uploadDate: string;
    faceoffs: FaceoffAnalysis[];
  }>;
  techniques: Array<{ name: string; count: number }>;
  recentFaceoffs: FaceoffAnalysis[];
}

export default function FaceoffAnalysis() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view face-off analysis.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch face-off specific data
  const { data: faceoffData, isLoading: dataLoading } = useQuery<FaceoffData>({
    queryKey: ["/api/faceoff-analyses"],
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
    totalFaceoffs = 0, 
    avgWinProbability = 0, 
    videoBreakdown = [], 
    techniques = [],
    recentFaceoffs = []
  } = faceoffData || {};

  // Format timestamp helper
  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get technique badge color
  const getTechniqueColor = (technique: string) => {
    const colors: Record<string, string> = {
      'clamp': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'jump counter': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'rake & pull': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'quick exit': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'plunger': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'laser': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return colors[technique.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
        {totalFaceoffs > 0 ? (
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
                      <p className="text-sm text-muted-foreground">Face-offs Analyzed</p>
                      <p className="text-2xl font-bold">{totalFaceoffs}</p>
                    </div>
                    <CircleDot className="w-8 h-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Win Probability</p>
                      <p className="text-2xl font-bold">{avgWinProbability}%</p>
                    </div>
                    <Trophy className="w-8 h-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Techniques Found</p>
                      <p className="text-2xl font-bold">{techniques.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Techniques Section */}
            {techniques.length > 0 && (
              <Card className="shadow-soft mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Techniques Identified ({techniques.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {techniques.slice(0, 8).map((tech, idx) => (
                      <div key={idx} className={`rounded-lg p-3 ${getTechniqueColor(tech.name)}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{tech.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {tech.count}
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
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Face-offs by Video ({videoBreakdown.length} videos)
                </h2>

                <div className="grid gap-4">
                  {videoBreakdown.map((video) => (
                    <Card key={video.videoId} className="shadow-soft hover:shadow-glow transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{video.videoTitle}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {new Date(video.uploadDate).toLocaleDateString()} • {video.faceoffs.length} face-offs
                            </p>
                          </div>
                          <Link href={`/analysis/${video.videoId}?tab=faceoffs`}>
                            <Button size="sm" variant="outline">
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {video.faceoffs.slice(0, 3).map((faceoff) => (
                            <div key={faceoff.id} className="border-l-4 border-primary/30 pl-4 py-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {formatTimestamp(faceoff.timestamp)}
                                  </Badge>
                                  {faceoff.metadata?.technique && (
                                    <Badge className={getTechniqueColor(faceoff.metadata.technique)}>
                                      {faceoff.metadata.technique}
                                    </Badge>
                                  )}
                                  {faceoff.metadata?.winProbability && (
                                    <Badge variant="secondary">
                                      {faceoff.metadata.winProbability}% win probability
                                    </Badge>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {faceoff.confidence}% confidence
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {faceoff.content}
                              </p>
                            </div>
                          ))}
                          {video.faceoffs.length > 3 && (
                            <p className="text-sm text-muted-foreground text-center">
                              +{video.faceoffs.length - 3} more face-offs
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
              <CircleDot className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">No Face-off Data Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload lacrosse videos to get detailed face-off analysis including techniques, 
                win probabilities, and strategic insights.
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