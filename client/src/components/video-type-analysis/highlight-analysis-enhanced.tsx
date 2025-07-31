import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PersonalHighlightEvaluations from "@/components/personal-highlight-evaluations";
import { 
  Trophy, 
  Star, 
  User, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  Target,
  Zap,
  Award,
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Eye,
  Shield,
  Crosshair,
  PlayCircle,
  Timer,
  Flame,
  Gem,
  Crown,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from "lucide-react";

// ExpandableText Component
interface ExpandableTextProps {
  content: string;
  index: number;
  expandedSet: Set<number>;
  setExpandedSet: (set: Set<number>) => void;
  truncateLength: number;
  className?: string;
}

function ExpandableText({ content, index, expandedSet, setExpandedSet, truncateLength, className }: ExpandableTextProps) {
  const isExpanded = expandedSet.has(index);
  const shouldTruncate = content.length > truncateLength;
  
  const toggleExpansion = () => {
    const newSet = new Set(expandedSet);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedSet(newSet);
  };

  if (!shouldTruncate) {
    return <p className={className}>{content}</p>;
  }

  return (
    <div className="space-y-2">
      <p className={className}>
        {isExpanded ? content : `${content.substring(0, truncateLength)}...`}
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleExpansion}
        className="h-auto p-0 text-xs font-medium hover:no-underline flex items-center gap-1"
      >
        {isExpanded ? (
          <>
            Show less <ChevronUp className="w-3 h-3" />
          </>
        ) : (
          <>
            Show more <ChevronDown className="w-3 h-3" />
          </>
        )}
      </Button>
    </div>
  );
}

interface HighlightAnalysisEnhancedProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function HighlightAnalysisEnhanced({ video, analyses, formatTimestamp }: HighlightAnalysisEnhancedProps) {
  // State for expandable sections
  const [expandedShootingItems, setExpandedShootingItems] = useState<Set<number>>(new Set());
  const [expandedDodgingItems, setExpandedDodgingItems] = useState<Set<number>>(new Set());
  const [expandedPassingItems, setExpandedPassingItems] = useState<Set<number>>(new Set());
  const [expandedStrengths, setExpandedStrengths] = useState<Set<number>>(new Set());
  const [expandedWeaknesses, setExpandedWeaknesses] = useState<Set<number>>(new Set());

  // Helper function for toggling expansion
  const toggleExpansion = (itemIndex: number, expandedSet: Set<number>, setExpandedSet: (set: Set<number>) => void) => {
    const newSet = new Set(expandedSet);
    if (newSet.has(itemIndex)) {
      newSet.delete(itemIndex);
    } else {
      newSet.add(itemIndex);
    }
    setExpandedSet(newSet);
  };

  // Expandable text component
  const ExpandableText = ({ 
    content, 
    index, 
    expandedSet, 
    setExpandedSet, 
    truncateLength = 150,
    className = ""
  }: {
    content: string;
    index: number;
    expandedSet: Set<number>;
    setExpandedSet: (set: Set<number>) => void;
    truncateLength?: number;
    className?: string;
  }) => {
    const isExpanded = expandedSet.has(index);
    const shouldTruncate = content.length > truncateLength;
    const displayContent = isExpanded || !shouldTruncate 
      ? content 
      : `${content.substring(0, truncateLength)}...`;

    return (
      <div className={className}>
        <p className="leading-relaxed">{displayContent}</p>
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleExpansion(index, expandedSet, setExpandedSet)}
            className="mt-2 p-0 h-auto text-xs hover:bg-transparent"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show more
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];
  const transitions = analyses?.filter(a => a.type === 'transition') || [];
  const faceoffs = analyses?.filter(a => a.type === 'face_off') || [];

