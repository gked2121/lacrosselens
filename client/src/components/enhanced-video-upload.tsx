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

      <CardContent className="p-8 pt-0 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-2 rounded-2xl" style={{ backgroundColor: 'hsl(var(--muted))' }}>
            <TabsTrigger value="file" className="flex items-center gap-2 rounded-xl py-3 font-semibold text-base">
              <Upload className="w-5 h-5" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2 rounded-xl py-3 font-semibold text-base">
              <Play className="w-5 h-5" />
              YouTube URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-6">
            <form onSubmit={handleFileUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Video File</Label>
                    <Input
                      id="file"
                      name="video"
                      type="file"
                      accept="video/*"
                      required
                      className="input-modern mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, MOV, AVI supported. Max 2GB.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="title">Video Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Championship Game vs Eagles"
                      value={fileData.title}
                      onChange={(e) => setFileData({ ...fileData, title: e.target.value })}
                      className="input-modern mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Additional context about the video..."
                      value={fileData.description}
                      onChange={(e) => setFileData({ ...fileData, description: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Analysis Type</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {["generic", "team_scout", "player_scout", "personal_feedback", "recruiting"].map((type) => {
                        const info = getAnalysisTypeInfo(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAnalysisType(type)}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200`}
                            style={{
                              borderColor: analysisType === type ? 'hsl(259 100% 65%)' : 'hsl(var(--border))',
                              backgroundColor: analysisType === type ? 'hsl(259 100% 65% / 0.05)' : 'transparent'
                            }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span style={{ color: analysisType === type ? 'hsl(259 100% 65%)' : 'hsl(var(--foreground))' }}>
                                {info.icon}
                              </span>
                              <span className="font-semibold text-base" style={{ color: 'hsl(var(--foreground))' }}>{info.title}</span>
                            </div>
                            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{info.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="userPrompt">Custom Analysis Request</Label>
                    <Textarea
                      id="userPrompt"
                      placeholder={promptExamples[analysisType as keyof typeof promptExamples] || "Tell the AI exactly what you want analyzed..."}
                      value={fileData.userPrompt}
                      onChange={(e) => setFileData({ ...fileData, userPrompt: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Be specific about what you want analyzed for the best results
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 rounded-2xl" style={{ backgroundColor: 'hsl(259 100% 65% / 0.05)', border: '2px solid hsl(259 100% 65% / 0.2)' }}>
                <div className="flex items-center gap-3">
                  <Switch
                    id="advanced-analysis"
                    checked={useAdvancedAnalysis}
                    onCheckedChange={setUseAdvancedAnalysis}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label 
                    htmlFor="advanced-analysis" 
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5" style={{ color: 'hsl(259 100% 65%)' }} />
                    <div>
                      <span className="font-semibold text-base" style={{ color: 'hsl(var(--foreground))' }}>
                        Advanced AI Analysis
                      </span>
                      <Badge className="ml-2" variant="secondary">BETA</Badge>
                      <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        Use multi-pass AI processing for maximum detail extraction (3x more insights)
                      </p>
                    </div>
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="videoType">Video Type</Label>
                  <Select value={fileData.videoType} onValueChange={(value) => setFileData({ ...fileData, videoType: value })}>
                    <SelectTrigger className="mt-1">
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

                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={fileData.level} onValueChange={(value) => setFileData({ ...fileData, level: value })}>
                    <SelectTrigger className="mt-1">
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

                <div>
                  <Label htmlFor="playerNumber">Player # (Optional)</Label>
                  <Input
                    id="playerNumber"
                    placeholder="e.g., 23"
                    value={fileData.playerNumber}
                    onChange={(e) => setFileData({ ...fileData, playerNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="position">Position (Optional)</Label>
                  <Select value={fileData.position} onValueChange={(value) => setFileData({ ...fileData, position: value })}>
                    <SelectTrigger className="mt-1">
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

              <div>
                <Label htmlFor="teamName">Team Name (Optional)</Label>
                <Input
                  id="teamName"
                  placeholder="e.g., Eagles"
                  value={fileData.teamName}
                  onChange={(e) => setFileData({ ...fileData, teamName: e.target.value })}
                  className="mt-1"
                />
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

          <TabsContent value="youtube" className="mt-6">
            <form onSubmit={handleYouTubeUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="youtubeUrl">YouTube URL</Label>
                    <Input
                      id="youtubeUrl"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeData.youtubeUrl}
                      onChange={(e) => setYoutubeData({ ...youtubeData, youtubeUrl: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ytTitle">Video Title</Label>
                    <Input
                      id="ytTitle"
                      placeholder="e.g., Championship Game Highlights"
                      value={youtubeData.title}
                      onChange={(e) => setYoutubeData({ ...youtubeData, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ytDescription">Description (Optional)</Label>
                    <Textarea
                      id="ytDescription"
                      placeholder="Additional context about the video..."
                      value={youtubeData.description}
                      onChange={(e) => setYoutubeData({ ...youtubeData, description: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Analysis Type</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {["generic", "team_scout", "player_scout", "personal_feedback", "recruiting"].map((type) => {
                        const info = getAnalysisTypeInfo(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAnalysisType(type)}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200`}
                            style={{
                              borderColor: analysisType === type ? 'hsl(259 100% 65%)' : 'hsl(var(--border))',
                              backgroundColor: analysisType === type ? 'hsl(259 100% 65% / 0.05)' : 'transparent'
                            }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span style={{ color: analysisType === type ? 'hsl(259 100% 65%)' : 'hsl(var(--foreground))' }}>
                                {info.icon}
                              </span>
                              <span className="font-semibold text-base" style={{ color: 'hsl(var(--foreground))' }}>{info.title}</span>
                            </div>
                            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{info.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ytUserPrompt">Custom Analysis Request</Label>
                    <Textarea
                      id="ytUserPrompt"
                      placeholder={promptExamples[analysisType as keyof typeof promptExamples] || "Tell the AI exactly what you want analyzed..."}
                      value={youtubeData.userPrompt}
                      onChange={(e) => setYoutubeData({ ...youtubeData, userPrompt: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="ytVideoType">Video Type</Label>
                  <Select value={youtubeData.videoType} onValueChange={(value) => setYoutubeData({ ...youtubeData, videoType: value })}>
                    <SelectTrigger className="mt-1">
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

                <div>
                  <Label htmlFor="ytLevel">Level</Label>
                  <Select value={youtubeData.level} onValueChange={(value) => setYoutubeData({ ...youtubeData, level: value })}>
                    <SelectTrigger className="mt-1">
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

                <div>
                  <Label htmlFor="ytPlayerNumber">Player # (Optional)</Label>
                  <Input
                    id="ytPlayerNumber"
                    placeholder="e.g., 23"
                    value={youtubeData.playerNumber}
                    onChange={(e) => setYoutubeData({ ...youtubeData, playerNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="ytPosition">Position (Optional)</Label>
                  <Select value={youtubeData.position} onValueChange={(value) => setYoutubeData({ ...youtubeData, position: value })}>
                    <SelectTrigger className="mt-1">
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

              <div>
                <Label htmlFor="ytTeamName">Team Name (Optional)</Label>
                <Input
                  id="ytTeamName"
                  placeholder="e.g., Eagles"
                  value={youtubeData.teamName}
                  onChange={(e) => setYoutubeData({ ...youtubeData, teamName: e.target.value })}
                  className="mt-1"
                />
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

        <div className="rounded-2xl p-6" style={{ backgroundColor: 'hsl(259 100% 65% / 0.05)', border: '1px solid hsl(259 100% 65% / 0.1)' }}>
          <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: 'hsl(259 100% 65%)' }} />
            Pro Tips for Better Analysis
          </h4>
          <ul className="text-sm space-y-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: 'hsl(259 100% 65%)' }}>•</span>
              <span>Be specific in your analysis request for more targeted insights</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: 'hsl(259 100% 65%)' }}>•</span>
              <span>Include player numbers and positions when possible</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: 'hsl(259 100% 65%)' }}>•</span>
              <span>Higher quality video leads to more accurate analysis</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2" style={{ color: 'hsl(259 100% 65%)' }}>•</span>
              <span>Analysis typically takes 2-3 minutes to complete</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}