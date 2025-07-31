import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PersonalHighlightEvaluations from "@/components/personal-highlight-evaluations";
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  User,
  Clock,
  Sparkles,
  AlertCircle
} from "lucide-react";

interface HighlightAnalysisProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function HighlightAnalysis({ video, analyses, formatTimestamp }: HighlightAnalysisProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Extract player name from title
  const titleWords = video.title?.split(' ') || [];
  const highlightIndex = titleWords.findIndex((word: string) => 
    word.toLowerCase().includes('highlight')
  );
  const playerName = highlightIndex > 0 ? titleWords[0] : 'Featured Player';

  // Calculate stats
  const totalHighlights = playerEvaluations.length;
  const avgConfidence = playerEvaluations.length > 0 
    ? Math.round(playerEvaluations.reduce((sum: number, e: any) => sum + e.confidence, 0) / playerEvaluations.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-amber-200 dark:border-amber-800 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {playerName}'s Highlight Reel Analysis
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Elite plays and standout moments evaluation
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{totalHighlights}</p>
              <p className="text-sm text-muted-foreground">Highlight Plays</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{avgConfidence}%</p>
              <p className="text-sm text-muted-foreground">Analysis Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                {keyMoments.length}
              </p>
              <p className="text-sm text-muted-foreground">Elite Moments</p>
            </div>
          </div>
          
          {overallAnalysis && (
            <div className="prose prose-sm max-w-none bg-white dark:bg-gray-900 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <p className="text-muted-foreground leading-relaxed">
                {overallAnalysis.content}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Highlights */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-amber-600" />
            <CardTitle>Individual Highlight Breakdown</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <PersonalHighlightEvaluations
            evaluations={playerEvaluations}
            formatTimestamp={formatTimestamp as (timestamp: number) => string}
            playerName={playerName}
          />
        </CardContent>
      </Card>

      {/* Elite Moments */}
      {keyMoments.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 shadow-lg">
          <CardHeader className="bg-orange-50 dark:bg-orange-950/20 border-b border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Elite Moments & Signature Plays</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {keyMoments.map((moment: any, index: number) => (
                <div key={moment.id} className="relative pl-8 pb-4 last:pb-0">
                  <div className="absolute left-0 top-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{index + 1}</span>
                  </div>
                  {index < keyMoments.length - 1 && (
                    <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-orange-200 dark:bg-orange-800"></div>
                  )}
                  <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500 text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(moment.timestamp) || 'N/A'}
                        </Badge>
                        {(() => {
                          const ratingMatch = moment.content.match(/(\d+)\/10/);
                          const rating = ratingMatch ? parseInt(ratingMatch[1]) : null;
                          if (rating) {
                            return (
                              <Badge className={
                                rating >= 8 ? 'bg-green-500 text-white' :
                                rating >= 6 ? 'bg-yellow-500 text-white' :
                                'bg-red-500 text-white'
                              }>
                                {rating}/10 Rating
                              </Badge>
                            );
                          }
                          return null;
                        })()}
                        {(moment.content.toLowerCase().includes('error') || 
                          moment.content.toLowerCase().includes('mistake') ||
                          moment.content.toLowerCase().includes('poor') ||
                          moment.content.toLowerCase().includes('bad')) && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            Needs Work
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline">
                        {moment.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{moment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Analysis & Improvements Needed */}
      <Card className="border-red-200 dark:border-red-800 shadow-lg">
        <CardHeader className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl">Areas for Improvement & Critical Feedback</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Extract critical feedback from analyses */}
            {analyses.filter(a => 
              a.content.toLowerCase().includes('improve') ||
              a.content.toLowerCase().includes('weakness') ||
              a.content.toLowerCase().includes('error') ||
              a.content.toLowerCase().includes('mistake') ||
              a.content.toLowerCase().includes('poor') ||
              a.content.toLowerCase().includes('lack') ||
              a.content.toLowerCase().includes('need') ||
              a.content.match(/\d\/10/) && parseInt(a.content.match(/(\d)\/10/)![1]) < 6
            ).map((critical, index) => (
              <div key={critical.id} className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-red-700 dark:text-red-300">
                        {formatTimestamp(critical.timestamp)}
                      </span>
                      {critical.type === 'player_evaluation' && (
                        <Badge variant="outline" className="text-xs">
                          Player Analysis
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {critical.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Competition Level Warning */}
            {overallAnalysis?.content.toLowerCase().includes('competition') && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Competition Level Note</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Consider the level of competition shown in these highlights when evaluating overall ability.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Highlight Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-300 dark:border-amber-700">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-amber-700 dark:text-amber-300 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{totalHighlights}</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">Total Plays</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-300 dark:border-orange-700">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-orange-700 dark:text-orange-300 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{keyMoments.length}</p>
            <p className="text-xs text-orange-700 dark:text-orange-300">Elite Moments</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-300 dark:border-amber-700">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-amber-700 dark:text-amber-300 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{avgConfidence}%</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">Avg Confidence</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-300 dark:border-orange-700">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-8 h-8 text-orange-700 dark:text-orange-300 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">Elite</p>
            <p className="text-xs text-orange-700 dark:text-orange-300">Performance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}