  // Extract player name from video title (e.g., "Dylan's 2024 Highlights" -> "Dylan")
  const playerName = video.title?.split(/['s\s]/)[0] || "Player";
  
  const totalHighlights = playerEvaluations.length + keyMoments.length;
  const avgConfidence = playerEvaluations.length > 0 
    ? Math.round(playerEvaluations.reduce((sum: number, e: any) => sum + e.confidence, 0) / playerEvaluations.length)
    : 0;

  // Enhanced data extraction from analyses
  const extractGoals = () => {
    const goalKeywords = ['goal', 'scores', 'finds the back', 'buries', 'nets', 'finishes'];
    return analyses.filter(a => 
      goalKeywords.some(keyword => a.content.toLowerCase().includes(keyword))
    ).length;
  };

  const extractAssists = () => {
    const assistKeywords = ['assist', 'feeds', 'dishes', 'finds', 'beautiful pass', 'sets up'];
    return analyses.filter(a => 
      assistKeywords.some(keyword => a.content.toLowerCase().includes(keyword))
    ).length;
  };

  const extractSaves = () => {
    const saveKeywords = ['save', 'stops', 'denies', 'blocks', 'kick save', 'stick save'];
    return analyses.filter(a => 
      saveKeywords.some(keyword => a.content.toLowerCase().includes(keyword))
    ).length;
  };

  const extractDodges = () => {
    const dodgeKeywords = ['dodge', 'split dodge', 'roll dodge', 'face dodge', 'beats his man'];
    return analyses.filter(a => 
      dodgeKeywords.some(keyword => a.content.toLowerCase().includes(keyword))
    ).length;
  };

  const extractChecks = () => {
    const checkKeywords = ['check', 'poke check', 'slap check', 'stick lift', 'strips', 'caused turnover'];
    return analyses.filter(a => 
      checkKeywords.some(keyword => a.content.toLowerCase().includes(keyword))
    ).length;
  };

  const extractGroundBalls = () => {
    const gbKeywords = ['ground ball', 'scoops', 'picks up', 'collects', 'controls'];
    return analyses.filter(a => 
      gbKeywords.some(keyword => a.content.toLowerCase().includes(keyword))
    ).length;
  };

  // Extract performance ratings from analysis content
  const extractRatings = () => {
    const ratings = analyses.map(a => {
      const ratingMatch = a.content.match(/(\d+)\/10/);
      return ratingMatch ? parseInt(ratingMatch[1]) : null;
    }).filter(r => r !== null);
    
    return {
      average: ratings.length > 0 ? Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length * 10) / 10 : 0,
      high: ratings.length > 0 ? Math.max(...ratings) : 0,
      low: ratings.length > 0 ? Math.min(...ratings) : 0,
      total: ratings.length
    };
  };

  // Extract skill mentions and frequency
  const extractSkillMentions = () => {
    const skills = {
      shooting: ['shot', 'shooting', 'accuracy', 'placement', 'velocity'],
      dodging: ['dodge', 'split', 'roll', 'face dodge', 'change of pace'],
      passing: ['pass', 'feed', 'vision', 'accuracy', 'timing'],
      defense: ['defense', 'check', 'pressure', 'slide', 'positioning'],
      faceoffs: ['faceoff', 'clamp', 'rake', 'wing', 'possession'],
      stick_skills: ['stick skills', 'handling', 'protection', 'cradling'],
      field_vision: ['vision', 'awareness', 'reads', 'anticipation', 'iq'],
      athleticism: ['speed', 'agility', 'strength', 'explosive', 'athletic']
    };

    const skillCounts: { [key: string]: number } = {};
    
    Object.entries(skills).forEach(([skill, keywords]) => {
      skillCounts[skill] = analyses.reduce((count, a) => {
        return count + keywords.reduce((keywordCount, keyword) => {
          return keywordCount + (a.content.toLowerCase().split(keyword).length - 1);
        }, 0);
      }, 0);
    });

    return skillCounts;
  };

  // Extract recruiting level mentions
  const extractRecruitingLevel = () => {
    const content = analyses.map(a => a.content).join(' ').toLowerCase();
    if (content.includes('d1') || content.includes('division 1') || content.includes('elite')) return 'D1';
    if (content.includes('d2') || content.includes('division 2')) return 'D2';
    if (content.includes('d3') || content.includes('division 3')) return 'D3';
    return 'Evaluation Needed';
  };

  // Extract strengths and weaknesses
  const extractStrengthsWeaknesses = () => {
    const strengths = analyses.filter(a => 
      a.content.toLowerCase().includes('excellent') ||
      a.content.toLowerCase().includes('outstanding') ||
      a.content.toLowerCase().includes('strong') ||
      a.content.toLowerCase().includes('good') ||
      a.content.toLowerCase().includes('effective')
    ).map(a => a.content);

    const weaknesses = analyses.filter(a => 
      a.content.toLowerCase().includes('improve') ||
      a.content.toLowerCase().includes('weakness') ||
      a.content.toLowerCase().includes('struggle') ||
      a.content.toLowerCase().includes('poor') ||
      a.content.toLowerCase().includes('needs work')
    ).map(a => a.content);

    return { strengths: strengths.slice(0, 5), weaknesses: weaknesses.slice(0, 5) };
  };

  // Use actual data from analyses
  const goals = keyMoments.filter(k => 
    k.content.toLowerCase().includes('goal') || 
    k.title.toLowerCase().includes('goal')
  ).length;
  
  const assists = keyMoments.filter(k => 
    k.content.toLowerCase().includes('assist') || 
    k.title.toLowerCase().includes('assist')
  ).length;
  
  const saves = analyses.filter(a => 
    a.content.toLowerCase().includes('save') && 
    (a.type === 'key_moment' || a.type === 'player_evaluation')
  ).length;
  
  // Use metadata if available, otherwise count mentions
  const dodges = analyses.reduce((count, a) => {
    if (a.metadata?.dodges) return count + a.metadata.dodges;
    return count + (a.content.toLowerCase().includes('dodge') ? 1 : 0);
  }, 0);
  
  const checks = analyses.reduce((count, a) => {
    if (a.metadata?.checks) return count + a.metadata.checks;
    return count + (a.content.toLowerCase().includes('check') ? 1 : 0);
  }, 0);
  
  const groundBalls = analyses.reduce((count, a) => {
    if (a.metadata?.groundBalls) return count + a.metadata.groundBalls;
    return count + (a.content.toLowerCase().includes('ground ball') ? 1 : 0);
  }, 0);
  
  const ratings = extractRatings();
  const skillMentions = extractSkillMentions();
  const recruitingLevel = extractRecruitingLevel();
  const { strengths, weaknesses } = extractStrengthsWeaknesses();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile-Optimized Header Section */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl flex items-center gap-2 flex-wrap">
                  <span className="truncate">{playerName}'s Elite Highlights</span>
                  <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                </CardTitle>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-1">
                  <span className="hidden sm:inline">Comprehensive Performance Analysis & </span>Recruiting Evaluation
                </p>
              </div>
            </div>
            <div className="self-start sm:self-auto">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1 sm:py-2">
                {recruitingLevel} Potential
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">{totalHighlights}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Clips</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">{avgConfidence}%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Avg Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-700 dark:text-orange-300">{keyMoments.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Elite Moments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Optimized Performance Statistics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-3 sm:p-4 text-center">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">{goals}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Goals Scored</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 sm:p-4 text-center">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200">{assists}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Assists/Feeds</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-3 sm:p-4 text-center">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-orange-800 dark:text-orange-200">{saves}</p>
            <p className="text-xs text-orange-600 dark:text-orange-400">Saves Made</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-3 sm:p-4 text-center">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-200">{dodges}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">Successful Dodges</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-Optimized Skill Analysis Breakdown */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900 border-b px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <CardTitle className="text-lg sm:text-xl">Detailed Skill Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            {Object.entries(skillMentions).map(([skill, count]) => {
              const maxCount = Math.max(...Object.values(skillMentions));
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={skill} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                      {skill.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      {count} mentions
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {percentage >= 80 ? 'Elite' : 
                       percentage >= 60 ? 'Strong' : 
                       percentage >= 40 ? 'Developing' : 
                       percentage >= 20 ? 'Needs Work' : 'Limited Data'}
                    </span>
                    <span>{Math.round(percentage)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Player Performance Breakdown */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-b">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-600" />
            <CardTitle>Comprehensive Player Performance Analysis</CardTitle>
            <Badge variant="outline">{playerEvaluations.length} detailed evaluations</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Enhanced Player Analysis Grid */}
          <div className="space-y-6">
            {/* Visual Skills Performance Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                        <Target className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-bold text-lg text-green-800 dark:text-green-200">Shooting</h4>
                    </div>
                    {(() => {
                      const shootingAnalyses = playerEvaluations.filter(analysis => 
                        analysis.content.toLowerCase().includes('shot') || 
                        analysis.content.toLowerCase().includes('shooting') ||
                        analysis.content.toLowerCase().includes('scores') ||
                        analysis.content.toLowerCase().includes('goal')
                      );
                      const avgScore = shootingAnalyses.length > 0 
                        ? Math.round(shootingAnalyses.reduce((sum: number, a: any) => sum + a.confidence, 0) / shootingAnalyses.length)
                        : 0;
                      return (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{avgScore}%</div>
                          <div className="text-xs text-green-500">Performance</div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="mb-4">
                    <Progress 
                      value={(() => {
                        const shootingAnalyses = playerEvaluations.filter(analysis => 
                          analysis.content.toLowerCase().includes('shot') || 
                          analysis.content.toLowerCase().includes('shooting') ||
                          analysis.content.toLowerCase().includes('scores') ||
                          analysis.content.toLowerCase().includes('goal')
                        );
                        return shootingAnalyses.length > 0 
                          ? Math.round(shootingAnalyses.reduce((sum: number, a: any) => sum + a.confidence, 0) / shootingAnalyses.length)
                          : 0;
                      })()} 
                      className="h-3 bg-green-100 dark:bg-green-900/30"
                    />
                  </div>
                  {/* Key Statistics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {(() => {
                      const shootingAnalyses = playerEvaluations.filter(analysis => 
                        analysis.content.toLowerCase().includes('shot') || 
                        analysis.content.toLowerCase().includes('shooting') ||
                        analysis.content.toLowerCase().includes('scores') ||
                        analysis.content.toLowerCase().includes('goal')
                      );
                      return (
                        <>
                          <div className="text-center p-3 bg-white/50 dark:bg-green-950/30 rounded-lg">
                            <div className="text-xl font-bold text-green-600">{shootingAnalyses.length}</div>
                            <div className="text-xs text-green-500">Clips</div>
                          </div>
                          <div className="text-center p-3 bg-white/50 dark:bg-green-950/30 rounded-lg">
                            <div className="text-xl font-bold text-green-600">
                              {shootingAnalyses.length > 0 ? Math.round(shootingAnalyses.reduce((sum: number, a: any) => sum + a.confidence, 0) / shootingAnalyses.length) : 0}%
                            </div>
                            <div className="text-xs text-green-500">Avg Score</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Compact Analysis Preview */}
                  <div className="space-y-2">
                    {(() => {
                      const shootingAnalyses = playerEvaluations.filter(analysis => 
                        analysis.content.toLowerCase().includes('shot') || 
                        analysis.content.toLowerCase().includes('shooting') ||
                        analysis.content.toLowerCase().includes('scores') ||
                        analysis.content.toLowerCase().includes('goal')
                      );
                      
                      if (shootingAnalyses.length === 0) {
                        return (
                          <div className="text-center py-4 text-muted-foreground">
                            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No shooting analysis available</p>
                          </div>
                        );
                      }
                      
                      return shootingAnalyses.slice(0, 2).map((analysis, idx) => (
                        <div key={idx} className="p-3 bg-white/60 dark:bg-green-950/40 rounded-lg border border-green-200/50 dark:border-green-800/50 hover:bg-white/80 dark:hover:bg-green-950/60 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {formatTimestamp(analysis.timestamp)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">{analysis.confidence}%</span>
                            </div>
                          </div>
                          <ExpandableText
                            content={analysis.content}
                            index={idx}
                            expandedSet={expandedShootingItems}
                            setExpandedSet={setExpandedShootingItems}
                            truncateLength={80}
                            className="text-sm text-green-800 dark:text-green-200"
                          />
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                        <Activity className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-bold text-lg text-purple-800 dark:text-purple-200">Dodging</h4>
                    </div>
                    {(() => {
                      const dodgingAnalyses = playerEvaluations.filter(analysis => 
                        analysis.content.toLowerCase().includes('dodge') || 
                        analysis.content.toLowerCase().includes('split') ||
                        analysis.content.toLowerCase().includes('roll') ||
                        analysis.content.toLowerCase().includes('change of pace') ||
                        analysis.content.toLowerCase().includes('beats his man')
                      );
                      const avgScore = dodgingAnalyses.length > 0 
                        ? Math.round(dodgingAnalyses.reduce((sum: number, a: any) => sum + a.confidence, 0) / dodgingAnalyses.length)
                        : 0;
                      return (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">{avgScore}%</div>
                          <div className="text-xs text-purple-500">Performance</div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="mb-4">
                    <Progress 
                      value={(() => {
                        const dodgingAnalyses = playerEvaluations.filter(analysis => 
                          analysis.content.toLowerCase().includes('dodge') || 
                          analysis.content.toLowerCase().includes('split') ||
                          analysis.content.toLowerCase().includes('roll') ||
                          analysis.content.toLowerCase().includes('change of pace') ||
                          analysis.content.toLowerCase().includes('beats his man')
                        );
                        return dodgingAnalyses.length > 0 
                          ? Math.round(dodgingAnalyses.reduce((sum: number, a: any) => sum + a.confidence, 0) / dodgingAnalyses.length)
                          : 0;
                      })()} 
                      className="h-3 bg-purple-100 dark:bg-purple-900/30"
                    />
                  </div>
                  
                  {/* Key Statistics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {(() => {
                      const dodgingAnalyses = playerEvaluations.filter(analysis => 
                        analysis.content.toLowerCase().includes('dodge') || 
                        analysis.content.toLowerCase().includes('split') ||
                        analysis.content.toLowerCase().includes('roll') ||
                        analysis.content.toLowerCase().includes('change of pace') ||
                        analysis.content.toLowerCase().includes('beats his man')
                      );
                      return (
                        <>
                          <div className="text-center p-3 bg-white/50 dark:bg-purple-950/30 rounded-lg">
                            <div className="text-xl font-bold text-purple-600">{dodgingAnalyses.length}</div>
                            <div className="text-xs text-purple-500">Clips</div>
                          </div>
                          <div className="text-center p-3 bg-white/50 dark:bg-purple-950/30 rounded-lg">
                            <div className="text-xl font-bold text-purple-600">
                              {dodgingAnalyses.length > 0 ? Math.round(dodgingAnalyses.reduce((sum: number, a: any) => sum + a.confidence, 0) / dodgingAnalyses.length) : 0}%
                            </div>
                            <div className="text-xs text-purple-500">Avg Score</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {/* Compact Analysis Preview */}
                  <div className="space-y-2">
                    {(() => {
                      const dodgingAnalyses = playerEvaluations.filter(analysis => 
                        analysis.content.toLowerCase().includes('dodge') || 
                        analysis.content.toLowerCase().includes('split') ||
                        analysis.content.toLowerCase().includes('roll') ||
                        analysis.content.toLowerCase().includes('change of pace') ||
                        analysis.content.toLowerCase().includes('beats his man')
                      );
                      
                      if (dodgingAnalyses.length === 0) {
                        return (
                          <div className="text-center py-4 text-muted-foreground">
                            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No dodging analysis available</p>
                          </div>
                        );
                      }
                      
                      return dodgingAnalyses.slice(0, 2).map((analysis, idx) => (
                        <div key={idx} className="p-3 bg-white/60 dark:bg-purple-950/40 rounded-lg border border-purple-200/50 dark:border-purple-800/50 hover:bg-white/80 dark:hover:bg-purple-950/60 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                              {formatTimestamp(analysis.timestamp)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-purple-500" />
                              <span className="text-xs text-purple-600 font-medium">{analysis.confidence}%</span>
                            </div>
                          </div>
                          <ExpandableText
                            content={analysis.content}
                            index={idx}
                            expandedSet={expandedDodgingItems}
                            setExpandedSet={setExpandedDodgingItems}
                            truncateLength={80}
                            className="text-sm text-purple-800 dark:text-purple-200"
                          />
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-bold text-lg text-blue-800 dark:text-blue-200">Passing</h4>
                    </div>
                    {(() => {
                      const passingAnalyses = playerEvaluations.filter(analysis => 
                        analysis.content.toLowerCase().includes('pass') || 
                        analysis.content.toLowerCase().includes('feed') ||
                        analysis.content.toLowerCase().includes('assist') ||
                        analysis.content.toLowerCase().includes('vision') ||
                        analysis.content.toLowerCase().includes('finds')
                      );
                      const avgScore = passingAnalyses.length > 0 
                        ? Math.round(passingAnalyses.reduce((sum: number, a: any) => sum + a.confidence, 0) / passingAnalyses.length)
                        : 0;
                      return (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{avgScore}%</div>
                          <div className="text-xs text-blue-500">Performance</div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="mb-4">
                    <Progress 
                      value={(() => {
                        const passingAnalyses = playerEvaluations.filter(analysis => 
                          analysis.content.toLowerCase().includes('pass') || 
                          analysis.content.toLowerCase().includes('feed') ||
                          analysis.content.toLowerCase().includes('assist') ||
                          analysis.content.toLowerCase().includes('vision') ||
                          analysis.content.toLowerCase().includes('finds')
                        );
                        return passingAnalyses.length > 0 
                          ? Math.round(passingAnalyses.reduce((sum: number, a: any) => sum + a.confidence, 0) / passingAnalyses.length)
                          : 0;
                      })()} 
                      className="h-3 bg-blue-100 dark:bg-blue-900/30"
                    />
                  </div>
                  
                  {/* Key Statistics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {(() => {
                      const passingAnalyses = playerEvaluations.filter(analysis => 
                        analysis.content.toLowerCase().includes('pass') || 
                        analysis.content.toLowerCase().includes('feed') ||
                        analysis.content.toLowerCase().includes('assist') ||
                        analysis.content.toLowerCase().includes('vision') ||
                        analysis.content.toLowerCase().includes('finds')
                      );
                      return (
                        <>
                          <div className="text-center p-3 bg-white/50 dark:bg-blue-950/30 rounded-lg">
                            <div className="text-xl font-bold text-blue-600">{passingAnalyses.length}</div>
                            <div className="text-xs text-blue-500">Clips</div>
                          </div>
                          <div className="text-center p-3 bg-white/50 dark:bg-blue-950/30 rounded-lg">
                            <div className="text-xl font-bold text-blue-600">
                              {passingAnalyses.length > 0 ? Math.round(passingAnalyses.reduce((sum: number, a: any) => sum + a.confidence, 0) / passingAnalyses.length) : 0}%
                            </div>
                            <div className="text-xs text-blue-500">Avg Score</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Compact Analysis Preview */}
                  <div className="space-y-2">
                    {(() => {
                      const passingAnalyses = playerEvaluations.filter(analysis => 
                        analysis.content.toLowerCase().includes('pass') || 
                        analysis.content.toLowerCase().includes('feed') ||
                        analysis.content.toLowerCase().includes('assist') ||
                        analysis.content.toLowerCase().includes('vision') ||
                        analysis.content.toLowerCase().includes('finds')
                      );
                      
                      if (passingAnalyses.length === 0) {
                        return (
                          <div className="text-center py-4 text-muted-foreground">
                            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No passing analysis available</p>
                          </div>
                        );
                      }
                      
                      return passingAnalyses.slice(0, 2).map((analysis, idx) => (
                        <div key={idx} className="p-3 bg-white/60 dark:bg-blue-950/40 rounded-lg border border-blue-200/50 dark:border-blue-800/50 hover:bg-white/80 dark:hover:bg-blue-950/60 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              {formatTimestamp(analysis.timestamp)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">{analysis.confidence}%</span>
                            </div>
                          </div>
                          <ExpandableText
                            content={analysis.content}
                            index={idx}
                            expandedSet={expandedPassingItems}
                            setExpandedSet={setExpandedPassingItems}
                            truncateLength={80}
                            className="text-sm text-blue-800 dark:text-blue-200"
                          />
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Complete Clip-by-Clip Analysis */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-slate-600" />
                    <CardTitle className="text-lg">Complete Clip-by-Clip Breakdown</CardTitle>
                  </div>
                  <Badge className="bg-slate-600 text-white">
                    {playerEvaluations.length} clips analyzed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <PersonalHighlightEvaluations
                  evaluations={playerEvaluations}
                  formatTimestamp={formatTimestamp as (timestamp: number) => string}
                  playerName={playerName}
                />
              </CardContent>
            </Card>

            {/* Visual Performance Insights Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths Visualization */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <CardTitle className="text-xl text-green-800 dark:text-green-200">Elite Strengths</CardTitle>
                    </div>
                    <Badge className="bg-green-600 text-white px-3 py-1">
                      {strengths.length} identified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const strengthsMap = new Map<string, number>();
                    const strengthKeywords = ['excellent', 'outstanding', 'strong', 'good', 'effective', 'solid'];
                    
                    playerEvaluations.forEach(analysis => {
                      strengthKeywords.forEach(keyword => {
                        if (analysis.content.toLowerCase().includes(keyword)) {
                          strengthsMap.set(keyword, (strengthsMap.get(keyword) || 0) + 1);
                        }
                      });
                    });
                    
                    const strengthEntries = Array.from(strengthsMap.entries())
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 4);
                    
                    return strengthEntries.map(([strength, count], index) => {
                      const maxCount = Math.max(...Array.from(strengthsMap.values()));
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      
                      return (
                        <div key={strength} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="font-medium capitalize text-green-800 dark:text-green-200">
                                {strength} performance
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">{count}</div>
                              <div className="text-xs text-green-500">mentions</div>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2 bg-green-100 dark:bg-green-900/30" />
                        </div>
                      );
                    });
                  })()}
                </CardContent>
              </Card>

              {/* Development Areas Visualization */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                        <Target className="w-6 h-6 text-orange-600" />
                      </div>
                      <CardTitle className="text-xl text-orange-800 dark:text-orange-200">Growth Areas</CardTitle>
                    </div>
                    <Badge className="bg-orange-600 text-white px-3 py-1">
                      {weaknesses.length} identified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const weaknessMap = new Map<string, number>();
                    const weaknessKeywords = ['improve', 'struggle', 'weak', 'needs work', 'poor', 'inconsistent'];
                    
                    playerEvaluations.forEach(analysis => {
                      weaknessKeywords.forEach(keyword => {
                        if (analysis.content.toLowerCase().includes(keyword)) {
                          weaknessMap.set(keyword, (weaknessMap.get(keyword) || 0) + 1);
                        }
                      });
                    });
                    
                    const weaknessEntries = Array.from(weaknessMap.entries())
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 4);
                    
                    return weaknessEntries.map(([weakness, count], index) => {
                      const maxCount = Math.max(...Array.from(weaknessMap.values()));
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      
                      return (
                        <div key={weakness} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                              <span className="font-medium capitalize text-orange-800 dark:text-orange-200">
                                {weakness === 'needs work' ? 'Needs Development' : `${weakness} areas`}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-orange-600">{count}</div>
                              <div className="text-xs text-orange-500">mentions</div>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2 bg-orange-100 dark:bg-orange-900/30" />
                        </div>
                      );
                    });
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Elite Moments Timeline */}
      {keyMoments.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Elite Moments & Game-Changing Plays</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {keyMoments.map((moment: any, index: number) => {
                const ratingMatch = moment.content.match(/(\d+)\/10/);
                const rating = ratingMatch ? parseInt(ratingMatch[1]) : null;
                
                return (
                  <div key={moment.id} className="relative pl-10 pb-6 last:pb-0">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xs text-white font-bold">{index + 1}</span>
                    </div>
                    {index < keyMoments.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-yellow-300 to-orange-300"></div>
                    )}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/10 dark:to-orange-950/10 rounded-xl p-5 border border-yellow-200 dark:border-yellow-800 shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimestamp(moment.timestamp) || 'N/A'}
                          </Badge>
                          {rating && (
                            <Badge className={`text-white ${
                              rating >= 9 ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                              rating >= 7 ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                              rating >= 5 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                              'bg-gradient-to-r from-red-600 to-pink-600'
                            }`}>
                              <Trophy className="w-3 h-3 mr-1" />
                              {rating}/10 Elite
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {moment.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {moment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Areas for Development */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <Card className="border-green-200 dark:border-green-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <CardTitle className="text-lg text-green-800 dark:text-green-200">Key Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {strengths.slice(0, 3).map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <ArrowUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <ExpandableText
                      content={strength}
                      index={index}
                      expandedSet={expandedStrengths}
                      setExpandedSet={setExpandedStrengths}
                      truncateLength={200}
                      className="text-sm text-green-800 dark:text-green-200"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Areas for Development */}
        {weaknesses.length > 0 && (
          <Card className="border-orange-200 dark:border-orange-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-b border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-lg text-orange-800 dark:text-orange-200">Development Areas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {weaknesses.slice(0, 3).map((weakness, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <ArrowDown className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <ExpandableText
                      content={weakness}
                      index={index}
                      expandedSet={expandedWeaknesses}
                      setExpandedSet={setExpandedWeaknesses}
                      truncateLength={200}
                      className="text-sm text-orange-800 dark:text-orange-200"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Overall Analysis Summary */}
      {overallAnalysis && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 border-b">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-slate-600" />
              <CardTitle className="text-xl">Coach's Overall Assessment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                {overallAnalysis.content}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                Recruiting Level: {recruitingLevel}
              </Badge>
              <Badge variant="outline">
                Overall Confidence: {overallAnalysis.confidence}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}