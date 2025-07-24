import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, SkipBack, SkipForward } from "lucide-react";

interface VideoPlayerProps {
  video: {
    id: number;
    title: string;
    filePath?: string;
    youtubeUrl?: string;
    status: string;
    duration?: number;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (video.status !== 'completed' && !video.youtubeUrl && !video.filePath) {
    return (
      <Card className="overflow-hidden">
        <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {video.status === 'processing' ? 'Video Processing' : 'Video Unavailable'}
            </h3>
            <p className="text-sm text-gray-300">
              {video.status === 'processing' 
                ? 'Your video is being processed and will be available shortly.'
                : 'This video is not yet ready for playback.'
              }
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-slate-900 aspect-video">
        {video.status === 'completed' && (
          <Badge 
            variant="default"
            className="absolute top-4 right-4 z-10 bg-green-600 hover:bg-green-700"
          >
            Analysis Complete
          </Badge>
        )}

        {video.youtubeUrl ? (
          // YouTube embed for YouTube videos
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeUrl.includes('v=') 
              ? video.youtubeUrl.split('v=')[1].split('&')[0]
              : video.youtubeUrl.split('/').pop()
            }`}
            title={video.title}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : video.filePath ? (
          // HTML5 video player for uploaded files
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
              poster="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675"
            >
              <source src={`/uploads/videos/${video.filePath.split('/').pop()}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Custom Video Controls */}
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
              onMouseEnter={() => setShowControls(true)}
            >
              {/* Progress Bar */}
              <div
                ref={progressRef}
                className="w-full bg-gray-600 h-1 rounded-full mb-4 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-100"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-primary hover:bg-white/10 p-2"
                    onClick={() => skipTime(-10)}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-primary hover:bg-white/10 p-2"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-primary hover:bg-white/10 p-2"
                    onClick={() => skipTime(10)}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-primary hover:bg-white/10 p-2"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-primary hover:bg-white/10 p-2"
                    onClick={handleFullscreen}
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Fallback placeholder
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675" 
              alt="Lacrosse video placeholder"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Video Preview</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{video.title}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>Uploaded: {new Date().toLocaleDateString()}</span>
              {video.duration && (
                <span>Duration: {formatTime(video.duration)}</span>
              )}
              {video.youtubeUrl && (
                <Badge variant="outline" className="text-xs">
                  YouTube
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={video.status === 'completed' ? 'default' : 'secondary'}>
              {video.status === 'completed' ? 'Analysis Ready' : 'Processing'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
