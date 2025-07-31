import { useEffect } from "react";
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
import { Video, Search, Filter, Plus, Play, LoaderPinwheel, Calendar, Clock, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function VideoLibrary() {
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Page Header */}
        <div className="page-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="page-title">Video Library</h1>
              <p className="page-description">
                Your AI-powered lacrosse video analysis hub
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="btn-primary" onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload Video</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </div>
          </div>
        </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search videos..." 
                className="input-modern pl-12"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-48 input-modern">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
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
          ) : Array.isArray(videos) && videos.length > 0 ? (
            <div className="grid-responsive">
              {(videos as any[]).map((video: any) => (
                <Card key={video.id} className="card-interactive group overflow-hidden">
                  <div className="relative aspect-video bg-muted group-hover:scale-[1.02] transition-transform duration-300">
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <div className="text-center">
                          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No preview available</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Link href={`/analysis/${video.id}`} className="w-full max-w-xs mx-4">
                        <Button size="lg" className="w-full btn-primary shadow-xl">
                          <Play className="w-5 h-5 mr-2" />
                          {video.status === 'completed' ? 'View Analysis' : 'View Details'}
                        </Button>
                      </Link>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            video.status === 'completed' ? 'status-completed' :
                            video.status === 'processing' ? 'status-processing' :
                            video.status === 'failed' ? 'status-failed' :
                            'status-uploading'
                          }
                        >
                          <div 
                            className={`w-2 h-2 rounded-full ${getStatusColor(video.status)} ${
                              video.status === 'processing' ? 'animate-pulse' : ''
                            }`}
                          />
                          {getStatusText(video.status)}
                        </Badge>
                        {video.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              retryVideoMutation.mutate(video.id);
                            }}
                            disabled={retryVideoMutation.isPending}
                            className="btn-outline h-6 px-2 text-xs"
                          >
                            {retryVideoMutation.isPending ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Retry
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-3 line-clamp-1 transition-colors" style={{ color: 'hsl(var(--foreground))' }}>
                      {video.title}
                    </h3>
                    
                    {video.description && (
                      <p className="text-base mb-4 line-clamp-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {video.description}
                      </p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          <Calendar className="w-4 h-4" />
                          {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                        
                        {video.duration && (
                          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            <Clock className="w-4 h-4" />
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>

                      {video.youtubeUrl && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-sm px-3 py-1 font-semibold" style={{ backgroundColor: 'hsl(0 84% 95%)', color: 'hsl(0 84% 50%)', borderColor: 'hsl(0 84% 85%)' }}>
                            <Play className="w-4 h-4 mr-1" />
                            YouTube
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No videos yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload your first lacrosse video to get started with AI-powered analysis.
              </p>
              <Button onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Video
              </Button>
            </div>
          )}

          {/* Upload Section */}
          <div id="upload-section" className="mt-8">
            <div className="bg-accent rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-3">Upload Video for Analysis</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Upload or link a lacrosse video for comprehensive AI analysis and coaching insights.
              </p>
              <EnhancedVideoUpload />
            </div>
          </div>
        </main>
    </div>
  );
}
