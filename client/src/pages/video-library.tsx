import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import EnhancedVideoUpload from "@/components/enhanced-video-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Search, Filter, Plus, Play, LoaderPinwheel, Calendar, Clock, RefreshCw, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function VideoLibrary() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos"],
    retry: false,
  });
  
  const retryVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      return await apiRequest(`/api/videos/${videoId}/retry`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Retry Started",
        description: "Video processing has been restarted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
    onError: (error) => {
      toast({
        title: "Retry Failed",
        description: error.message || "Failed to retry video processing",
        variant: "destructive",
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      return await apiRequest(`/api/videos/${videoId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Video Deleted",
        description: "The video has been removed from your library.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderPinwheel className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'uploading':
        return 'Uploading';
      default:
        return 'Unknown';
    }
  };

  // Filter videos based on status and search query
  const filteredVideos = Array.isArray(videos) ? videos.filter((video: any) => {
    // Apply status filter
    if (statusFilter !== 'all' && video.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = video.title?.toLowerCase() || '';
      const description = video.description?.toLowerCase() || '';
      return title.includes(query) || description.includes(query);
    }
    
    return true;
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Mobile-Optimized Page Header with Stats */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Video Library</h1>
              <p className="text-base sm:text-lg text-gray-600">
                Game film breakdown and scouting reports
              </p>
            </div>
            
            {/* Mobile-Optimized Quick Stats */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {Array.isArray(videos) ? videos.filter((v: any) => v.status === 'completed').length : 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Analyzed</p>
              </div>
              <div className="w-px h-10 sm:h-12 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-amber-600">
                  {Array.isArray(videos) ? videos.filter((v: any) => v.status === 'processing').length : 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Processing</p>
              </div>
              <div className="w-px h-10 sm:h-12 bg-gray-200 hidden sm:block"></div>
              <Button 
                className="btn-primary shadow-md hover:shadow-lg transition-all hidden sm:flex" 
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Plus className="w-5 h-5 mr-2" />
                Upload Video
              </Button>
            </div>
          </div>
        </div>

          {/* Mobile-Optimized Filters */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                <Input 
                  placeholder="Search videos..." 
                  className="pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 hover:bg-gray-50 transition-colors text-sm sm:text-base">
                  <Filter className="w-4 h-4 mr-2 text-gray-600" />
                  <SelectValue placeholder="All Videos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Videos</SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Analyzed
                    </div>
                  </SelectItem>
                  <SelectItem value="processing">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      Processing
                    </div>
                  </SelectItem>
                  <SelectItem value="failed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Failed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Video Grid */}
          {videosLoading ? (
            <div className="grid-responsive">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="card-modern">
                  <div className="aspect-video bg-muted rounded-t-2xl skeleton"></div>
                  <CardContent className="content-padding">
                    <div className="space-y-3">
                      <div className="h-4 skeleton"></div>
                      <div className="h-3 skeleton w-2/3"></div>
                      <div className="h-3 skeleton w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredVideos.map((video: any) => (
                <div key={video.id} className="group relative bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
                  {/* Enhanced Thumbnail Section */}
                  <div className="relative aspect-video bg-gray-100">
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                          <Video className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 font-medium">No preview available</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient Overlay for Better Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Enhanced Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Link 
                        href={`/analysis/${video.id}`} 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100"
                      >
                        <div className="bg-white/95 backdrop-blur-sm rounded-full p-5 shadow-2xl hover:bg-white transition-colors">
                          <Play className="w-8 h-8 text-blue-600 fill-blue-600" />
                        </div>
                      </Link>
                    </div>

                    {/* Mobile-Optimized Status Badge */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                      {video.status === 'completed' && (
                        <div className="bg-green-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-1.5 sm:gap-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                          Analyzed
                        </div>
                      )}
                      {video.status === 'processing' && (
                        <div className="bg-amber-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-1.5 sm:gap-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                          Processing
                        </div>
                      )}
                      {video.status === 'failed' && (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="bg-red-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-1.5 sm:gap-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                            Failed
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              retryVideoMutation.mutate(video.id);
                            }}
                            disabled={retryVideoMutation.isPending}
                            className="bg-white/90 hover:bg-white text-red-600 border-0 shadow-lg px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold"
                          >
                            {retryVideoMutation.isPending ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Retry
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
                            deleteVideoMutation.mutate(video.id);
                          }
                        }}
                        disabled={deleteVideoMutation.isPending}
                        className="bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Mobile-Optimized Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/80 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-medium">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  {/* Mobile-Optimized Content Section */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {video.title}
                    </h3>
                    
                    {video.description && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    {/* Mobile-Optimized Metadata */}
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        {video.youtubeUrl && (
                          <div className="flex items-center gap-1 text-red-600">
                            <Play className="w-4 h-4 fill-current" />
                            YouTube
                          </div>
                        )}
                      </div>
                      
                      {video.status === 'completed' && (
                        <Link 
                          href={`/analysis/${video.id}`}
                          className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                        >
                          View Analysis →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10 text-blue-600" />
                </div>
                {statusFilter !== 'all' || searchQuery ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Videos Found</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      No videos match your current filters. Try adjusting your search or filter settings.
                    </p>
                    <Button 
                      onClick={() => {
                        setStatusFilter('all');
                        setSearchQuery('');
                      }}
                      className="btn-secondary shadow-md hover:shadow-lg transition-all"
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Analysis Journey</h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      Upload your first lacrosse video to unlock AI-powered insights and elevate your game.
                    </p>
                    <Button 
                      onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="btn-primary shadow-md hover:shadow-lg transition-all text-lg px-8 py-3"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Upload Your First Video
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Upload Section */}
          <div id="upload-section" className="mt-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Add New Video</h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Upload game footage or paste a YouTube link to get comprehensive AI analysis with NCAA-level insights.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <EnhancedVideoUpload />
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
