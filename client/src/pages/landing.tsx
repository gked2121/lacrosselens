import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Target, Users, Zap, BarChart3, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">LacrosseLens</span>
            </div>
            <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-8">
            Transform Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> Lacrosse Analysis</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            AI-powered insights for coaches, scouts, and players. Upload videos and get instant, 
            professional-grade analysis powered by Gemini Pro 2.5.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleLogin} className="bg-primary hover:bg-primary/90">
              Start Analyzing Videos
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Powered by AI That Actually Understands Lacrosse
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our custom fine-tuned AI model analyzes lacrosse footage like an experienced coach, 
              providing actionable insights for immediate improvement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Player Evaluation</h3>
                <p className="text-muted-foreground">
                  Deep analysis of individual player performance, technique, and decision-making with specific improvement recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Face-Off Mastery</h3>
                <p className="text-muted-foreground">
                  Detailed analysis of face-off techniques, timing, grip positioning, and win probability based on form.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Transition Intelligence</h3>
                <p className="text-muted-foreground">
                  Track transition speed, player positioning, and identify optimal fast-break opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Real-Time Coaching</h3>
                <p className="text-muted-foreground">
                  Instant analysis during games and practices with actionable insights delivered to your device.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Performance Metrics</h3>
                <p className="text-muted-foreground">
                  Comprehensive statistics and trends to track team and individual player development over time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Save Hours Weekly</h3>
                <p className="text-muted-foreground">
                  Reduce manual video analysis from 15+ hours to minutes, giving you more time for actual coaching.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
            Ready to Transform Your Coaching?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join coaches who are already saving hours and improving their team's performance with AI-powered analysis.
          </p>
          <Button size="lg" onClick={handleLogin} className="bg-primary hover:bg-primary/90">
            Start Your Free Analysis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            © 2025 LacrosseLens. Built with Gemini Pro 2.5 for lacrosse coaches worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
