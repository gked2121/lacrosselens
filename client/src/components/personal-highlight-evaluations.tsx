import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ChevronDown, ChevronUp, BarChart3, User, HelpCircle } from "lucide-react";
import { useState } from "react";
import PlayerStatSheet from "./player-stat-sheet";
import { removeMarkdownFormatting } from "@/lib/markdown-utils";

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

interface PersonalHighlightEvaluationsProps {
  evaluations: PlayerEvaluation[];
  formatTimestamp: (timestamp: number) => string;
  playerName?: string; // e.g., "Dylan"
}

export default function PersonalHighlightEvaluations({ 
  evaluations, 
  formatTimestamp,
  playerName = "Target Player"
}: PersonalHighlightEvaluationsProps) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const [isOtherPlayersExpanded, setIsOtherPlayersExpanded] = useState(false);
  
  const togglePlayer = (playerKey: string) => {
    const newExpanded = new Set(expandedPlayers);
    if (newExpanded.has(playerKey)) {
      newExpanded.delete(playerKey);
    } else {
      newExpanded.add(playerKey);
    }
    setExpandedPlayers(newExpanded);
  };
  
  // Extract all jersey numbers from evaluations
  const extractJerseyNumbers = (content: string, title: string): string[] => {
    const numbers: string[] = [];
    
    // Pattern to match jersey numbers in various formats
    const patterns = [
      /#(\d+)/g,                    // #12
      /number\s+(\d+)/gi,           // number 12
      /jersey\s+(\d+)/gi,           // jersey 12
      /player\s+(\d+)/gi,           // player 12
      /\b(\d+)\s+jersey/gi,         // 12 jersey
      /wearing\s+(\d+)/gi,          // wearing 12
      /\b(\d{1,2})\b(?=\s+(?:makes|scores|shoots|passes|dodges|defends|checks|picks|clears|rides))/gi, // 12 makes/scores/etc
    ];
    
    const combinedText = `${content} ${title}`;
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(combinedText)) !== null) {
        if (match[1] && parseInt(match[1]) > 0 && parseInt(match[1]) < 100) {
          numbers.push(match[1]);
        }
      }
    });
    
    // Remove duplicates
    return Array.from(new Set(numbers));
  };
  
  // Find the most common jersey number across all evaluations (likely the target player)
  const findTargetPlayerNumber = (): string | null => {
    const numberCounts = new Map<string, number>();
    
    evaluations.forEach(evaluation => {
      const numbers = extractJerseyNumbers(evaluation.content, evaluation.title);
      numbers.forEach(num => {
        numberCounts.set(num, (numberCounts.get(num) || 0) + 1);
      });
    });
    
    // Find the most frequent number
    let maxCount = 0;
    let targetNumber: string | null = null;
    
    numberCounts.forEach((count, number) => {
      if (count > maxCount) {
        maxCount = count;
        targetNumber = number;
      }
    });
    
    // Only consider it the target if it appears in at least 30% of clips
    if (targetNumber && maxCount >= evaluations.length * 0.3) {
      return targetNumber;
    }
    
    return null;
  };
  
  const targetPlayerNumber = findTargetPlayerNumber();
  
  // Group evaluations
  const targetPlayerEvals: PlayerEvaluation[] = [];
  const uncertainEvals: PlayerEvaluation[] = [];
  const otherPlayerEvals = new Map<string, PlayerEvaluation[]>();
  
  evaluations.forEach((evaluation) => {
    const numbers = extractJerseyNumbers(evaluation.content, evaluation.title);
    
    if (targetPlayerNumber && numbers.includes(targetPlayerNumber)) {
      // This evaluation mentions our target player
      targetPlayerEvals.push(evaluation);
    } else if (numbers.length === 0) {
      // No clear number identification
      uncertainEvals.push(evaluation);
    } else {
      // Other identified players
      numbers.forEach(num => {
        if (!otherPlayerEvals.has(num)) {
          otherPlayerEvals.set(num, []);
        }
        otherPlayerEvals.get(num)!.push(evaluation);
      });
    }
  });
  
  // Sort all evaluations by timestamp
  targetPlayerEvals.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  uncertainEvals.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  otherPlayerEvals.forEach(evals => {
    evals.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  });
  
  const renderEvaluationCard = (evaluation: PlayerEvaluation, index: number) => (
    <Card key={evaluation.id} className="shadow-soft hover:shadow-glow transition-all border-l-4 border-l-blue-400">
      <CardHeader className="pb-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium">
              Clip {index + 1}
            </Badge>
            {evaluation.timestamp && (
              <Badge variant="secondary" className="text-xs">
                {formatTimestamp(evaluation.timestamp)}
              </Badge>
            )}
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              evaluation.confidence >= 80 ? 'border-green-300 text-green-700 bg-green-50' :
              evaluation.confidence >= 60 ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
              'border-red-300 text-red-700 bg-red-50'
            }`}
          >
            {evaluation.confidence}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {(() => {
            const positionMatch = evaluation.content.match(/(?:plays?\s+)?(?:as\s+)?(?:a\s+)?(\b(?:attack|attackman|midfield|midfielder|defense|defenseman|goalie|goalkeeper|FOGO|face-?off\s+specialist|LSM|long\s+stick\s+middie)\b)/i);
            const position = positionMatch ? positionMatch[1] : null;
            
            // Parse content into structured sections
            const sections = evaluation.content.split('\n\n');
            const structuredSections: { type: string; label?: string; content: string }[] = [];
            
            sections.forEach(section => {
              if (section.includes('BIOMECHANICS:') || 
                  section.includes('DECISION MAKING:') || 
                  section.includes('IMPROVEMENT:') ||
                  section.includes('TECHNIQUE:') ||
                  section.includes('TACTICAL:')) {
                const [label, ...content] = section.split(':');
                structuredSections.push({
                  type: 'structured',
                  label: label.trim(),
                  content: content.join(':').trim()
                });
              } else if (section.trim()) {
                structuredSections.push({
                  type: 'general',
                  content: section.trim()
                });
              }
            });
            
            return (
              <>
                {position && (
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Position:</span>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {position.charAt(0).toUpperCase() + position.slice(1)}
                      </Badge>
                    </div>
                  </div>
                )}
                
                {structuredSections.map((section, idx) => {
                  if (section.type === 'structured') {
                    return (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-3 border-l-2 border-l-blue-300">
                        <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-2">
                          {section.label}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {removeMarkdownFormatting(section.content)}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="p-3 bg-white dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {removeMarkdownFormatting(section.content)}
                      </p>
                    </div>
                  );
                })}
              </>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      {/* Target Player Section */}
      {targetPlayerEvals.length > 0 && (
        <div className="bg-blue-50/30 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-300">
          <Card className="border-2 border-blue-400 bg-white dark:bg-gray-900/40 mb-6 shadow-lg">
            <CardHeader className="pb-4 p-6 bg-blue-50 dark:bg-blue-900/30 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full shadow-md flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {playerName} {targetPlayerNumber && `(#${targetPlayerNumber})`}
                    </h3>
                    <p className="text-sm text-muted-foreground">Primary highlight subject</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {targetPlayerEvals.length} Clips
                </Badge>
              </div>
            </CardHeader>
          </Card>
          
          <div className="pl-6 border-l-4 border-blue-400 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => togglePlayer('target')}
                className="h-8"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {expandedPlayers.has('target') ? 'Hide' : 'View'} Complete Stats
                {expandedPlayers.has('target') ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
            
            {expandedPlayers.has('target') ? (
              <div className="ml-2">
                <PlayerStatSheet 
                  playerKey={`${playerName} #${targetPlayerNumber}`}
                  evaluations={targetPlayerEvals}
                  formatTimestamp={formatTimestamp}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {targetPlayerEvals.slice(0, 3).map((evaluation, index) => 
                  renderEvaluationCard(evaluation, index)
                )}
                {targetPlayerEvals.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center mt-3">
                    +{targetPlayerEvals.length - 3} more clips
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Uncertain Section */}
      {uncertainEvals.length > 0 && (
        <div className="bg-orange-50/30 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-300">
          <Card className="border-2 border-orange-400 bg-white dark:bg-gray-900/40 mb-6 shadow-lg">
            <CardHeader className="pb-4 p-6 bg-orange-50 dark:bg-orange-900/30 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full shadow-md flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Uncertain Identification</h3>
                    <p className="text-sm text-muted-foreground">Jersey number not clearly visible</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {uncertainEvals.length} Clips
                </Badge>
              </div>
            </CardHeader>
          </Card>
          
          <div className="pl-6 border-l-4 border-orange-400 space-y-3">
            {uncertainEvals.map((evaluation, index) => 
              renderEvaluationCard(evaluation, index)
            )}
          </div>
        </div>
      )}
      
      {/* Other Players Section - Collapsible, starts collapsed */}
      {otherPlayerEvals.size > 0 && (
        <div className="bg-gray-50/30 dark:bg-gray-900/10 p-6 rounded-2xl border border-gray-300">
          <Card className="border-2 border-gray-400 bg-white dark:bg-gray-900/40 mb-6 shadow-lg">
            <CardHeader 
              className="pb-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
              onClick={() => setIsOtherPlayersExpanded(!isOtherPlayersExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-500 rounded-full shadow-md flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Other Players</h3>
                    <p className="text-sm text-muted-foreground">Additional players in highlights • Click to expand</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {otherPlayerEvals.size} Players
                  </Badge>
                  {isOtherPlayersExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
          
          {isOtherPlayersExpanded && (
            <div className="space-y-6 animate-in slide-in-from-top-2 duration-200">
              {Array.from(otherPlayerEvals.entries()).map(([number, evals]) => (
                <div key={number} className="pl-6 border-l-4 border-gray-400">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold">Player #{number}</h4>
                    <Badge variant="outline" className="text-xs">
                      {evals.length} clip{evals.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {evals.slice(0, 3).map((evaluation, index) => 
                      renderEvaluationCard(evaluation, index)
                    )}
                    {evals.length > 3 && (
                      <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50 dark:bg-gray-900/50">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            +{evals.length - 3} more clip{evals.length - 3 !== 1 ? 's' : ''} for this player
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePlayer(`other-${number}`)}
                            className="h-8 mt-2"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            {expandedPlayers.has(`other-${number}`) ? 'Hide' : 'View'} All Clips
                            {expandedPlayers.has(`other-${number}`) ? (
                              <ChevronUp className="w-4 h-4 ml-2" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-2" />
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {expandedPlayers.has(`other-${number}`) && evals.length > 3 && (
                    <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {evals.slice(3).map((evaluation, index) => 
                        renderEvaluationCard(evaluation, index + 3)
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Collapsed preview when not expanded */}
          {!isOtherPlayersExpanded && (
            <div className="pl-6 border-l-4 border-gray-400">
              <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Analysis includes feedback on {otherPlayerEvals.size} other player{otherPlayerEvals.size !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click header above to view detailed feedback
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}