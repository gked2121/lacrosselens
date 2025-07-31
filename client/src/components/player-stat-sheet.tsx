import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Activity, 
  Shield, 
  Zap,
  Timer,
  BarChart3,
  Award,
  Star,
  UserCheck,
  Video,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PlayerEvaluation {
  id: number;
  title: string;
  content: string;
  timestamp?: number;
  confidence: number;
  metadata?: {
    playerNumber?: string;
    skillArea?: string;
    position?: string;
    action?: string;
  };
}

interface PlayerStatSheetProps {
  playerKey: string;
  evaluations: PlayerEvaluation[];
  formatTimestamp: (timestamp: number) => string;
}

export default function PlayerStatSheet({ 
  playerKey, 
  evaluations, 
  formatTimestamp 
}: PlayerStatSheetProps) {
  // Extract player number and position
  const playerNumber = evaluations[0]?.metadata?.playerNumber || 
                      playerKey.match(/#?(\d+)/)?.[1] || 
                      playerKey;
  
  // Determine position from evaluations
  const positions = new Set<string>();
  evaluations.forEach(evaluation => {
    const content = evaluation.content.toLowerCase();
    if (content.includes('attack') || content.includes('offensive')) positions.add('Attack');
    if (content.includes('midfield') || content.includes('middie')) positions.add('Midfield');
    if (content.includes('defense') || content.includes('defensive')) positions.add('Defense');
    if (content.includes('goalie') || content.includes('goalkeeper')) positions.add('Goalie');
    if (content.includes('fogo') || content.includes('face-off')) positions.add('FOGO');
    if (content.includes('lsm')) positions.add('LSM');
  });
  const position = Array.from(positions).join('/') || 'Unknown';

  // Calculate statistics from evaluations
  const stats = {
    totalClips: evaluations.length,
    avgConfidence: Math.round(evaluations.reduce((sum, e) => sum + e.confidence, 0) / evaluations.length),
    timeRange: evaluations.length > 0 ? {
      start: Math.min(...evaluations.map(e => e.timestamp || 0)),
      end: Math.max(...evaluations.map(e => e.timestamp || 0))
    } : null,
    skills: new Map<string, number>(),
    actions: new Map<string, number>(),
    strengths: [] as string[],
    improvements: [] as string[]
  };

  // Analyze content for skills and actions
  evaluations.forEach(evaluation => {
    const content = evaluation.content.toLowerCase();
    
    // Track skills mentioned
    if (content.includes('dodg')) stats.skills.set('Dodging', (stats.skills.get('Dodging') || 0) + 1);
    if (content.includes('shot') || content.includes('shoot')) stats.skills.set('Shooting', (stats.skills.get('Shooting') || 0) + 1);
    if (content.includes('pass')) stats.skills.set('Passing', (stats.skills.get('Passing') || 0) + 1);
    if (content.includes('ground ball')) stats.skills.set('Ground Balls', (stats.skills.get('Ground Balls') || 0) + 1);
    if (content.includes('face-off') || content.includes('faceoff')) stats.skills.set('Face-offs', (stats.skills.get('Face-offs') || 0) + 1);
    if (content.includes('clear')) stats.skills.set('Clearing', (stats.skills.get('Clearing') || 0) + 1);
    if (content.includes('defense') || content.includes('defend')) stats.skills.set('Defense', (stats.skills.get('Defense') || 0) + 1);
    if (content.includes('transition')) stats.skills.set('Transition', (stats.skills.get('Transition') || 0) + 1);
    
    // Track specific actions
    if (content.includes('goal')) stats.actions.set('Goals', (stats.actions.get('Goals') || 0) + 1);
    if (content.includes('assist')) stats.actions.set('Assists', (stats.actions.get('Assists') || 0) + 1);
    if (content.includes('save')) stats.actions.set('Saves', (stats.actions.get('Saves') || 0) + 1);
    if (content.includes('caused turnover')) stats.actions.set('Caused Turnovers', (stats.actions.get('Caused Turnovers') || 0) + 1);
    
    // Extract strengths and areas for improvement
    if (content.includes('excellent') || content.includes('strong') || content.includes('impressive')) {
      const strengthMatch = content.match(/(excellent|strong|impressive)\s+(\w+\s*\w*)/);
      if (strengthMatch && !stats.strengths.includes(strengthMatch[2])) {
        stats.strengths.push(strengthMatch[2]);
      }
    }
    
    if (content.includes('improve') || content.includes('work on') || content.includes('needs')) {
      const improvementMatch = content.match(/(improve|work on|needs)\s+(\w+\s*\w*)/);
      if (improvementMatch && !stats.improvements.includes(improvementMatch[2])) {
        stats.improvements.push(improvementMatch[2]);
      }
    }
  });

  // Sort skills by frequency
  const topSkills = Array.from(stats.skills.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Export functionality
  const handleExport = async () => {
    const playerNumber = evaluations[0]?.metadata?.playerNumber || 
                        playerKey.match(/#?(\d+)/)?.[1] || 
                        playerKey;
    
    // Create a hidden div to render the content
    const exportDiv = document.createElement('div');
    exportDiv.style.position = 'absolute';
    exportDiv.style.left = '-9999px';
    exportDiv.style.width = '800px';
    exportDiv.style.backgroundColor = 'white';
    exportDiv.style.padding = '40px';
    exportDiv.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(exportDiv);
    
    // Build the HTML content matching the web UI style
    exportDiv.innerHTML = `
      <div style="margin-bottom: 30px;">
        <h1 style="font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">
          Player #${playerNumber} Analysis Report
        </h1>
        <p style="color: #6b7280; font-size: 14px;">
          ${position} • ${stats.totalClips} clips analyzed • ${stats.avgConfidence}% avg confidence
        </p>
        ${stats.timeRange ? `<p style="color: #6b7280; font-size: 12px;">Time Range: ${formatTimestamp(stats.timeRange.start)} - ${formatTimestamp(stats.timeRange.end)}</p>` : ''}
      </div>
      
      ${Array.from(stats.actions.entries()).length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">Performance Metrics</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            ${Array.from(stats.actions.entries()).slice(0, 4).map(([action, count]) => `
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${count}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">${action}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      ${topSkills.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">Skills Analysis</h2>
          ${topSkills.map(([skill, count]) => `
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #4b5563;">${skill}</span>
                <span style="color: #6b7280; font-size: 14px;">${count} mentions</span>
              </div>
              <div style="background-color: #e5e7eb; height: 8px; border-radius: 4px;">
                <div style="background-color: #3b82f6; height: 100%; width: ${(count / stats.totalClips) * 100}%; border-radius: 4px;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">Detailed Evaluations</h2>
        ${evaluations.slice(0, 10).map((evaluation, index) => `
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-weight: bold; color: #374151;">Clip ${index + 1}</span>
              <span style="color: #6b7280; font-size: 14px;">
                ${evaluation.timestamp ? `@ ${formatTimestamp(evaluation.timestamp)}` : ''} • ${evaluation.confidence}% confidence
              </span>
            </div>
            <p style="color: #4b5563; line-height: 1.6;">${evaluation.content}</p>
          </div>
        `).join('')}
        ${evaluations.length > 10 ? `<p style="color: #6b7280; font-style: italic;">... and ${evaluations.length - 10} more clips</p>` : ''}
      </div>
      
      ${stats.strengths.length > 0 || stats.improvements.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 15px;">Summary</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
            ${stats.strengths.length > 0 ? `
              <div>
                <h3 style="font-size: 16px; font-weight: bold; color: #059669; margin-bottom: 10px;">Key Strengths</h3>
                <ul style="list-style: none; padding: 0;">
                  ${stats.strengths.map(strength => `
                    <li style="margin-bottom: 5px; color: #4b5563;">• ${strength}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            ${stats.improvements.length > 0 ? `
              <div>
                <h3 style="font-size: 16px; font-weight: bold; color: #ea580c; margin-bottom: 10px;">Areas to Develop</h3>
                <ul style="list-style: none; padding: 0;">
                  ${stats.improvements.map(improvement => `
                    <li style="margin-bottom: 5px; color: #4b5563;">• ${improvement}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
    `;
    
    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(exportDiv, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 295; // A4 height in mm
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save PDF
      pdf.save(`player-${playerNumber}-analysis.pdf`);
    } finally {
      // Clean up
      document.body.removeChild(exportDiv);
    }
  };

  return (
    <Card className="shadow-soft hover:shadow-glow transition-all">
      {/* Player Header */}
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">#{playerNumber}</span>
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Player #{playerNumber}
                <Badge variant="secondary">{position}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.totalClips} clips analyzed • {stats.avgConfidence}% avg confidence
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button 
              onClick={handleExport}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Badge variant="outline" className="text-xs">
              <Timer className="w-3 h-3 mr-1" />
              {stats.timeRange && `${formatTimestamp(stats.timeRange.start)} - ${formatTimestamp(stats.timeRange.end)}`}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from(stats.actions.entries()).slice(0, 4).map(([action, count]) => (
            <div key={action} className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{count}</div>
              <div className="text-xs text-muted-foreground">{action}</div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Skills Analysis */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            Skills Analysis
          </h4>
          <div className="space-y-3">
            {topSkills.map(([skill, count]) => (
              <div key={skill} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{skill}</span>
                  <span className="text-xs font-medium">{count} mentions</span>
                </div>
                <Progress value={(count / stats.totalClips) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* All Clips Timeline */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Video className="w-4 h-4 text-primary" />
            All Clips ({evaluations.length})
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {evaluations.map((evaluation, index) => (
              <div key={evaluation.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Clip {index + 1}
                    </Badge>
                    {evaluation.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        @ {formatTimestamp(evaluation.timestamp)}
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {evaluation.confidence}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {evaluation.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvements */}
        {(stats.strengths.length > 0 || stats.improvements.length > 0) && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-green-600" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {stats.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span className="capitalize">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {stats.improvements.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-orange-600" />
                    Areas to Develop
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {stats.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span className="capitalize">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {/* Overall Rating */}
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-semibold">Overall Performance</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(stats.avgConfidence / 20)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}