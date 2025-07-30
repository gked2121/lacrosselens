import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Target, Users, Zap, BarChart3, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(259 100% 65%)' }}>
                <Play className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">LacrosseLens</span>
            </div>
            <Button onClick={handleLogin} className="bg-foreground text-background hover:opacity-90">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-[150%] h-[150%] rounded-full blur-3xl opacity-5" style={{ backgroundColor: 'hsl(259 100% 65%)' }}></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-[150%] h-[150%] rounded-full blur-3xl opacity-5" style={{ backgroundColor: 'hsl(259 100% 65%)' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-muted-foreground">AI-Powered Analysis Now Available</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black mb-8 leading-tight">
            Next-Gen
            <span className="block sm:inline" style={{ color: 'hsl(259 100% 65%)' }}> Lacrosse Analytics</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light">
            Professional video analysis in seconds. Upload game footage and receive 
            AI-generated insights that transform how you coach, scout, and play.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleLogin} 
              className="bg-foreground text-background hover:opacity-90 text-lg px-8 py-6"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Free Analysis
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Professional Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Fast Processing</span>
            </div>
            <div className="flex items-center gap-2 hidden sm:flex">
              <Target className="w-4 h-4" />
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              AI That <span style={{ color: 'hsl(259 100% 65%)' }}>Understands</span> Lacrosse
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by coaches, for coaches. Our AI analyzes game footage with the expertise 
              of a professional lacrosse analyst.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Users className="w-6 h-6" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Player Evaluation</h3>
                <p className="text-muted-foreground">
                  Deep analysis of individual player performance, technique, and decision-making with specific improvement recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Target className="w-6 h-6" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Face-Off Mastery</h3>
                <p className="text-muted-foreground">
                  Detailed analysis of face-off techniques, timing, grip positioning, and win probability based on form.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Zap className="w-6 h-6" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Transition Intelligence</h3>
                <p className="text-muted-foreground">
                  Track transition speed, player positioning, and identify optimal fast-break opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Play className="w-6 h-6" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Coaching</h3>
                <p className="text-muted-foreground">
                  Instant analysis during games and practices with actionable insights delivered to your device.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <BarChart3 className="w-6 h-6" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Performance Metrics</h3>
                <p className="text-muted-foreground">
                  Comprehensive statistics and trends to track team and individual player development over time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Clock className="w-6 h-6" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Save Hours Weekly</h3>
                <p className="text-muted-foreground">
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
          <div className="absolute inset-0 opacity-5" style={{ backgroundColor: 'hsl(259 100% 65%)' }}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold mb-8">
            Ready to <span style={{ color: 'hsl(259 100% 65%)' }}>Transform</span> Your Coaching?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8">
            Start using AI-powered analysis to improve your team's performance and save valuable coaching time.
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin} 
            className="bg-foreground text-background hover:opacity-90 text-lg px-8 py-6"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Your Free Analysis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            © 2025 LacrosseLens. Powered by Gemini Pro 2.5 AI
          </p>
        </div>
      </footer>
    </div>
  );
}
