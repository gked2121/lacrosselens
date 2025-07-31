import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Play, Target, Users, TrendingUp, Star, Zap, Sparkles, AlertCircle } from "lucide-react";

export default function EnhancedVideoUpload() {
  const [activeTab, setActiveTab] = useState("file");
  const [useAdvancedAnalysis, setUseAdvancedAnalysis] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // File upload state
  const [fileData, setFileData] = useState({
    title: "",
    description: "",
    userPrompt: "",
    playerNumber: "",
    teamName: "",
    position: "",
    level: "high_school",
    videoType: "game",
    analysisType: "generic",
  });

  // YouTube upload state  
  const [youtubeData, setYoutubeData] = useState({
    youtubeUrl: "",
    title: "",
    description: "",
    userPrompt: "",
    playerNumber: "",
    teamName: "",
    position: "",
    level: "high_school",
    videoType: "game",
    analysisType: "generic",
  });

  const fileUploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest("/api/videos/upload", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Upload Started",
        description: "Your video is being processed. Check back in a few minutes for analysis results.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    },
  });

  const youtubeUploadMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/videos/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Started",
        description: "Fetching video metadata and analyzing content. Check back in a few minutes for results.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze YouTube video",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Add analysis options to form data
    formData.append("userPrompt", fileData.userPrompt);
    formData.append("playerNumber", fileData.playerNumber);
    formData.append("teamName", fileData.teamName);
    formData.append("position", fileData.position);
    formData.append("level", fileData.level);
    formData.append("analysisType", fileData.analysisType);
    formData.append("videoType", fileData.videoType);
    formData.append("useAdvancedAnalysis", useAdvancedAnalysis.toString());
    
    fileUploadMutation.mutate(formData);
  };

  const handleYouTubeUpload = (e: React.FormEvent) => {
    e.preventDefault();
    youtubeUploadMutation.mutate({
      ...youtubeData,
      useAdvancedAnalysis
    });
  };

  const getAnalysisTypeInfo = (type: string) => {
    const types = {
      generic: { 
        icon: <Star className="w-4 h-4" />, 
        title: "General Analysis", 
        desc: "Comprehensive lacrosse performance analysis" 
      },
      team_scout: { 
        icon: <Users className="w-4 h-4" />, 
        title: "Team Scout", 
        desc: "Detailed team systems and tactical breakdown" 
      },
      player_scout: { 
        icon: <Target className="w-4 h-4" />, 
        title: "Player Scout", 
        desc: "Individual player evaluation and recruiting assessment" 
      },
      personal_feedback: { 
        icon: <TrendingUp className="w-4 h-4" />, 
        title: "Personal Feedback", 
        desc: "Skill development and improvement recommendations" 
      },
      recruiting: { 
        icon: <Zap className="w-4 h-4" />, 
        title: "Recruiting Eval", 
        desc: "College recruiting and Division I readiness assessment" 
      },
    };
    return types[type as keyof typeof types] || types.generic;
  };

  const promptExamples = {
    team_scout: "Scout this team's offensive systems and defensive weaknesses for our next game",
    player_scout: "Give me a detailed scouting report on #23 for recruiting purposes", 
    personal_feedback: "Watch me play and give me specific feedback on my dodging technique",
    recruiting: "Evaluate this player for Division I college lacrosse potential",
  };

  return (
    <Card className="w-full max-w-4xl mx-auto card-modern">
      <CardHeader className="p-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
            <Upload className="w-7 h-7" style={{ color: 'hsl(259 100% 65%)' }} />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>AI-Powered Video Analysis</CardTitle>
            <p className="mt-1 text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Upload lacrosse footage for professional-grade coaching insights
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="youtube">YouTube URL</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-6">
            <form onSubmit={handleFileUpload} className="space-y-6">
              {/* Step 1: Upload File */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Choose your video file</Label>
                  <Input
                    id="file"
                    name="video"
                    type="file"
                    accept="video/*"
                    required
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, MOV, or AVI • Max 2GB
                  </p>
                </div>

                <div>
                  <Label htmlFor="title">Give it a title (optional)</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Championship Game vs Eagles"
                    value={fileData.title}
                    onChange={(e) => setFileData({ ...fileData, title: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Step 2: What to analyze */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">What type of analysis do you need?</Label>
                <RadioGroup value={fileData.analysisType} onValueChange={(value) => setFileData({ ...fileData, analysisType: value })}>
                  <div className="space-y-3">
                    {["generic", "team_scout", "player_scout", "personal_feedback", "recruiting"].map((type) => {
                      const info = getAnalysisTypeInfo(type);
                      const isSelected = fileData.analysisType === type;
                      return (
                        <label
                          key={type}
                          htmlFor={type}
                          className={`relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border bg-background hover:bg-accent/50'
                          }`}
                        >
                          <RadioGroupItem 
                            value={type} 
                            id={type} 
                            className="mt-0.5 h-5 w-5 border-2" 
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-primary">{info.icon}</span>
                              <span className="font-semibold">{info.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{info.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>

              {/* Step 3: Basic context */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="videoType">Video type</Label>
                  <Select value={fileData.videoType} onValueChange={(value) => setFileData({ ...fileData, videoType: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="game">Full Game</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="highlight">Highlights</SelectItem>
                      <SelectItem value="drill">Drill</SelectItem>
                      <SelectItem value="scrimmage">Scrimmage</SelectItem>
                      <SelectItem value="recruiting">Recruiting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={fileData.level} onValueChange={(value) => setFileData({ ...fileData, level: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youth">Youth</SelectItem>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional: Add more details */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Add more details (optional)
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Any specific moments or players to focus on?"
                      value={fileData.description}
                      onChange={(e) => setFileData({ ...fileData, description: e.target.value })}
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="playerNumber">Player #</Label>
                      <Input
                        id="playerNumber"
                        placeholder="23"
                        value={fileData.playerNumber}
                        onChange={(e) => setFileData({ ...fileData, playerNumber: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Select value={fileData.position} onValueChange={(value) => setFileData({ ...fileData, position: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Attack">Attack</SelectItem>
                          <SelectItem value="Midfield">Midfield</SelectItem>
                          <SelectItem value="Defense">Defense</SelectItem>
                          <SelectItem value="FOGO">FOGO</SelectItem>
                          <SelectItem value="Goalie">Goalie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="userPrompt">Special instructions for AI</Label>
                    <Textarea
                      id="userPrompt"
                      placeholder={promptExamples[fileData.analysisType as keyof typeof promptExamples] || "What should the AI focus on?"}
                      value={fileData.userPrompt}
                      onChange={(e) => setFileData({ ...fileData, userPrompt: e.target.value })}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              </details>

              {/* Advanced Analysis Option */}
              <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                <Switch
                  id="advanced-analysis"
                  checked={useAdvancedAnalysis}
                  onCheckedChange={setUseAdvancedAnalysis}
                />
                <Label htmlFor="advanced-analysis" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Use Advanced Analysis</span>
                    <Badge variant="outline" className="text-xs">Beta</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get 3x more insights with multi-pass AI processing
                  </p>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary" 
                disabled={fileUploadMutation.isPending}
                size="lg"
              >
                {fileUploadMutation.isPending ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload & Analyze Video
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-6">
            <form onSubmit={handleYouTubeUpload} className="space-y-6">
              {/* YouTube Analysis Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Smart YouTube Analysis</p>
                    <p className="text-blue-700 dark:text-blue-300">
                      We automatically fetch the video title, description, and metadata from YouTube. 
                      Leave the title blank to use the original YouTube title, or provide your own custom title.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step 1: YouTube URL */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="youtubeUrl">Paste YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeData.youtubeUrl}
                    onChange={(e) => setYoutubeData({ ...youtubeData, youtubeUrl: e.target.value })}
                    required
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Any public YouTube video
                  </p>
                </div>

                <div>
                  <Label htmlFor="ytTitle">Custom title (optional)</Label>
                  <Input
                    id="ytTitle"
                    placeholder="Leave blank to use original YouTube title"
                    value={youtubeData.title}
                    onChange={(e) => setYoutubeData({ ...youtubeData, title: e.target.value })}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll automatically use the YouTube video's title if you don't provide one
                  </p>
                </div>
              </div>

              {/* Step 2: What to analyze */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">What type of analysis do you need?</Label>
                <RadioGroup value={youtubeData.analysisType} onValueChange={(value) => setYoutubeData({ ...youtubeData, analysisType: value })}>
                  <div className="space-y-3">
                    {["generic", "team_scout", "player_scout", "personal_feedback", "recruiting"].map((type) => {
                      const info = getAnalysisTypeInfo(type);
                      const isSelected = youtubeData.analysisType === type;
                      return (
                        <label
                          key={type}
                          htmlFor={`yt-${type}`}
                          className={`relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border bg-background hover:bg-accent/50'
                          }`}
                        >
                          <RadioGroupItem 
                            value={type} 
                            id={`yt-${type}`} 
                            className="mt-0.5 h-5 w-5 border-2" 
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-primary">{info.icon}</span>
                              <span className="font-semibold">{info.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{info.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>

              {/* Step 3: Basic context */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ytVideoType">Video type</Label>
                  <Select value={youtubeData.videoType} onValueChange={(value) => setYoutubeData({ ...youtubeData, videoType: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="game">Full Game</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="highlight">Highlights</SelectItem>
                      <SelectItem value="drill">Drill</SelectItem>
                      <SelectItem value="scrimmage">Scrimmage</SelectItem>
                      <SelectItem value="recruiting">Recruiting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ytLevel">Level</Label>
                  <Select value={youtubeData.level} onValueChange={(value) => setYoutubeData({ ...youtubeData, level: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youth">Youth</SelectItem>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional: Add more details */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Add more details (optional)
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="ytDescription">Description</Label>
                    <Textarea
                      id="ytDescription"
                      placeholder="Any specific moments or players to focus on?"
                      value={youtubeData.description}
                      onChange={(e) => setYoutubeData({ ...youtubeData, description: e.target.value })}
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ytPlayerNumber">Player #</Label>
                      <Input
                        id="ytPlayerNumber"
                        placeholder="23"
                        value={youtubeData.playerNumber}
                        onChange={(e) => setYoutubeData({ ...youtubeData, playerNumber: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ytPosition">Position</Label>
                      <Select value={youtubeData.position} onValueChange={(value) => setYoutubeData({ ...youtubeData, position: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Attack">Attack</SelectItem>
                          <SelectItem value="Midfield">Midfield</SelectItem>
                          <SelectItem value="Defense">Defense</SelectItem>
                          <SelectItem value="FOGO">FOGO</SelectItem>
                          <SelectItem value="Goalie">Goalie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ytUserPrompt">Special instructions for AI</Label>
                    <Textarea
                      id="ytUserPrompt"
                      placeholder={promptExamples[youtubeData.analysisType as keyof typeof promptExamples] || "What should the AI focus on?"}
                      value={youtubeData.userPrompt}
                      onChange={(e) => setYoutubeData({ ...youtubeData, userPrompt: e.target.value })}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              </details>

              <Button 
                type="submit" 
                className="w-full btn-primary" 
                disabled={youtubeUploadMutation.isPending}
                size="lg"
              >
                {youtubeUploadMutation.isPending ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Analyze YouTube Video
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>


      </CardContent>
    </Card>
  );
}