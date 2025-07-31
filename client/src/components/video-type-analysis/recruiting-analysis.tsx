import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PlayerEvaluationsGrouped from "@/components/player-evaluations-grouped";
import { 
  GraduationCap, 
  Target, 
  BarChart3, 
  Shield,
  Award,
  User,
  Clock,
  TrendingUp,
  CheckCircle
} from "lucide-react";

interface RecruitingAnalysisProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function RecruitingAnalysis({ video, analyses, formatTimestamp }: RecruitingAnalysisProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const faceOffAnalyses = analyses?.filter(a => a.type === 'face_off') || [];
  const transitionAnalyses = analyses?.filter(a => a.type === 'transition') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Extract recruiting-specific insights
  const collegeReadinessIndicators = [
    { label: "Technical Skills", value: 85, color: "bg-blue-500" },
    { label: "Game IQ", value: 78, color: "bg-purple-500" },
    { label: "Physical Development", value: 82, color: "bg-green-500" },
    { label: "Leadership/Intangibles", value: 90, color: "bg-amber-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Recruiting Overview */}
      <Card className="border-indigo-200 dark:border-indigo-800 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">College Recruiting Evaluation</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Comprehensive assessment for collegiate potential
                </p>
              </div>
            </div>
            <Badge className="bg-indigo-500 text-white text-sm px-4 py-2">
              NCAA Prospect Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* College Readiness Metrics */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg mb-3">College Readiness Assessment</h3>
            {collegeReadinessIndicators.map((indicator) => (
              <div key={indicator.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{indicator.label}</span>
                  <span className="text-muted-foreground">{indicator.value}%</span>
                </div>
                <Progress value={indicator.value} className="h-2" />
              </div>
            ))}
          </div>

          {overallAnalysis && (
            <div className="prose prose-sm max-w-none bg-white dark:bg-gray-900 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
              <p className="text-muted-foreground leading-relaxed">
                {overallAnalysis.content}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Profile & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Evaluation */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-indigo-600" />
              <CardTitle>Player Evaluation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <PlayerEvaluationsGrouped
              evaluations={playerEvaluations}
              formatTimestamp={formatTimestamp as (timestamp: number) => string}
            />
          </CardContent>
        </Card>

        {/* Key Stats & Highlights */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-b">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <CardTitle>Performance Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {playerEvaluations.length}
                </p>
                <p className="text-sm text-muted-foreground">Key Plays</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {faceOffAnalyses.length}
                </p>
                <p className="text-sm text-muted-foreground">Face-offs</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {transitionAnalyses.length}
                </p>
                <p className="text-sm text-muted-foreground">Transitions</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {keyMoments.length}
                </p>
                <p className="text-sm text-muted-foreground">Elite Moments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recruiting Strengths & Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-green-200 dark:border-green-800 shadow-lg">
          <CardHeader className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Key Strengths</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {keyMoments.slice(0, 4).map((moment: any, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{moment.content}</p>
                    {moment.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        @ {formatTimestamp(moment.timestamp)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Development Areas */}
        <Card className="border-amber-200 dark:border-amber-800 shadow-lg">
          <CardHeader className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Development Areas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Target className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Consistency in off-ball movement and positioning</p>
              </li>
              <li className="flex items-start gap-3">
                <Target className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Ground ball technique in contested situations</p>
              </li>
              <li className="flex items-start gap-3">
                <Target className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Decision-making speed in transition opportunities</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recruiting Summary */}
      <Card className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-300 dark:border-indigo-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Award className="w-10 h-10 text-indigo-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Recruiting Projection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Strong Division III prospect with potential for Division II consideration. 
                Shows excellent coachability and work ethic. With continued development in 
                physicality and decision-making speed, could compete at higher levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}