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

  // Export functionality with enhanced formatting
  const handleExport = async () => {
    const playerNumber = evaluations[0]?.metadata?.playerNumber || 
                        playerKey.match(/#?(\d+)/)?.[1] || 
                        playerKey;
    
    // Create PDF using jsPDF with proper text formatting
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const usableWidth = pageWidth - (2 * margin);
    let yPos = margin;
    
    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };
    
    // Helper function to wrap text
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return lines.length * (fontSize * 0.35); // Return height used
    };
    
    // Header with player info
    pdf.setFillColor(59, 130, 246); // Blue background
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Player #${playerNumber} Analysis Report`, margin, 25);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${position} • ${stats.totalClips} clips analyzed • ${stats.avgConfidence}% avg confidence`, margin, 35);
    
    yPos = 50;
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Performance Metrics Section
    if (Array.from(stats.actions.entries()).length > 0) {
      checkPageBreak(50);
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🎯 Performance Metrics', margin, yPos);
      yPos += 15;
      
      // Draw metrics in a grid
      const metrics = Array.from(stats.actions.entries()).slice(0, 4);
      const boxWidth = (usableWidth - 10) / 2;
      const boxHeight = 25;
      
      metrics.forEach((metric, index) => {
        const [action, count] = metric;
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = margin + (col * (boxWidth + 5));
        const y = yPos + (row * (boxHeight + 5));
        
        // Draw box
        pdf.setFillColor(243, 244, 246); // Light gray
        pdf.rect(x, y, boxWidth, boxHeight, 'F');
        pdf.setDrawColor(229, 231, 235); // Border
        pdf.rect(x, y, boxWidth, boxHeight, 'S');
        
        // Add count
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235); // Blue
        const countText = count.toString();
        const countWidth = pdf.getTextWidth(countText);
        pdf.text(countText, x + (boxWidth - countWidth) / 2, y + 12);
        
        // Add label
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128); // Gray
        const labelWidth = pdf.getTextWidth(action);
        pdf.text(action, x + (boxWidth - labelWidth) / 2, y + 20);
      });
      
      yPos += Math.ceil(metrics.length / 2) * 30 + 15;
      pdf.setTextColor(0, 0, 0);
    }
    
    // Skills Analysis Section
    if (topSkills.length > 0) {
      checkPageBreak(60);
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('⚡ Skills Analysis', margin, yPos);
      yPos += 15;
      
      topSkills.forEach(([skill, count]) => {
        checkPageBreak(15);
        
        // Skill name and count
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(skill, margin, yPos);
        pdf.text(`${count} mentions`, pageWidth - margin - 30, yPos);
        
        yPos += 5;
        
        // Progress bar
        const barWidth = usableWidth - 40;
        const percentage = (count / stats.totalClips) * 100;
        const fillWidth = (barWidth * percentage) / 100;
        
        // Background bar
        pdf.setFillColor(229, 231, 235);
        pdf.rect(margin, yPos, barWidth, 3, 'F');
        
        // Fill bar
        pdf.setFillColor(59, 130, 246);
        pdf.rect(margin, yPos, fillWidth, 3, 'F');
        
        yPos += 10;
      });
      
      yPos += 10;
    }
    
    // Summary Section (Strengths & Development Areas)
    if (stats.strengths.length > 0 || stats.improvements.length > 0) {
      checkPageBreak(40);
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📊 Summary', margin, yPos);
      yPos += 15;
      
      const columnWidth = (usableWidth - 10) / 2;
      
      // Strengths column
      if (stats.strengths.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(5, 150, 105); // Green
        pdf.text('✓ Key Strengths', margin, yPos);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        let strengthsY = yPos + 8;
        stats.strengths.slice(0, 5).forEach(strength => {
          pdf.text(`• ${strength}`, margin + 5, strengthsY);
          strengthsY += 6;
        });
      }
      
      // Development areas column
      if (stats.improvements.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(234, 88, 12); // Orange
        pdf.text('⚠ Areas to Develop', margin + columnWidth + 5, yPos);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        let improvementsY = yPos + 8;
        stats.improvements.slice(0, 5).forEach(improvement => {
          pdf.text(`• ${improvement}`, margin + columnWidth + 10, improvementsY);
          improvementsY += 6;
        });
      }
      
      yPos += Math.max(stats.strengths.length, stats.improvements.length) * 6 + 20;
    }
    
    // Detailed Evaluations Section
    checkPageBreak(30);
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('📝 Detailed Evaluations', margin, yPos);
    yPos += 15;
    
    evaluations.slice(0, 8).forEach((evaluation, index) => {
      checkPageBreak(35);
      
      // Evaluation header
      pdf.setFillColor(249, 250, 251); // Very light gray
      pdf.rect(margin, yPos - 5, usableWidth, 15, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 65, 81);
      pdf.text(`Clip ${index + 1}`, margin + 5, yPos + 5);
      
      const confidenceText = `${evaluation.confidence}% confidence`;
      const timeText = evaluation.timestamp ? `@ ${formatTimestamp(evaluation.timestamp)}` : '';
      const headerRight = `${timeText} ${confidenceText}`;
      const headerRightWidth = pdf.getTextWidth(headerRight);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text(headerRight, pageWidth - margin - headerRightWidth - 5, yPos + 5);
      
      yPos += 15;
      
      // Evaluation content
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      const textHeight = addWrappedText(evaluation.content, margin + 5, yPos, usableWidth - 10, 10);
      yPos += textHeight + 10;
    });
    
    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Generated by LacrosseLens AI • Page ${i} of ${totalPages}`, margin, pageHeight - 10);
      pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, pageHeight - 10);
    }
    
    // Save PDF
    pdf.save(`player-${playerNumber}-analysis.pdf`);
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