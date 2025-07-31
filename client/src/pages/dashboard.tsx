import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import EnhancedVideoUpload from "@/components/enhanced-video-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Target, Clock, Download, Plus, Play, LoaderPinwheel, CloudUpload, Sparkles, TrendingUp, Activity, BarChart3, ArrowRight, Eye, Calendar, FileVideo, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

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

  const recentVideos = Array.isArray(videos) ? videos.slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        {/* Modern Hero Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    AI-powered lacrosse analytics at your fingertips
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="group bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800">
                <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Export Report
              </Button>
              <Link href="/videos">
                <Button className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all">
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                  Upload Video
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Videos Analyzed */}
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-400/5 dark:to-purple-400/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+12%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Videos Analyzed</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {statsLoading ? (
                    <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  ) : (
                    (stats as any)?.videosAnalyzed || 0
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Processing active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Queue */}
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-400/5 dark:to-orange-400/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Processing Queue</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {statsLoading ? (
                    <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  ) : (
                    (stats as any)?.videosProcessing || 0
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Videos in queue</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Insights */}
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-400/5 dark:to-teal-400/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">AI</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Confidence</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {statsLoading ? (
                    <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  ) : (
                    `${Math.round((stats as any)?.averageConfidence || 0)}%`
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Analysis quality</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teams */}
          <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-400/5 dark:to-pink-400/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                  Soon
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Teams</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {statsLoading ? (
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  ) : (
                    (stats as any)?.totalTeams || 0
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Coming soon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Videos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Quick Upload Section */}
          <div className="lg:col-span-1">
            <Card className="h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <CloudUpload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Quick Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload your game footage and get AI-powered insights in minutes.
                </p>
                <div className="space-y-3">
                  <Link href="/videos">
                    <Button className="w-full group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      <FileVideo className="w-4 h-4 mr-2" />
                      Upload Video File
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/videos">
                    <Button variant="outline" className="w-full group border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50">
                      <Play className="w-4 h-4 mr-2" />
                      Analyze YouTube Video
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Videos */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Recent Analysis
                  </CardTitle>
                  <Link href="/videos">
                    <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {videosLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse">
                        <div className="w-16 h-12 bg-slate-200 dark:bg-slate-600 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-600 rounded"></div>
                          <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentVideos.length > 0 ? (
                  <div className="space-y-3">
                    {recentVideos.map((video: any) => (
                      <Link key={video.id} href={`/analysis/${video.id}`}>
                        <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                          <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
                            {video.thumbnailUrl ? (
                              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                            ) : (
                              <Video className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            )}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
                              {video.title}
                            </h4>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge 
                                variant={video.status === 'completed' ? 'default' : video.status === 'processing' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {video.status === 'completed' && '✓ Complete'}
                                {video.status === 'processing' && '⏳ Processing'}
                                {video.status === 'failed' && '✗ Failed'}
                              </Badge>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(video.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileVideo className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No videos yet</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Upload your first video to start analyzing your game footage</p>
                    <Link href="/videos">
                      <Button className="bg-gradient-to-r from-primary to-primary/80">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Video
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            AI Coaching Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Practice Plan Builder */}
            <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-400/5 dark:to-emerald-400/5"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                    Coming Soon
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Practice Plan Builder</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Generate custom practice plans based on your team's analysis
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Workout Builder */}
            <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 dark:from-orange-400/5 dark:to-red-400/5"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-0">
                    Coming Soon
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Workout Builder</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Create personalized training programs for player development
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Game Report Generator */}
            <Card className="group relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 dark:from-purple-400/5 dark:to-indigo-400/5"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <FileVideo className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                    Coming Soon
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Game Report Generator</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Auto-generate comprehensive game reports with key insights
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Tips Section */}
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  AI-Powered Coaching Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">Better Video Quality = Better Analysis</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Upload videos in HD with clear visibility of players and field markings for the most accurate AI insights.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">Focus on Key Moments</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Our AI excels at analyzing face-offs, transitions, and scoring opportunities - include these in your footage.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">Use Custom Prompts</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Tell the AI what to focus on - specific players, techniques, or game situations for targeted analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}