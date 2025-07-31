import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { useState } from "react";
import PlayerStatSheet from "./player-stat-sheet";

interface PlayerEvaluation {
  id: number;
  title: string;
  content: string;
  timestamp?: number;
  confidence: number;
  metadata?: {
    playerNumber?: string;
    skillArea?: string;
  };
}

interface PlayerEvaluationsGroupedProps {
  evaluations: PlayerEvaluation[];
  formatTimestamp: (timestamp: number) => string;
}

export default function PlayerEvaluationsGrouped({ 
  evaluations, 
  formatTimestamp 
}: PlayerEvaluationsGroupedProps) {
  // State for expanded player stat sheets
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  
  // Toggle player expansion
  const togglePlayer = (playerKey: string) => {
    const newExpanded = new Set(expandedPlayers);
    if (newExpanded.has(playerKey)) {
      newExpanded.delete(playerKey);
    } else {
      newExpanded.add(playerKey);
    }
    setExpandedPlayers(newExpanded);
  };
  
  // First, group evaluations by player
  const playerGroups = new Map<string, PlayerEvaluation[]>();
  
  evaluations.forEach((evaluation) => {
    const playerKey = evaluation.metadata?.playerNumber || 
                     evaluation.title.match(/#?\d+/)?.[0] || 
                     evaluation.title;
    
    if (!playerGroups.has(playerKey)) {
      playerGroups.set(playerKey, []);
    }
    playerGroups.get(playerKey)!.push(evaluation);
  });
  
  // Group players by team
  const whiteTeamPlayers = new Map<string, PlayerEvaluation[]>();
  const darkTeamPlayers = new Map<string, PlayerEvaluation[]>();
  const unknownTeamPlayers = new Map<string, PlayerEvaluation[]>();
  
  playerGroups.forEach((playerEvals, playerKey) => {
    let isWhite = false;
    let isDark = false;
    
    playerEvals.forEach((evaluation) => {
      const contentLower = evaluation.content.toLowerCase();
      const titleLower = evaluation.title.toLowerCase();
      
      if (contentLower.includes('white jersey') || contentLower.includes('white uniform') || 
          contentLower.includes('white team') || titleLower.includes('white')) {
        isWhite = true;
      }
      if (contentLower.includes('dark jersey') || contentLower.includes('dark uniform') || 
          contentLower.includes('dark team') || contentLower.includes('black jersey') ||
          contentLower.includes('blue jersey') || contentLower.includes('red jersey') ||
          contentLower.includes('navy') || contentLower.includes('maroon') ||
          titleLower.includes('dark') || titleLower.includes('blue') || titleLower.includes('red')) {
        isDark = true;
      }
    });
    
    // Sort evaluations by timestamp
    playerEvals.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    if (isWhite && !isDark) {
      whiteTeamPlayers.set(playerKey, playerEvals);
    } else if (isDark && !isWhite) {
      darkTeamPlayers.set(playerKey, playerEvals);
    } else {
      unknownTeamPlayers.set(playerKey, playerEvals);
    }
  });

  const renderPlayerGroup = (
    players: Map<string, PlayerEvaluation[]>, 
    teamName: string, 
    teamDescription: string,
    bgColor: string,
    borderColor: string,
    badgeColor: string,
    isDarkTeam: boolean = false
  ) => (
    <div className={`mt-3 sm:mt-6 p-3 sm:p-6 rounded-2xl ${bgColor} border ${borderColor}`}>
      <Card className={`border-2 ${borderColor} ${isDarkTeam ? 'bg-gray-800/30 dark:bg-gray-900' : 'bg-white dark:bg-gray-900/40'} mb-3 sm:mb-6 shadow-lg`}>
        <CardHeader className={`pb-3 sm:pb-4 p-3 sm:p-6 ${isDarkTeam ? 'bg-gray-800/50 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} rounded-t-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${badgeColor} border-3 border-gray-500 rounded-full shadow-md flex-shrink-0`}></div>
              <div className="min-w-0">
                <span className={`text-lg sm:text-2xl font-bold ${isDarkTeam ? 'text-white dark:text-gray-100' : ''}`}>{teamName}</span>
                <p className={`text-xs sm:text-sm ${isDarkTeam ? 'text-gray-300 dark:text-gray-400' : 'text-muted-foreground'}`}>{teamDescription}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 self-start sm:self-auto">
              {players.size} Players Analyzed
            </Badge>
          </div>
        </CardHeader>
      </Card>
      
      <div className={`pl-3 sm:pl-6 border-l-4 ${borderColor} space-y-3 sm:space-y-6`}>
        {Array.from(players.entries()).map(([playerKey, playerEvals]) => (
          <div key={playerKey} className="space-y-2 sm:space-y-3">
            {/* Player Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="text-base sm:text-lg font-bold line-clamp-1">
                  {playerEvals[0].metadata?.playerNumber ? `Player #${playerEvals[0].metadata.playerNumber}` : playerKey}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-6 sm:ml-0">
                <Badge variant="secondary" className="text-xs">
                  {playerEvals.length} {playerEvals.length === 1 ? 'clip' : 'clips'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePlayer(playerKey)}
                  className="h-6 sm:h-7 px-2 text-xs sm:text-sm"
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">{expandedPlayers.has(playerKey) ? 'Hide' : 'View'} Stats</span>
                  <span className="sm:hidden">{expandedPlayers.has(playerKey) ? 'Hide' : 'Stats'}</span>
                  {expandedPlayers.has(playerKey) ? (
                    <ChevronUp className="w-3 h-3 ml-1" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Show stat sheet if expanded */}
            {expandedPlayers.has(playerKey) ? (
              <div className="ml-3 sm:ml-7 mt-3 sm:mt-4">
                <PlayerStatSheet 
                  playerKey={playerKey}
                  evaluations={playerEvals}
                  formatTimestamp={formatTimestamp}
                />
              </div>
            ) : (
              /* Show preview of clips */
              <div className="space-y-2 sm:space-y-3 ml-3 sm:ml-7">
                {playerEvals.slice(0, 2).map((evaluation, index) => (
                  <Card key={evaluation.id} className="shadow-soft hover:shadow-glow transition-all">
                    <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          Clip {index + 1}
                        </Badge>
                        {evaluation.timestamp && (
                          <Badge variant="secondary" className="text-xs">
                            {formatTimestamp(evaluation.timestamp)}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs self-start sm:self-auto">
                        {evaluation.confidence}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      {(() => {
                        const positionMatch = evaluation.content.match(/(?:plays?\s+)?(?:as\s+)?(?:a\s+)?(\b(?:attack|attackman|midfield|midfielder|defense|defenseman|goalie|goalkeeper|FOGO|face-?off\s+specialist|LSM|long\s+stick\s+middie)\b)/i);
                        const position = positionMatch ? positionMatch[1] : null;
                        
                        return (
                          <>
                            {position && (
                              <div className="mb-2 sm:mb-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Position:</span>
                                <Badge variant="secondary" className="text-xs self-start">
                                  {position.charAt(0).toUpperCase() + position.slice(1)}
                                </Badge>
                              </div>
                            )}
                            {evaluation.content.split('\n\n').map((section, idx) => {
                              if (section.includes('BIOMECHANICS:') || 
                                  section.includes('DECISION MAKING:') || 
                                  section.includes('IMPROVEMENT:') ||
                                  section.includes('TECHNIQUE:') ||
                                  section.includes('TACTICAL:')) {
                                const [label, ...content] = section.split(':');
                                return (
                                  <div key={idx} className="space-y-1 sm:space-y-2">
                                    <h4 className="font-semibold text-xs sm:text-sm text-primary uppercase tracking-wide">
                                      {label.trim()}
                                    </h4>
                                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed pl-2 sm:pl-4">
                                      {content.join(':').trim()}
                                    </p>
                                  </div>
                                );
                              }
                              return (
                                <p key={idx} className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                  {section}
                                </p>
                              );
                            })}
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {playerEvals.length > 2 && !expandedPlayers.has(playerKey) && (
                <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2 ml-3 sm:ml-7">
                  +{playerEvals.length - 2} more clips
                </p>
              )}
            </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {whiteTeamPlayers.size > 0 && renderPlayerGroup(
        whiteTeamPlayers,
        "White Team",
        "Light colored jerseys",
        "bg-gray-50/30 dark:bg-gray-900/10",
        "border-gray-300",
        "bg-white"
      )}
      
      {darkTeamPlayers.size > 0 && renderPlayerGroup(
        darkTeamPlayers,
        "Dark Team",
        "Dark colored jerseys",
        "bg-gray-800/10 dark:bg-gray-800/20",
        "border-gray-700 dark:border-gray-600",
        "bg-gray-800 dark:bg-gray-700",
        true
      )}
      
      {unknownTeamPlayers.size > 0 && renderPlayerGroup(
        unknownTeamPlayers,
        "Other Players",
        "Team not identified",
        "bg-orange-50/30 dark:bg-orange-900/10",
        "border-orange-300 dark:border-orange-800",
        "bg-orange-500"
      )}
    </>
  );
}