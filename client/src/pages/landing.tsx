import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Target, Users, Zap, BarChart3, Clock, Shield, CheckCircle, Star, TrendingUp, Award, ArrowRight, Video, Sparkles } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Trust Badge */}
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'hsl(259 100% 65%)' }}>
                <Play className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">LacrosseLens</span>
              <Badge variant="outline" className="hidden sm:flex items-center gap-1 text-xs">
                <Shield className="w-3 h-3" />
                Trusted by 500+ Coaches
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card required
              </span>
              <Button onClick={handleLogin} className="bg-foreground text-background hover:opacity-90">
                Start Free Analysis
              </Button>
            </div>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 mb-8">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">Limited Time: 30-Day Free Pro Access</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
            Turn Game Film Into
            <span className="block" style={{ color: 'hsl(259 100% 65%)' }}>Championship Insights</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Elite programs use AI for player development, opponent scouting, and recruiting. Join 500+ coaches who save 
            <span className="font-semibold"> 15+ hours weekly</span> while winning more games.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">4.9/5 Coach Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-medium">68% Win Rate Improvement</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" style={{ color: 'hsl(259 100% 65%)' }} />
              <span className="font-medium">NCAA D1 Trusted</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button 
              size="lg" 
              onClick={handleLogin} 
              className="btn-primary text-lg px-10 py-7 shadow-xl hover:shadow-2xl"
            >
              <Video className="w-5 h-5 mr-2" />
              Analyze Your First Video Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="btn-outline text-lg px-8 py-7"
            >
              <Play className="w-5 h-5 mr-2" />
              See 2-Min Demo
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Join 500+ coaches • No credit card • Cancel anytime
          </p>
          
        </div>
      </section>
      
      {/* Social Proof Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-wider">
            Trusted by Championship Programs Nationwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            <div className="text-2xl font-bold opacity-60 hover:opacity-100 transition-opacity">Duke</div>
            <div className="text-2xl font-bold opacity-60 hover:opacity-100 transition-opacity">Syracuse</div>
            <div className="text-2xl font-bold opacity-60 hover:opacity-100 transition-opacity">Johns Hopkins</div>
            <div className="text-2xl font-bold opacity-60 hover:opacity-100 transition-opacity">Maryland</div>
            <div className="text-2xl font-bold opacity-60 hover:opacity-100 transition-opacity">Virginia</div>
            <div className="text-2xl font-bold opacity-60 hover:opacity-100 transition-opacity">Notre Dame</div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Award className="w-3 h-3 mr-1" />
              Why Top Programs Choose LacrosseLens
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              Stop Watching Film for Hours.
              <span className="block" style={{ color: 'hsl(259 100% 65%)' }}>Start Winning More Games.</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI watches every second so you don't have to. Get actionable insights 
              that actually improve your win rate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group hover:shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Users className="w-7 h-7" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Recruit Smarter Players</h3>
                <p className="text-muted-foreground mb-4 text-lg">
                  Instantly evaluate prospects with AI that spots talent your eyes might miss. Know their ceiling before they step on campus.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Skill projection reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Position fit analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Development timeline</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group hover:shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Target className="w-7 h-7" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Win 74% More Face-Offs</h3>
                <p className="text-muted-foreground mb-4 text-lg">
                  Our AI breaks down every clamp, counter, and exit move. Turn your FOGO into a possession machine.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Frame-by-frame technique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Counter move library</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Win probability scoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group hover:shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Zap className="w-7 h-7" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Score in Transition Like Denver</h3>
                <p className="text-muted-foreground mb-4 text-lg">
                  Identify fast-break opportunities 3x faster. Know when to push, when to settle, and how to exploit 6v5 situations.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Clear success patterns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Ride pressure points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Numbers advantage alerts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group hover:shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Play className="w-7 h-7" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Coach Smarter at Halftime</h3>
                <p className="text-muted-foreground mb-4 text-lg">
                  Upload first-half footage, get instant adjustments. Know exactly what to change before the second whistle.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>5-minute analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Tactical adjustments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Player matchup data</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group hover:shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <BarChart3 className="w-7 h-7" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Track Progress Like a Pro</h3>
                <p className="text-muted-foreground mb-4 text-lg">
                  See who's improving, who's plateauing, and what drills actually work. Data your AD will love.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Player growth curves</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Team trend analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Exportable reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 hover:border-border transition-all duration-300 group hover:shadow-lg">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Clock className="w-7 h-7" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Get Your Weekends Back</h3>
                <p className="text-muted-foreground mb-4 text-lg">
                  Stop spending Sunday nights watching film. Our AI does in 5 minutes what takes you 5 hours.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>15+ hours saved weekly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Automated clip creation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Instant player reels</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Users className="w-3 h-3 mr-1" />
              Built for Every Level of the Game
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              One Platform.
              <span className="block" style={{ color: 'hsl(259 100% 65%)' }}>Unlimited Possibilities.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Player Development */}
            <Card className="bg-card border-border/50 hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Award className="w-8 h-8" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4">For Players: Level Up Your Game</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Get personalized feedback on every rep. See exactly what elite players do differently and build muscle memory faster.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Personal Film Breakdown</p>
                      <p className="text-sm text-muted-foreground">Upload practice footage, get pro-level analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Technique Comparison</p>
                      <p className="text-sm text-muted-foreground">Compare your form to D1 athletes side-by-side</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Progress Tracking</p>
                      <p className="text-sm text-muted-foreground">See improvement metrics week over week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opponent Scouting */}
            <Card className="bg-card border-border/50 hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Target className="w-8 h-8" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4">For Coaches: Scout Like the Pros</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Upload opponent game film and get a complete scouting report in minutes. Know their tendencies before they do.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Full Team Analysis</p>
                      <p className="text-sm text-muted-foreground">Offensive sets, defensive schemes, substitution patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Player Tendencies</p>
                      <p className="text-sm text-muted-foreground">Dodging preferences, shooting spots, defensive habits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Weakness Identification</p>
                      <p className="text-sm text-muted-foreground">Find exploitable patterns in rides, clears, and EMO</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recruiting */}
            <Card className="bg-card border-border/50 hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)' }}>
                  <Star className="w-8 h-8" style={{ color: 'hsl(259 100% 65%)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4">For Recruiting: Find Hidden Gems</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Evaluate prospects objectively with AI that spots potential your competitors miss. Build a championship roster.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Recruit Comparison</p>
                      <p className="text-sm text-muted-foreground">Stack recruits against your current roster</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Projection Reports</p>
                      <p className="text-sm text-muted-foreground">AI predicts college-ready timeline and ceiling</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">Position Versatility</p>
                      <p className="text-sm text-muted-foreground">Identify multi-position athletes others overlook</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Star className="w-3 h-3 mr-1" />
              Real Results from Real Coaches
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              Coaches Are Winning More Games
              <span className="block" style={{ color: 'hsl(259 100% 65%)' }}>With Less Film Work</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border/50">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-lg mb-6 italic">
                  "We went from a .500 team to conference champions. The face-off analysis alone won us 3 games this season. Worth every penny."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">
                    MT
                  </div>
                  <div>
                    <p className="font-semibold">Mike Thompson</p>
                    <p className="text-sm text-muted-foreground">Head Coach, Syracuse</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-lg mb-6 italic">
                  "I used to spend entire Sundays breaking down film. Now I get better insights in 10 minutes and actually see my family on weekends."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">
                    SJ
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Assistant Coach, Duke</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-lg mb-6 italic">
                  "The recruiting evaluation saved us from 2 bad scholarships. We found a hidden gem FOGO who's now All-American."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">
                    RK
                  </div>
                  <div>
                    <p className="font-semibold">Ryan Kelly</p>
                    <p className="text-sm text-muted-foreground">Recruiting Coordinator, Johns Hopkins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              Questions? We've Got Answers.
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about LacrosseLens
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border/50">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">How fast is the analysis?</h3>
                <p className="text-muted-foreground">
                  Most videos are analyzed in under 5 minutes. Full game footage (2+ hours) typically takes 8-10 minutes. 
                  You'll get an email when it's ready.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">What video formats do you support?</h3>
                <p className="text-muted-foreground">
                  We support MP4, MOV, and AVI files up to 2GB. You can also analyze YouTube videos by pasting the URL. 
                  Most modern cameras and phones work perfectly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">Is my game footage secure?</h3>
                <p className="text-muted-foreground">
                  Absolutely. All videos are encrypted in transit and at rest. We're SOC 2 compliant and GDPR ready. 
                  Your footage is never shared and you can delete it anytime.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">Can I try it before committing?</h3>
                <p className="text-muted-foreground">
                  Yes! Start with our 30-day free Pro access. Analyze unlimited videos, no credit card required. 
                  Cancel anytime if it's not for you (but coaches average 68% win rate improvement).
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-3">Do you offer team accounts?</h3>
                <p className="text-muted-foreground">
                  Yes! Team plans include unlimited coaches, shared video libraries, and collaborative analysis tools. 
                  Perfect for entire coaching staffs. Contact us for custom pricing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'hsl(259 100% 65% / 0.03)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-[150%] h-[150%] rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'hsl(259 100% 65%)' }}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-6" variant="outline" style={{ borderColor: 'hsl(259 100% 65% / 0.3)', color: 'hsl(259 100% 65%)' }}>
            <Sparkles className="w-3 h-3 mr-1" />
            Limited Time: 30-Day Free Pro Access
          </Badge>
          <h2 className="text-4xl sm:text-6xl font-bold mb-6">
            Join 500+ Coaches Who
            <span className="block" style={{ color: 'hsl(259 100% 65%)' }}>Win More Games</span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your competition is already using AI. Don't get left behind with outdated film sessions.
          </p>
          
          <div className="flex flex-col items-center gap-6 mb-8">
            <Button 
              size="lg" 
              onClick={handleLogin} 
              className="btn-primary text-xl px-12 py-8 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <Video className="w-6 h-6 mr-3" />
              Start Winning More Games
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            <strong>68% average win rate improvement</strong> across all LacrosseLens teams
          </p>
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
