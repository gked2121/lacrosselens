import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Target, Users, Zap, BarChart3, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center shadow-glow">
                <Play className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LacrosseLens</span>
            </div>
            <Button onClick={handleLogin} className="gradient-primary shadow-glow hover:scale-105 transition-transform">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-[150%] h-[150%] bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-[150%] h-[150%] bg-gradient-to-tr from-secondary/20 via-transparent to-primary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-white">AI-Powered Analysis Now Available</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-8 leading-tight">
            Next-Gen
            <span className="text-gradient block sm:inline"> Lacrosse Analytics</span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-light">
            Professional video analysis in seconds. Upload game footage and receive 
            AI-generated insights that transform how you coach, scout, and play.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleLogin} 
              className="gradient-primary shadow-glow hover:scale-105 transition-all text-lg px-8 py-6"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Free Analysis
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="glass text-white border-white/20 hover:bg-white/10 text-lg px-8 py-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>1000+ Videos Analyzed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Under 2min Processing</span>
            </div>
            <div className="flex items-center gap-2 hidden sm:flex">
              <Target className="w-4 h-4" />
              <span>95% Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50 backdrop-blur-xl border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              AI That <span className="text-gradient">Understands</span> Lacrosse
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
              Built by coaches, for coaches. Our AI analyzes game footage with the expertise 
              of a professional lacrosse analyst.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Player Evaluation</h3>
                <p className="text-slate-400">
                  Deep analysis of individual player performance, technique, and decision-making with specific improvement recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Face-Off Mastery</h3>
                <p className="text-slate-400">
                  Detailed analysis of face-off techniques, timing, grip positioning, and win probability based on form.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Transition Intelligence</h3>
                <p className="text-slate-400">
                  Track transition speed, player positioning, and identify optimal fast-break opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-Time Coaching</h3>
                <p className="text-slate-400">
                  Instant analysis during games and practices with actionable insights delivered to your device.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Performance Metrics</h3>
                <p className="text-slate-400">
                  Comprehensive statistics and trends to track team and individual player development over time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Save Hours Weekly</h3>
                <p className="text-slate-400">
                  Reduce manual video analysis from 15+ hours to minutes, giving you more time for actual coaching.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-8">
            Ready to <span className="text-gradient">Transform</span> Your Coaching?
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 mb-8">
            Join coaches who are already saving hours and improving their team's performance with AI-powered analysis.
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin} 
            className="gradient-primary shadow-glow hover:scale-105 transition-all text-lg px-8 py-6"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Your Free Analysis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            © 2025 LacrosseLens. Powered by Gemini Pro 2.5 AI
          </p>
        </div>
      </footer>
    </div>
  );
}
