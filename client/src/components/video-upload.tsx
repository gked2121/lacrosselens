import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudUpload, Link as LinkIcon, Upload, Loader2, Camera } from "lucide-react";

interface VideoUploadProps {
  children: React.ReactNode;
}

export default function VideoUpload({ children }: VideoUploadProps) {
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fileUploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video uploaded successfully! Analysis will begin shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const youtubeUploadMutation = useMutation({
    mutationFn: async (data: { youtubeUrl: string; title: string; description: string }) => {
      const response = await apiRequest("POST", "/api/videos/youtube", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "YouTube video queued for analysis! Processing will begin shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setRecordedBlob(null);
    setIsRecording(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload MP4, MOV, or AVI files only.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
      toast({
        title: "File Too Large",
        description: "Please upload files smaller than 2GB.",
        variant: "destructive",
      });
      return;
    }

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title || file.name);
    formData.append("description", description);

    fileUploadMutation.mutate(formData);
  };

  const handleYouTubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl) {
      toast({
        title: "Missing URL",
        description: "Please enter a YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    youtubeUploadMutation.mutate({
      youtubeUrl,
      title: title || "YouTube Video Analysis",
      description,
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to record videos.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadRecording = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], `recording-${Date.now()}.mp4`, {
        type: 'video/mp4'
      });
      handleFileUpload(file);
    }
  };

  const isLoading = fileUploadMutation.isPending || youtubeUploadMutation.isPending;

  // Quick upload card for dashboard
  if (!children) {
    return (
      <Card className="border-2 border-dashed border-primary/50 hover:border-primary cursor-pointer">
        <CardContent className="p-6 text-center" onClick={() => setOpen(true)}>
          <CloudUpload className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-foreground mb-1">Quick Upload</h3>
          <p className="text-sm text-muted-foreground">
            Upload or record a video for instant analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Video for Analysis</DialogTitle>
          <DialogDescription>
            Upload a lacrosse video file, provide a YouTube URL, or record directly from your camera for AI-powered analysis.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="youtube">YouTube URL</TabsTrigger>
            <TabsTrigger value="record">Record Video</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            {/* File Upload */}
            <Card
              className={`border-2 border-dashed transition-colors cursor-pointer ${
                dragActive 
                  ? "border-primary bg-primary/10" 
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="p-8 text-center">
                <CloudUpload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  Drop video files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports MP4, MOV, AVI up to 2GB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/quicktime"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* File Upload Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-title">Video Title</Label>
                <Input
                  id="file-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title..."
                />
              </div>
              
              <div>
                <Label htmlFor="file-description">Description (Optional)</Label>
                <Textarea
                  id="file-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional context about this video..."
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4">
            <form onSubmit={handleYouTubeSubmit} className="space-y-4">
              <div>
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="youtube-url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="youtube-title">Title</Label>
                <Input
                  id="youtube-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Video title (optional)"
                />
              </div>

              <div>
                <Label htmlFor="youtube-description">Description (Optional)</Label>
                <Textarea
                  id="youtube-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional context about this video..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !youtubeUrl}
              >
                {youtubeUploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing YouTube Video...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Analyze YouTube Video
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="record" className="space-y-4">
            <div className="space-y-4">
              {/* Camera Preview */}
              <Card>
                <CardContent className="p-4">
                  <video
                    ref={videoRef}
                    className="w-full aspect-video bg-slate-900 rounded-lg"
                    muted
                    playsInline
                  />
                  
                  <div className="flex justify-center gap-2 mt-4">
                    {!isRecording && !recordedBlob && (
                      <Button onClick={startRecording}>
                        <Camera className="w-4 h-4 mr-2" />
                        Start Recording
                      </Button>
                    )}
                    
                    {isRecording && (
                      <Button onClick={stopRecording} variant="destructive">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                        Stop Recording
                      </Button>
                    )}
                    
                    {recordedBlob && !isRecording && (
                      <div className="flex gap-2">
                        <Button onClick={() => setRecordedBlob(null)} variant="outline">
                          Record Again
                        </Button>
                        <Button onClick={uploadRecording} disabled={isLoading}>
                          {fileUploadMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Recording
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recording Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="record-title">Video Title</Label>
                  <Input
                    id="record-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="record-description">Description (Optional)</Label>
                  <Textarea
                    id="record-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any additional context about this video..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}