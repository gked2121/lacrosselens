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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6 mobile-full">
          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Video Library</h1>
                <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                  Your AI-powered lacrosse video analysis hub
                </p>
              </div>
              <div className="flex gap-2">
                <VideoUpload>
                  <Button className="gradient-primary shadow-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Upload Video</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                </VideoUpload>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search videos..." 
                className="pl-10 bg-card border-input shadow-soft"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-48 bg-card shadow-soft">
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse shadow-soft">
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {(videos as any[]).map((video: any) => (
                <Card key={video.id} className="overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 group">
                  <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:scale-[1.02] transition-transform duration-300">
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <div className="text-center">
                          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No preview available</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Link href={`/videos/${video.id}`} className="w-full">
                        <Button size="sm" className="w-full glass text-white border-white/20 hover:bg-white/20">
                          <Play className="w-4 h-4 mr-2" />
                          {video.status === 'completed' ? 'View Analysis' : 'View Details'}
                        </Button>
                      </Link>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={video.status === 'completed' ? 'default' : 'secondary'}
                        className="flex items-center gap-1 glass backdrop-blur-md border-white/20"
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
                    <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    
                    {video.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                        
                        {video.duration && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>

                      {video.youtubeUrl && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs gradient-primary text-primary-foreground border-0">
                            <Play className="w-3 h-3 mr-1" />
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
