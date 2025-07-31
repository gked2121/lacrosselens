import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  TrendingUp, 
  Users, 
  Clock,
  Award,
  Target,
  Brain,
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3,
  GraduationCap,
  Zap
} from "lucide-react";

interface RecruitingAnalysisProps {
  video: any;
  analyses: any[];
  formatTimestamp: (seconds: number | null) => string | null;
}

export function RecruitingAnalysisEnhanced({ video, analyses, formatTimestamp }: RecruitingAnalysisProps) {
  const overallAnalysis = analyses?.find(a => a.type === 'overall');
  const playerEvaluations = analyses?.filter(a => a.type === 'player_evaluation') || [];
  const keyMoments = analyses?.filter(a => a.type === 'key_moment') || [];

  // Extract recruiting-specific metrics
  const recruitingMetrics = {
    totalEvaluations: playerEvaluations.length,
    avgConfidence: playerEvaluations.length > 0 
      ? Math.round(playerEvaluations.reduce((sum, p) => sum + p.confidence, 0) / playerEvaluations.length)
      : 0,
    collegePotential: {
      d1Ready: analyses.filter(a => 
        a.content.toLowerCase().includes('d1') ||
        a.content.toLowerCase().includes('division 1') ||
        a.content.toLowerCase().includes('elite') ||
        a.content.toLowerCase().includes('collegiate')
      ).length,
      d2Level: analyses.filter(a => 
        a.content.toLowerCase().includes('d2') ||
        a.content.toLowerCase().includes('division 2')
      ).length,
      d3Potential: analyses.filter(a => 
        a.content.toLowerCase().includes('d3') ||
        a.content.toLowerCase().includes('division 3')
      ).length
    },
    skillAreas: {
      athleticism: analyses.filter(a => 
        a.content.toLowerCase().includes('athletic') ||
        a.content.toLowerCase().includes('speed') ||
        a.content.toLowerCase().includes('agility')
      ).length,
      lacrosseIQ: analyses.filter(a => 
        a.content.toLowerCase().includes('iq') ||
        a.content.toLowerCase().includes('smart') ||
        a.content.toLowerCase().includes('vision')
      ).length,
      leadership: analyses.filter(a => 
        a.content.toLowerCase().includes('leader') ||
        a.content.toLowerCase().includes('vocal') ||
        a.content.toLowerCase().includes('captain')
      ).length,
      versatility: analyses.filter(a => 
        a.content.toLowerCase().includes('versatile') ||
        a.content.toLowerCase().includes('multiple positions') ||
        a.content.toLowerCase().includes('utility')
      ).length,
      clutch: analyses.filter(a => 
        a.content.toLowerCase().includes('clutch') ||
        a.content.toLowerCase().includes('pressure') ||
        a.content.toLowerCase().includes('big moment')
      ).length
    },
    developmentAreas: analyses.filter(a => 
      a.content.toLowerCase().includes('improve') ||
      a.content.toLowerCase().includes('develop') ||
      a.content.toLowerCase().includes('work on') ||
      a.content.toLowerCase().includes('needs')
    ).length,
    upside: keyMoments.filter(m => 
      m.content.toLowerCase().includes('potential') ||
      m.content.toLowerCase().includes('ceiling') ||
      m.content.toLowerCase().includes('room to grow')
    ).length
  };

  // Determine overall recruiting level
  const totalCollegeReady = Object.values(recruitingMetrics.collegePotential).reduce((sum, count) => sum + count, 0);
  const recruitingLevel = recruitingMetrics.collegePotential.d1Ready > 0 ? 'D1 Prospect' :
                         recruitingMetrics.collegePotential.d2Level > 0 ? 'D2 Prospect' :
                         recruitingMetrics.collegePotential.d3Potential > 0 ? 'D3 Prospect' :
                         totalCollegeReady > 0 ? 'College Potential' : 'Developing Player';

  // Calculate ceiling vs floor assessment
  const standoutPlays = keyMoments.filter(m => 
    m.content.toLowerCase().includes('excellent') ||
    m.content.toLowerCase().includes('outstanding') ||
    m.content.toLowerCase().includes('impressive')
  ).length;

  const consistency = recruitingMetrics.avgConfidence > 85 ? 'High' :
                     recruitingMetrics.avgConfidence > 70 ? 'Good' : 'Developing';

  return (
    <div className="space-y-6">
      {/* Recruiting Overview */}
      <Card className="border-gold-200 dark:border-yellow-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl">College Recruiting Assessment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Recruiting Level</span>
              </div>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{recruitingLevel}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{recruitingMetrics.avgConfidence}% confidence</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Consistency</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{consistency}</p>
              <p className="text-xs text-green-600 dark:text-green-400">{recruitingMetrics.totalEvaluations} evaluations</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Upside</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{standoutPlays}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Elite moments</p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Development</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{recruitingMetrics.developmentAreas}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Areas to improve</p>
            </div>
          </div>

          {/* College Level Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              College Division Assessment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(recruitingMetrics.collegePotential).map(([division, count]) => (
                <div key={division} className={`p-4 rounded-lg border ${
                  division === 'd1Ready' ? 'bg-gold-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' :
                  division === 'd2Level' ? 'bg-silver-50 dark:bg-gray-800/20 border-gray-300 dark:border-gray-600' :
                  'bg-bronze-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{division.replace(/([A-Z])/g, ' $1').replace(/^d/, 'D').replace(/Ready/, ' Ready').replace(/Level/, ' Level').replace(/Potential/, ' Potential')}</span>
                    <Badge variant={count > 0 ? "default" : "outline"}>{count}</Badge>
                  </div>
                  <Progress value={Math.min((count / Math.max(...Object.values(recruitingMetrics.collegePotential))) * 100, 100)} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Skill Assessment for Recruiting */}
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Recruiting Attributes
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(recruitingMetrics.skillAreas).map(([skill, count]) => (
                <div key={skill} className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                    <Badge variant={count > 0 ? "default" : "outline"}>{count}</Badge>
                  </div>
                  <Progress value={Math.min((count / Math.max(...Object.values(recruitingMetrics.skillAreas))) * 100, 100)} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Recruiting Analysis */}
      {overallAnalysis && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-blue-600" />
              <CardTitle>Recruiting Tape Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              {overallAnalysis.content}
            </p>
          </CardContent>
        </Card>
      )}

      {/* College Readiness Evaluation */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <CardTitle>College Readiness Assessment</CardTitle>
            <Badge variant="outline">{playerEvaluations.length} evaluations</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {playerEvaluations.map((evaluation, index) => (
              <div key={evaluation.id} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(evaluation.timestamp) || 'N/A'}
                    </Badge>
                    <Badge variant="outline">
                      {evaluation.confidence}% confidence
                    </Badge>
                  </div>
                  {(evaluation.content.toLowerCase().includes('d1') || evaluation.content.toLowerCase().includes('elite')) && (
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                      <Star className="w-3 h-3 mr-1" />
                      High Level
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {evaluation.content}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Standout Moments for Recruiting */}
      {keyMoments.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-b">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-600" />
              <CardTitle>Highlight Reel Moments</CardTitle>
              <Badge variant="outline">{keyMoments.length} moments</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {keyMoments.map((moment, index) => (
                <div key={moment.id} className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-yellow-500 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(moment.timestamp) || 'N/A'}
                    </Badge>
                    <Badge variant="outline">
                      {moment.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {moment.content}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}