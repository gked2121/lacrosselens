import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import EnhancedVideoUpload from "@/components/enhanced-video-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Target, Clock, Download, Plus, Play, LoaderPinwheel, CloudUpload } from "lucide-react";
import { Link } from "wouter";

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
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(0 0% 98%)' }}>
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 container-padding mobile-full">
          {/* Dashboard Header */}
          <div className="page-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-1">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-description">
                  Your AI-powered lacrosse analytics command center
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="btn-outline mobile-hide">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Link href="/video-library">
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">New Analysis</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid-stats mb-8">
            <Card className="card-modern hover:shadow-medium transition-all duration-300">
              <CardContent className="content-padding">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Videos Analyzed</p>
                    <p className="text-3xl font-semibold text-foreground">
                      {statsLoading ? "--" : (stats as any)?.videosAnalyzed || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern hover:shadow-medium transition-all duration-300">
              <CardContent className="content-padding">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Teams Managed</p>
                    <p className="text-3xl font-semibold text-foreground">
                      {statsLoading ? "--" : (stats as any)?.totalTeams || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--secondary) / 0.1)' }}>
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern hover:shadow-medium transition-all duration-300">
              <CardContent className="content-padding">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Avg. Confidence</p>
                    <p className="text-3xl font-semibold text-foreground">
                      {statsLoading ? "--" : 
                       (stats as any)?.analysisAccuracy > 0 ? 
                         `${Math.round((stats as any)?.analysisAccuracy)}%` : 
                         "N/A"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern hover:shadow-medium transition-all duration-300">
              <CardContent className="content-padding">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Processing</p>
                    <p className="text-3xl font-semibold text-foreground">
                      {statsLoading ? "--" : (stats as any)?.videosProcessing || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Latest Analysis */}
            <div className="lg:col-span-2">
              <Card className="card-modern">
                <div className="content-padding border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Latest Analysis</h2>
                    {recentVideos.length > 0 && (
                      <Badge 
                        className={
                          recentVideos[0].status === 'completed' ? 'status-completed' :
                          recentVideos[0].status === 'processing' ? 'status-processing' :
                          'status-uploading'
                        }
                      >
                        {recentVideos[0].status === 'completed' ? 'Analysis Complete' : 
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
                    {recentVideos[0].thumbnailUrl ? (
                      <div className="relative bg-muted aspect-video rounded-lg overflow-hidden m-6">
                        <img 
                          src={recentVideos[0].thumbnailUrl} 
                          alt={recentVideos[0].title} 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Status Overlay */}
                        {recentVideos[0].status === 'completed' && (
                          <div className="absolute top-4 right-4 text-white p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-medium">Analysis Complete</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative bg-muted aspect-video flex items-center justify-center m-6 rounded-lg">
                        <div className="text-center">
                          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No preview available</p>
                        </div>
                      </div>
                    )}

                    {/* Video Info */}
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Title</p>
                          <p className="font-medium text-foreground">{recentVideos[0].title}</p>
                        </div>
                        
                        {recentVideos[0].description && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Description</p>
                            <p className="text-foreground">{recentVideos[0].description}</p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Status</p>
                          <Badge 
                            className={
                              recentVideos[0].status === 'completed' ? 'status-completed' :
                              recentVideos[0].status === 'processing' ? 'status-processing' :
                              'status-uploading'
                            }
                          >
                            {recentVideos[0].status === 'completed' ? 'Analysis Complete' : 
                             recentVideos[0].status === 'processing' ? 'Processing...' : 
                             'Uploaded'}
                          </Badge>
                        </div>
                        
                        {recentVideos[0].status === 'completed' && (
                          <div className="pt-4">
                            <Link href={`/videos/${recentVideos[0].id}`}>
                              <Button variant="outline" className="w-full">
                                View Full Analysis
                              </Button>
                            </Link>
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
                    <Link href="/video-library">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Video
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Upload */}
              <Link href="/video-library">
                <Card className="card-modern border-2 border-dashed hover:shadow-md cursor-pointer" style={{ borderColor: 'hsl(var(--primary) / 0.5)' }}>
                  <CardContent className="content-padding text-center">
                    <CloudUpload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-foreground mb-1">Quick Upload</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload or record a video for instant analysis
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Recent Analysis */}
              <Card className="card-modern">
                <div className="content-padding">
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
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                          style={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
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

              {/* AI Tips */}
              <Card className="card-modern">
                <div className="content-padding">
                  <h3 className="text-lg font-semibold text-foreground mb-4">AI Analysis Tips</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Upload full game footage for comprehensive team analysis
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Include face-offs and transitions for best insights
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Higher video quality improves AI accuracy
                        </p>
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
