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
  Target,
  Zap,
  Activity,
  BarChart3,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Eye,
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

  // Filter analyses for different sections
  const playerEvaluations = analyses.filter(a => a.type === 'player_evaluation');
  const keyMoments = analyses.filter(a => a.type === 'key_moment');
  const overallAnalysis = analyses.find(a => a.type === 'overall_analysis');

  // Extract player name
  const playerName = video.title?.split(' ')[0] || 'Player';

  // Calculate metrics
  const totalHighlights = playerEvaluations.length;
  const avgConfidence = totalHighlights > 0 
    ? Math.round(playerEvaluations.reduce((sum: number, a: any) => sum + a.confidence, 0) / totalHighlights)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            {playerName}'s Elite Highlights
          </CardTitle>
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

      {/* Complete Analysis */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Complete Clip-by-Clip Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonalHighlightEvaluations
            evaluations={playerEvaluations}
            formatTimestamp={formatTimestamp as (timestamp: number) => string}
            playerName={playerName}
          />
        </CardContent>
      </Card>
    </div>
  );
}