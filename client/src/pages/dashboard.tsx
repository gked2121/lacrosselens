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
import { Video, Users, Target, Clock, Download, Plus, Play, LoaderPinwheel, CloudUpload, Sparkles } from "lucide-react";
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
            <Card className="card-modern group cursor-pointer">
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Videos Analyzed
                    </p>
                    <p className="text-4xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      {statsLoading ? "--" : (stats as any)?.videosAnalyzed || 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ 
                    background: 'linear-gradient(135deg, hsl(259 100% 65% / 0.15) 0%, hsl(259 100% 65% / 0.05) 100%)',
                    boxShadow: '0 4px 12px hsl(259 100% 65% / 0.15)'
                  }}>
                    <Video className="w-7 h-7" style={{ color: 'hsl(259 100% 65%)' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern group cursor-pointer">
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Teams Managed
                    </p>
                    <p className="text-4xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      {statsLoading ? "--" : (stats as any)?.totalTeams || 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Configured</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ 
                    background: 'linear-gradient(135deg, hsl(142 76% 36% / 0.15) 0%, hsl(142 76% 36% / 0.05) 100%)',
                    boxShadow: '0 4px 12px hsl(142 76% 36% / 0.15)'
                  }}>
                    <Users className="w-7 h-7" style={{ color: 'hsl(142 76% 36%)' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern group cursor-pointer">
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Avg. Confidence
                    </p>
                    <p className="text-4xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      {statsLoading ? "--" : 
                       (stats as any)?.analysisAccuracy > 0 ? 
                         `${Math.round((stats as any)?.analysisAccuracy)}%` : 
                         "N/A"}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">AI Accuracy</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ 
                    background: 'linear-gradient(135deg, hsl(217 91% 50% / 0.15) 0%, hsl(217 91% 50% / 0.05) 100%)',
                    boxShadow: '0 4px 12px hsl(217 91% 50% / 0.15)'
                  }}>
                    <Target className="w-7 h-7" style={{ color: 'hsl(217 91% 50%)' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern group cursor-pointer">
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Processing
                    </p>
                    <p className="text-4xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      {statsLoading ? "--" : (stats as any)?.videosProcessing || 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">In Progress</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ 
                    background: 'linear-gradient(135deg, hsl(38 92% 50% / 0.15) 0%, hsl(38 92% 50% / 0.05) 100%)',
                    boxShadow: '0 4px 12px hsl(38 92% 50% / 0.15)'
                  }}>
                    <Clock className="w-7 h-7" style={{ color: 'hsl(38 92% 50%)' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Latest Analysis */}
            <div className="lg:col-span-2">
              <Card className="card-modern overflow-hidden">
                <div className="p-8 pb-6" style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--primary) / 0.02) 100%)',
                  borderBottom: '1px solid hsl(var(--border))'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ 
                        backgroundColor: 'hsl(var(--primary) / 0.1)' 
                      }}>
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Latest Analysis</h2>
                    </div>
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
                    <p className="text-muted-foreground text-lg ml-15">{recentVideos[0].title}</p>
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
                <Card className="card-modern overflow-hidden group cursor-pointer" style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.05) 100%)',
                  border: '2px dashed hsl(var(--primary) / 0.3)'
                }}>
                  <CardContent className="content-padding text-center py-8">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110" style={{ 
                      backgroundColor: 'hsl(var(--primary) / 0.15)' 
                    }}>
                      <CloudUpload className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-2">Quick Upload</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload or record a video for instant analysis
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Recent Analysis */}
              <Card className="card-modern overflow-hidden">
                <div className="p-6 pb-4" style={{ 
                  background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.1) 100%)'
                }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                      backgroundColor: 'hsl(var(--secondary) / 0.1)' 
                    }}>
                      <Play className="w-5 h-5 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Recent Analysis</h3>
                  </div>
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
              <Card className="card-modern overflow-hidden">
                <div className="p-6" style={{ 
                  background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--primary) / 0.02) 100%)'
                }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                      backgroundColor: 'hsl(var(--primary) / 0.1)' 
                    }}>
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">AI Analysis Tips</h3>
                  </div>
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
