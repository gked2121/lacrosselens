import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import PersonalHighlightEvaluations from "@/components/personal-highlight-evaluations";
import { DetailedAnalysisView } from "@/components/detailed-analysis-view";
import { 
  Trophy,
  Users,
  BarChart3,
  Shield,
  Clock,
  TrendingUp,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info
} from "lucide-react";
import { useState } from "react";

interface GameAnalysisProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function GameAnalysis({ video, analyses, formatTimestamp }: GameAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState(new Set<string>());
  const [showConfidenceInfo, setShowConfidenceInfo] = useState(false);

  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const faceOffAnalyses = analyses?.filter(a => a.type === 'face_off') || [];
  const transitionAnalyses = analyses?.filter(a => a.type === 'transition') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Extract real game metrics from our data
  const gameMetrics = {
    totalPlayers: playerEvaluations.length,
    avgPlayerConfidence: playerEvaluations.length > 0 
      ? Math.round(playerEvaluations.reduce((sum, p) => sum + p.confidence, 0) / playerEvaluations.length)
      : 0,
    totalFaceoffs: faceOffAnalyses.length,
    faceoffWinRate: faceOffAnalyses.length > 0 
      ? Math.round((faceOffAnalyses.filter(f => 
          f.content.toLowerCase().includes('win') || 
          f.content.toLowerCase().includes('won') ||
          f.content.toLowerCase().includes('successful')
        ).length / faceOffAnalyses.length) * 100)
      : 0,
    totalTransitions: transitionAnalyses.length,
    transitionSuccessRate: transitionAnalyses.length > 0
      ? Math.round((transitionAnalyses.filter(t => 
          t.content.toLowerCase().includes('success') || 
          t.content.toLowerCase().includes('effective') ||
          t.content.toLowerCase().includes('clean')
        ).length / transitionAnalyses.length) * 100)
      : 0,
    eliteMoments: keyMoments.length,
    gameIntensity: keyMoments.length > 8 ? 'Elite' : keyMoments.length > 4 ? 'High' : keyMoments.length > 1 ? 'Medium' : 'Low',
    timeSpan: analyses.length > 0 ? {
      earliest: Math.min(...analyses.filter(a => a.timestamp).map(a => a.timestamp)),
      latest: Math.max(...analyses.filter(a => a.timestamp).map(a => a.timestamp))
    } : null
  };

  // Extract team data from player evaluations
  const teamData = playerEvaluations.reduce((acc, player) => {
    const isWhiteTeam = player.content.toLowerCase().includes('white') || 
                       player.content.toLowerCase().includes('light') ||
                       player.content.toLowerCase().includes('#1 ') ||
                       player.content.toLowerCase().includes('#2 ') ||
                       player.content.toLowerCase().includes('#3 ');
    const teamKey = isWhiteTeam ? 'white' : 'dark';
    
    if (!acc[teamKey]) acc[teamKey] = [];
    acc[teamKey].push(player);
    return acc;
  }, {} as Record<string, any[]>);

  // Extract goals and scoring from key moments
  const scoringData = keyMoments.filter(moment => 
    moment.content.toLowerCase().includes('goal') ||
    moment.content.toLowerCase().includes('score') ||
    moment.content.toLowerCase().includes('assist')
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const analysisSections = [
    {
      id: 'overall',
      title: 'Overall Analysis',
      icon: Trophy,
      count: overallAnalysis ? 1 : 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/5',
      borderColor: 'border-blue-500/10'
    },
    {
      id: 'players',
      title: 'Player Evaluations',
      icon: Users,
      count: playerEvaluations.length,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500/5',
      borderColor: 'border-indigo-500/10'
    },
    {
      id: 'faceoffs',
      title: 'Face-off Analysis',
      icon: Shield,
      count: faceOffAnalyses.length,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/5',
      borderColor: 'border-purple-500/10'
    },
    {
      id: 'transitions',
      title: 'Transition Analysis',
      icon: TrendingUp,
      count: transitionAnalyses.length,
      color: 'text-green-600',
      bgColor: 'bg-green-500/5',
      borderColor: 'border-green-500/10'
    },
    {
      id: 'moments',
      title: 'Key Moments',
      icon: Sparkles,
      count: keyMoments.length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/5',
      borderColor: 'border-orange-500/10'
    },
    {
      id: 'detailed',
      title: 'Detailed Metrics',
      icon: Activity,
      count: playerEvaluations.length > 0 ? 1 : 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/5',
      borderColor: 'border-purple-500/10'
    }
  ];

  return (
    <div className="space-y-4 w-full max-w-none">
      {/* Game Overview Metrics */}
      <Card className="border-emerald-200 dark:border-emerald-800 shadow-md">
        <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-800 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg">Game Overview & Performance Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Players Tracked</span>
              </div>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{gameMetrics.totalPlayers}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{gameMetrics.avgPlayerConfidence}% avg confidence</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Face-offs</span>
              </div>
              <p className="text-xl font-bold text-purple-900 dark:text-purple-100">{gameMetrics.totalFaceoffs}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">{gameMetrics.faceoffWinRate}% success rate</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Transitions</span>
              </div>
              <p className="text-xl font-bold text-green-900 dark:text-green-100">{gameMetrics.totalTransitions}</p>
              <p className="text-xs text-green-600 dark:text-green-400">{gameMetrics.transitionSuccessRate}% effective</p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Elite Moments</span>
              </div>
              <p className="text-xl font-bold text-orange-900 dark:text-orange-100">{gameMetrics.eliteMoments}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">{gameMetrics.gameIntensity} intensity</p>
            </div>
          </div>

          {/* Team Breakdown */}
          {Object.keys(teamData).length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Performance Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(teamData).map(([teamKey, players]) => (
                  <div key={teamKey} className={`p-4 rounded-lg border ${
                    teamKey === 'white' 
                      ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                      : 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        teamKey === 'white' ? 'bg-gray-400' : 'bg-slate-600'
                      }`}></div>
                      <span className="font-medium capitalize">{teamKey} Team</span>
                      <Badge variant="outline">{players.length} players</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Avg Confidence: {Math.round(players.reduce((sum, p) => sum + p.confidence, 0) / players.length)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Timeline */}
          {gameMetrics.timeSpan && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Game Analysis Coverage</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analysis spans from {formatTimestamp(gameMetrics.timeSpan.earliest)} to {formatTimestamp(gameMetrics.timeSpan.latest)}
                ({scoringData.length} scoring plays identified)
              </p>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Analysis Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {analysisSections.map((section) => {
          if (section.count === 0) return null;
          return (
            <Card key={section.id} className={`${section.bgColor} ${section.borderColor} border cursor-pointer hover:shadow-md transition-all`}
              onClick={() => toggleSection(section.id)}>
              <CardContent className="p-3 text-center">
                <section.icon className={`w-6 h-6 ${section.color} mx-auto mb-1`} />
                <p className="text-xl font-bold">{section.count}</p>
                <p className="text-xs text-muted-foreground">{section.title.replace(' Analysis', '')}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dynamic Analysis Sections */}
      {analysisSections.map((section) => {
        if (section.count === 0) return null;
        
        return (
          <Card key={section.id} className="shadow-sm overflow-hidden">
            <CardHeader 
              className={`cursor-pointer hover:bg-muted/50 transition-colors ${section.bgColor} ${section.borderColor} border-b p-3`}
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`p-1.5 rounded-lg ${section.bgColor} ${section.borderColor} border flex-shrink-0`}>
                    <section.icon className={`w-4 h-4 ${section.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base leading-tight">{section.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {section.count} {section.count === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-sm font-bold px-2">
                    {section.count}
                  </Badge>
                  {expandedSections.has(section.id) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            {expandedSections.has(section.id) && (
              <CardContent className="p-3">
                {/* Overall Analysis */}
                {section.id === 'overall' && overallAnalysis && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      {overallAnalysis.content}
                    </p>
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t flex flex-wrap items-center gap-2 sm:gap-4">
                      <Badge variant="outline" className="text-xs">
                        Confidence: {overallAnalysis.confidence}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Analysis Method: {overallAnalysis.metadata?.analysisMethod || 'Standard'}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Player Evaluations */}
                {section.id === 'players' && (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Check if this is a personal highlight video */}
                    {(video.title?.toLowerCase().includes('highlight') || 
                      video.metadata?.videoType === 'highlight_tape') ? (
                      <>
                        {/* Extract player name from title */}
                        {(() => {
                          const titleWords = video.title?.split(' ') || [];
                          const highlightIndex = titleWords.findIndex((word: string) => 
                            word.toLowerCase().includes('highlight')
                          );
                          const playerName = highlightIndex > 0 ? titleWords[0] : 'Target Player';
                          
                          return (
                            <PersonalHighlightEvaluations
                              evaluations={playerEvaluations}
                              formatTimestamp={formatTimestamp as (timestamp: number) => string}
                              playerName={playerName}
                            />
                          );
                        })()}
                      </>
                    ) : (
                      /* Regular team game analysis */
                      <PlayerEvaluationsGrouped 
                        evaluations={playerEvaluations}
                        formatTimestamp={formatTimestamp as (timestamp: number) => string}
                      />
                    )}
                  </div>
                )}
                
                {/* Face-off Analysis */}
                {section.id === 'faceoffs' && (
                  <div className="space-y-3 sm:space-y-4">
                    {faceOffAnalyses.map((faceoff: any, index: number) => (
                      <Card key={faceoff.id} className="shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="p-3 sm:p-6">
                          <CardTitle className="text-sm sm:text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span>Face-off #{index + 1}</span>
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              {faceoff.metadata?.winProbability && (
                                <Badge 
                                  className={`text-xs ${
                                    faceoff.metadata.winProbability >= 70 
                                      ? 'bg-green-500 text-white' 
                                      : faceoff.metadata.winProbability >= 50 
                                      ? 'bg-amber-500 text-white' 
                                      : 'bg-red-500 text-white'
                                  }`}
                                >
                                  {faceoff.metadata.winProbability}% win probability
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTimestamp(faceoff.timestamp) || 'N/A'}
                              </Badge>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 p-3 sm:p-6">
                          <p className="text-sm text-muted-foreground leading-relaxed">{faceoff.content}</p>
                          {faceoff.confidence && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Confidence:</span>
                              <Badge variant="secondary" className="text-xs">
                                {faceoff.confidence}%
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Transition Analysis */}
                {section.id === 'transitions' && (
                  <div className="space-y-3 sm:space-y-4">
                    {transitionAnalyses.map((transition: any, index: number) => (
                      <Card key={transition.id} className="shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="p-3 sm:p-6">
                          <CardTitle className="text-sm sm:text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span>Transition #{index + 1}</span>
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              {transition.metadata?.successProbability && (
                                <Badge 
                                  className={`text-xs ${
                                    transition.metadata.successProbability >= 70 
                                      ? 'bg-green-500 text-white' 
                                      : transition.metadata.successProbability >= 50 
                                      ? 'bg-amber-500 text-white' 
                                      : 'bg-red-500 text-white'
                                  }`}
                                >
                                  {transition.metadata.successProbability}% success rate
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTimestamp(transition.timestamp) || 'N/A'}
                              </Badge>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 p-3 sm:p-6">
                          <p className="text-sm text-muted-foreground leading-relaxed">{transition.content}</p>
                          {transition.confidence && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Confidence:</span>
                              <Badge variant="secondary" className="text-xs">
                                {transition.confidence}%
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Key Moments */}
                {section.id === 'moments' && (
                  <div className="space-y-3 sm:space-y-4">
                    {keyMoments.map((moment: any, index: number) => (
                      <div key={moment.id} className="p-3 sm:p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-orange-600 mt-0.5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="text-xs bg-orange-500 text-white">
                                Moment #{index + 1}
                              </Badge>
                              {moment.timestamp && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTimestamp(moment.timestamp)}
                                </Badge>
                              )}
                              {moment.confidence && (
                                <Badge variant="secondary" className="text-xs">
                                  {moment.confidence}% confidence
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{moment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Detailed Metrics */}
                {section.id === 'detailed' && playerEvaluations.length > 0 && (
                  <DetailedAnalysisView videoId={video.id} />
                )}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Analysis Summary */}
      {analyses.length > 0 && (
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-300 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analysisSections.map((section) => (
                <div key={section.id} className="text-center">
                  <div className={`text-2xl font-bold ${section.color}`}>
                    {section.count}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {section.title.replace(' Analysis', '')}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Total of {analyses.length} analyses generated from this video
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}