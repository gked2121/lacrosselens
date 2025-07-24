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
import { Upload, Play, Target, Users, TrendingUp, Star, Zap } from "lucide-react";

export default function EnhancedVideoUpload() {
  const [activeTab, setActiveTab] = useState("file");
  const [analysisType, setAnalysisType] = useState("generic");
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
    
    fileUploadMutation.mutate(formData);
  };

  const handleYouTubeUpload = (e: React.FormEvent) => {
    e.preventDefault();
    youtubeUploadMutation.mutate(youtubeData);
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
      <CardHeader className="content-padding pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}>
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">AI-Powered Video Analysis</CardTitle>
            <p className="text-muted-foreground mt-1">
              Upload lacrosse footage for professional-grade coaching insights
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="content-padding pt-0 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl">
            <TabsTrigger value="file" className="flex items-center gap-2 rounded-lg py-3">
              <Upload className="w-4 h-4" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2 rounded-lg py-3">
              <Play className="w-4 h-4" />
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
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              analysisType === type
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {info.icon}
                              <span className="font-medium text-sm">{info.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{info.desc}</p>
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <Label htmlFor="teamName">Team Name (Optional)</Label>
                  <Input
                    id="teamName"
                    placeholder="e.g., Eagles"
                    value={fileData.teamName}
                    onChange={(e) => setFileData({ ...fileData, teamName: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={fileUploadMutation.isPending}
                size="lg"
              >
                {fileUploadMutation.isPending ? "Uploading..." : "Upload & Analyze Video"}
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
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              analysisType === type
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {info.icon}
                              <span className="font-medium text-sm">{info.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{info.desc}</p>
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
                  <Label htmlFor="ytTeamName">Team Name (Optional)</Label>
                  <Input
                    id="ytTeamName"
                    placeholder="e.g., Eagles"
                    value={youtubeData.teamName}
                    onChange={(e) => setYoutubeData({ ...youtubeData, teamName: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={youtubeUploadMutation.isPending}
                size="lg"
              >
                {youtubeUploadMutation.isPending ? "Analyzing..." : "Analyze YouTube Video"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Pro Tips for Better Analysis
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Be specific in your analysis request for more targeted insights</li>
            <li>• Include player numbers and positions when possible</li>
            <li>• Higher quality video leads to more accurate analysis</li>
            <li>• Analysis typically takes 2-3 minutes to complete</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}