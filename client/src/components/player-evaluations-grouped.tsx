import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

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
    <div className={`mt-6 p-6 rounded-2xl ${bgColor} border ${borderColor}`}>
      <Card className={`border-2 ${borderColor} ${isDarkTeam ? 'bg-gray-800/30 dark:bg-gray-900' : 'bg-white dark:bg-gray-900/40'} mb-6 shadow-lg`}>
        <CardHeader className={`pb-4 ${isDarkTeam ? 'bg-gray-800/50 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${badgeColor} border-3 border-gray-500 rounded-full shadow-md`}></div>
              <div>
                <span className={`text-2xl font-bold ${isDarkTeam ? 'text-white dark:text-gray-100' : ''}`}>{teamName}</span>
                <p className={`text-sm ${isDarkTeam ? 'text-gray-300 dark:text-gray-400' : 'text-muted-foreground'}`}>{teamDescription}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {players.size} Players Analyzed
            </Badge>
          </div>
        </CardHeader>
      </Card>
      
      <div className={`pl-6 border-l-4 ${borderColor} space-y-6`}>
        {Array.from(players.entries()).map(([playerKey, playerEvals]) => (
          <div key={playerKey} className="space-y-3">
            {/* Player Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold">
                  {playerEvals[0].metadata?.playerNumber ? `Player #${playerEvals[0].metadata.playerNumber}` : playerKey}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {playerEvals.length} {playerEvals.length === 1 ? 'clip' : 'clips'}
              </Badge>
            </div>
            
            {/* Multiple clips for this player */}
            <div className="space-y-3 ml-7">
              {playerEvals.map((evaluation, index) => (
                <Card key={evaluation.id} className="shadow-soft hover:shadow-glow transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Clip {index + 1}
                        </Badge>
                        {evaluation.timestamp && (
                          <Badge variant="secondary" className="text-xs">
                            {formatTimestamp(evaluation.timestamp)}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {evaluation.confidence}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const positionMatch = evaluation.content.match(/(?:plays?\s+)?(?:as\s+)?(?:a\s+)?(\b(?:attack|attackman|midfield|midfielder|defense|defenseman|goalie|goalkeeper|FOGO|face-?off\s+specialist|LSM|long\s+stick\s+middie)\b)/i);
                        const position = positionMatch ? positionMatch[1] : null;
                        
                        return (
                          <>
                            {position && (
                              <div className="mb-3 flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Position:</span>
                                <Badge variant="secondary" className="text-xs">
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
                                  <div key={idx} className="space-y-2">
                                    <h4 className="font-semibold text-sm text-primary uppercase tracking-wide">
                                      {label.trim()}
                                    </h4>
                                    <p className="text-muted-foreground pl-4">
                                      {content.join(':').trim()}
                                    </p>
                                  </div>
                                );
                              }
                              return (
                                <p key={idx} className="text-muted-foreground">
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
            </div>
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