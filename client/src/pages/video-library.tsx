import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import VideoUpload from "@/components/video-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Search, Filter, Plus, Play, LoaderPinwheel, Calendar, Clock } from "lucide-react";

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
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Video Library</h1>
                <p className="text-muted-foreground mt-1">
                  Manage and analyze your lacrosse videos
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <VideoUpload>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                </VideoUpload>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search videos..." 
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="sm:w-48">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : Array.isArray(videos) && videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(videos as any[]).map((video: any) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-slate-900">
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225" 
                          alt="Lacrosse video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Link href={`/videos/${video.id}`}>
                        <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                          <Play className="w-4 h-4 mr-2" />
                          {video.status === 'completed' ? 'View Analysis' : 'View Details'}
                        </Button>
                      </Link>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant={video.status === 'completed' ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        <div 
                          className={`w-2 h-2 rounded-full ${getStatusColor(video.status)} ${
                            video.status === 'processing' ? 'animate-pulse' : ''
                          }`}
                        />
                        {getStatusText(video.status)}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground truncate mb-2">
                      {video.title}
                    </h3>
                    
                    {video.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(video.createdAt).toLocaleDateString()}
                      </div>
                      
                      {video.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>

                    {video.youtubeUrl && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          YouTube
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No videos yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload your first lacrosse video to get started with AI-powered analysis.
              </p>
              <VideoUpload>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Your First Video
                </Button>
              </VideoUpload>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
