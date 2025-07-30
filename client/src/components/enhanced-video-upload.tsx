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
import { Upload, Play, Target, Users, TrendingUp, Star, Zap, Sparkles } from "lucide-react";

export default function EnhancedVideoUpload() {
  const [activeTab, setActiveTab] = useState("file");
  const [analysisType, setAnalysisType] = useState("generic");
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
        description: "Your YouTube video is being analyzed. Check back in a few minutes for results.",
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

      <CardContent className="p-4 sm:p-6 lg:p-8 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 rounded-xl" style={{ 
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))'
          }}>
            <TabsTrigger 
              value="file" 
              className="flex items-center gap-2 rounded-lg py-2.5 px-4 font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">File Upload</span>
              <span className="sm:hidden">File</span>
            </TabsTrigger>
            <TabsTrigger 
              value="youtube" 
              className="flex items-center gap-2 rounded-lg py-2.5 px-4 font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">YouTube URL</span>
              <span className="sm:hidden">YouTube</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-6 space-y-8">
            <form onSubmit={handleFileUpload} className="space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Video Details</h3>
                  <p className="text-sm text-muted-foreground">Upload your lacrosse video for analysis</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="file" className="text-sm font-medium">Video File *</Label>
                      <Input
                        id="file"
                        name="video"
                        type="file"
                        accept="video/*"
                        required
                        className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported: MP4, MOV, AVI (Max 2GB)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">Video Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., Championship Game vs Eagles"
                        value={fileData.title}
                        onChange={(e) => setFileData({ ...fileData, title: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Add context about the game, players, or specific moments..."
                        value={fileData.description}
                        onChange={(e) => setFileData({ ...fileData, description: e.target.value })}
                        className="min-h-[100px] resize-none"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Analysis Focus</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {["generic", "team_scout", "player_scout", "personal_feedback", "recruiting"].map((type) => {
                          const info = getAnalysisTypeInfo(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAnalysisType(type)}
                              className={`p-4 rounded-lg border text-left transition-all hover:border-primary/50 ${
                                analysisType === type 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={analysisType === type ? 'text-primary' : 'text-muted-foreground'}>
                                  {info.icon}
                                </span>
                                <div className="flex-1">
                                  <span className="font-medium text-sm">{info.title}</span>
                                  <p className="text-xs text-muted-foreground mt-0.5">{info.desc}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userPrompt" className="text-sm font-medium">Custom Analysis Request</Label>
                      <Textarea
                        id="userPrompt"
                        placeholder={promptExamples[analysisType as keyof typeof promptExamples] || "Tell the AI what specific aspects to analyze..."}
                        value={fileData.userPrompt}
                        onChange={(e) => setFileData({ ...fileData, userPrompt: e.target.value })}
                        className="min-h-[100px] resize-none"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Be specific for better results
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Analysis Toggle */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-4">
                  <Switch
                    id="advanced-analysis"
                    checked={useAdvancedAnalysis}
                    onCheckedChange={setUseAdvancedAnalysis}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <Label 
                      htmlFor="advanced-analysis" 
                      className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                      Advanced AI Analysis
                      <Badge variant="secondary" className="text-xs">BETA</Badge>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Multi-pass processing extracts 3x more insights from your video
                    </p>
                  </div>
                </div>
              </div>

              {/* Game Details Section */}
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-semibold text-foreground">Game Information</h3>
                  <p className="text-sm text-muted-foreground">Help the AI understand the context</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoType" className="text-sm font-medium">Video Type *</Label>
                    <Select value={fileData.videoType} onValueChange={(value) => setFileData({ ...fileData, videoType: value })}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="game">Full Game</SelectItem>
                        <SelectItem value="practice">Practice Session</SelectItem>
                        <SelectItem value="highlight">Highlight Tape</SelectItem>
                        <SelectItem value="drill">Drill/Training</SelectItem>
                        <SelectItem value="scrimmage">Scrimmage</SelectItem>
                        <SelectItem value="recruiting">Recruiting Tape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level" className="text-sm font-medium">Competition Level *</Label>
                    <Select value={fileData.level} onValueChange={(value) => setFileData({ ...fileData, level: value })}>
                      <SelectTrigger className="h-11">
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

                  <div className="space-y-2">
                    <Label htmlFor="teamName" className="text-sm font-medium">Team Name</Label>
                    <Input
                      id="teamName"
                      placeholder="e.g., Eagles"
                      value={fileData.teamName}
                      onChange={(e) => setFileData({ ...fileData, teamName: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playerNumber" className="text-sm font-medium">Player Number</Label>
                    <Input
                      id="playerNumber"
                      placeholder="e.g., 23"
                      value={fileData.playerNumber}
                      onChange={(e) => setFileData({ ...fileData, playerNumber: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                    <Select value={fileData.position} onValueChange={(value) => setFileData({ ...fileData, position: value })}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select position" />
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

          <TabsContent value="youtube" className="mt-6 space-y-8">
            <form onSubmit={handleYouTubeUpload} className="space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-1">YouTube Video Details</h3>
                  <p className="text-sm text-muted-foreground">Analyze any YouTube lacrosse video</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="youtubeUrl" className="text-sm font-medium">YouTube URL *</Label>
                      <Input
                        id="youtubeUrl"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeData.youtubeUrl}
                        onChange={(e) => setYoutubeData({ ...youtubeData, youtubeUrl: e.target.value })}
                        required
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste any public YouTube video URL
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ytTitle" className="text-sm font-medium">Video Title</Label>
                      <Input
                        id="ytTitle"
                        placeholder="e.g., Championship Game Highlights"
                        value={youtubeData.title}
                        onChange={(e) => setYoutubeData({ ...youtubeData, title: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ytDescription" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="ytDescription"
                        placeholder="Add context about the game, players, or specific moments..."
                        value={youtubeData.description}
                        onChange={(e) => setYoutubeData({ ...youtubeData, description: e.target.value })}
                        className="min-h-[100px] resize-none"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Analysis Focus</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {["generic", "team_scout", "player_scout", "personal_feedback", "recruiting"].map((type) => {
                          const info = getAnalysisTypeInfo(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAnalysisType(type)}
                              className={`p-4 rounded-lg border text-left transition-all hover:border-primary/50 ${
                                analysisType === type 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={analysisType === type ? 'text-primary' : 'text-muted-foreground'}>
                                  {info.icon}
                                </span>
                                <div className="flex-1">
                                  <span className="font-medium text-sm">{info.title}</span>
                                  <p className="text-xs text-muted-foreground mt-0.5">{info.desc}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ytUserPrompt" className="text-sm font-medium">Custom Analysis Request</Label>
                      <Textarea
                        id="ytUserPrompt"
                        placeholder={promptExamples[analysisType as keyof typeof promptExamples] || "Tell the AI what specific aspects to analyze..."}
                        value={youtubeData.userPrompt}
                        onChange={(e) => setYoutubeData({ ...youtubeData, userPrompt: e.target.value })}
                        className="min-h-[100px] resize-none"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Be specific for better results
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Details Section */}
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-semibold text-foreground">Game Information</h3>
                  <p className="text-sm text-muted-foreground">Help the AI understand the context</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ytVideoType" className="text-sm font-medium">Video Type *</Label>
                    <Select value={youtubeData.videoType} onValueChange={(value) => setYoutubeData({ ...youtubeData, videoType: value })}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="game">Full Game</SelectItem>
                        <SelectItem value="practice">Practice Session</SelectItem>
                        <SelectItem value="highlight">Highlight Tape</SelectItem>
                        <SelectItem value="drill">Drill/Training</SelectItem>
                        <SelectItem value="scrimmage">Scrimmage</SelectItem>
                        <SelectItem value="recruiting">Recruiting Tape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ytLevel" className="text-sm font-medium">Competition Level *</Label>
                    <Select value={youtubeData.level} onValueChange={(value) => setYoutubeData({ ...youtubeData, level: value })}>
                      <SelectTrigger className="h-11">
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

                  <div className="space-y-2">
                    <Label htmlFor="ytTeamName" className="text-sm font-medium">Team Name</Label>
                    <Input
                      id="ytTeamName"
                      placeholder="e.g., Eagles"
                      value={youtubeData.teamName}
                      onChange={(e) => setYoutubeData({ ...youtubeData, teamName: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ytPlayerNumber" className="text-sm font-medium">Player Number</Label>
                    <Input
                      id="ytPlayerNumber"
                      placeholder="e.g., 23"
                      value={youtubeData.playerNumber}
                      onChange={(e) => setYoutubeData({ ...youtubeData, playerNumber: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ytPosition" className="text-sm font-medium">Position</Label>
                    <Select value={youtubeData.position} onValueChange={(value) => setYoutubeData({ ...youtubeData, position: value })}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select position" />
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
              </div>

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

        {/* Pro Tips Section */}
        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-5">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Pro Tips for Better Analysis
          </h4>
          <ul className="text-xs space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Be specific in your analysis request for more targeted insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Include player numbers and positions when possible</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Higher quality video leads to more accurate analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Analysis typically takes 2-3 minutes to complete</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}