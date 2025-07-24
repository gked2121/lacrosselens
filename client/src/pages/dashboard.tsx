import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import VideoUpload from "@/components/video-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Target, Clock, Download, Plus, Play, LoaderPinwheel, CloudUpload } from "lucide-react";

export default function Dashboard() {
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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderPinwheel className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const recentVideos = Array.isArray(videos) ? videos.slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6 mobile-full">
          {/* Dashboard Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                  Your AI-powered lacrosse analytics command center
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="hidden sm:flex shadow-soft">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <VideoUpload>
                  <Button className="gradient-primary shadow-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">New Analysis</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                </VideoUpload>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Videos Analyzed</p>
                    <p className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
                      {statsLoading ? "--" : (stats as any)?.videosAnalyzed || 0}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <span className="text-xs">↗</span> 12% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teams Managed</p>
                    <p className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
                      {statsLoading ? "--" : (stats as any)?.totalTeams || 0}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <span className="text-xs">↗</span> 8% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Analysis Accuracy</p>
                    <p className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
                      {statsLoading ? "--" : `${(stats as any)?.analysisAccuracy || 92}%`}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <span className="text-xs">↗</span> 3% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hours Saved</p>
                    <p className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
                      {statsLoading ? "--" : (stats as any)?.hoursSaved || 0}
                    </p>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <span className="text-xs">↗</span> 24% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Latest Analysis */}
            <div className="lg:col-span-2">
              <Card className="shadow-soft">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Latest Analysis</h2>
                    {recentVideos.length > 0 && (
                      <Badge 
                        variant={recentVideos[0].status === 'completed' ? 'default' : 'secondary'}
                        className={recentVideos[0].status === 'completed' ? 'gradient-primary text-primary-foreground border-0' : ''}
                      >
                        {recentVideos[0].status === 'completed' ? 'Processing Complete' : 
                         recentVideos[0].status === 'processing' ? 'Processing...' : 
                         'Uploaded'}
                      </Badge>
                    )}
                  </div>
                  {recentVideos.length > 0 && (
                    <p className="text-muted-foreground mt-1">{recentVideos[0].title}</p>
                  )}
                </div>

                {recentVideos.length > 0 ? (
                  <>
                    {/* Video Preview */}
                    <div className="relative bg-slate-900 aspect-video">
                      <img 
                        src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675" 
                        alt="Lacrosse game analysis" 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Video Controls Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center space-x-4">
                            <button className="hover:text-primary transition-colors">
                              <Play className="w-5 h-5" />
                            </button>
                            <span className="text-sm">0:00 / 45:21</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button className="hover:text-primary transition-colors">
                              <span className="text-sm">🔊</span>
                            </button>
                            <button className="hover:text-primary transition-colors">
                              <span className="text-sm">⛶</span>
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-600 h-1 rounded-full mt-3">
                          <div className="bg-primary h-1 rounded-full w-0"></div>
                        </div>
                      </div>

                      {/* AI Analysis Overlay */}
                      {recentVideos[0].status === 'completed' && (
                        <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg max-w-xs">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">Analysis Complete</span>
                          </div>
                          <p className="text-xs">
                            Click to view detailed player evaluations and coaching insights.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Analysis Insights Preview */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">AI Analysis Insights</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                          <h4 className="font-medium text-foreground">Overall Game Analysis</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Strong individual performances with developing team chemistry. 
                            Focus on transition execution and face-off positioning for improvement.
                          </p>
                          <Badge variant="outline" className="mt-2">
                            Confidence: 95%
                          </Badge>
                        </div>
                        
                        {recentVideos[0].status === 'completed' && (
                          <div className="text-center pt-4">
                            <Button variant="outline" className="w-full">
                              View Full Analysis
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No videos yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload your first lacrosse video to get AI-powered analysis.
                    </p>
                    <VideoUpload>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Video
                      </Button>
                    </VideoUpload>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Upload */}
              <VideoUpload>
                <Card className="border-2 border-dashed border-primary/50 hover:border-primary cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <CloudUpload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground mb-1">Quick Upload</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload or record a video for instant analysis
                    </p>
                  </CardContent>
                </Card>
              </VideoUpload>

              {/* Recent Analysis */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recent Analysis</h3>
                  <div className="space-y-3">
                    {videosLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-8 bg-muted rounded"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentVideos.length > 0 ? (
                      recentVideos.map((video: any) => (
                        <div 
                          key={video.id}
                          className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <div className="w-12 h-8 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            {video.status === 'processing' ? (
                              <LoaderPinwheel className="w-3 h-3 animate-spin text-primary" />
                            ) : (
                              <Play className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {video.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(video.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <div 
                              className={`w-2 h-2 rounded-full ${
                                video.status === 'completed' ? 'bg-green-500' :
                                video.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                                'bg-gray-300'
                              }`} 
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No videos uploaded yet
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Team Performance */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Team Performance</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Face-Off Win %</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: "68%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Transition Success</span>
                        <span className="font-medium">74%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "74%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Shot Accuracy</span>
                        <span className="font-medium">82%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "82%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
