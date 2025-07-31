import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";

import { DrillAnalysis } from "@/components/video-type-analysis/drill-analysis";
import { HighlightAnalysisEnhanced } from "@/components/video-type-analysis/highlight-analysis-enhanced";
import { RecruitingAnalysisEnhanced } from "@/components/video-type-analysis/recruiting-analysis-enhanced";
import { PracticeAnalysisEnhanced } from "@/components/video-type-analysis/practice-analysis-enhanced";
import { ScrimmageAnalysisEnhanced } from "@/components/video-type-analysis/scrimmage-analysis-enhanced";
import { GameAnalysisMinimal } from "@/components/video-type-analysis/game-analysis-minimal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Video, 
  Users, 
  Target, 
  Clock, 
  Download, 
  ArrowLeft,
  Play,
  Trophy,
  TrendingUp,
  AlertCircle,
  LoaderPinwheel,
  BarChart3,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  Info,
  Zap
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface AnalysisSection {
  id: string;
  title: string;
  icon: any;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function AnalysisDetail() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { id } = useParams();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [showConfidenceInfo, setShowConfidenceInfo] = useState(false);



  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch video details
  const { data: video, isLoading: videoLoading, error: videoError } = useQuery({
    queryKey: [`/api/videos/${id}`],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  // Fetch analyses for the video
  const { data: analyses = [], isLoading: analysesLoading, error: analysesError } = useQuery({
    queryKey: [`/api/videos/${id}/analyses`],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  // Handle errors
  useEffect(() => {
    if (videoError && isUnauthorizedError(videoError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [videoError, toast]);

  // Loading state
  if (isLoading || videoLoading || analysesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Card className="shadow-soft">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <LoaderPinwheel className="w-12 h-12 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-semibold">Loading analysis...</h3>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Not found
  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Video not found</h2>
                <p className="text-muted-foreground mb-4">
                  The video you're looking for doesn't exist or you don't have access to it.
                </p>
                <Link href="/videos">
                  <Button>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Videos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: number | null): string => {
    if (!timestamp) return '';
    const minutes = Math.floor(timestamp / 60);
    const seconds = timestamp % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Group analyses by type
  const overallAnalysis = (analyses as any[]).find(a => a.type === 'overall');
  const playerEvaluations = (analyses as any[]).filter(a => a.type === 'player_evaluation');
  const faceOffAnalyses = (analyses as any[]).filter(a => a.type === 'face_off');
  const transitionAnalyses = (analyses as any[]).filter(a => a.type === 'transition');
  const keyMoments = (analyses as any[]).filter(a => a.type === 'key_moment');

  // Create sections data
  const analysisSections: AnalysisSection[] = [
    {
      id: 'overview',
      title: 'Overall Analysis',
      icon: Trophy,
      count: overallAnalysis ? 1 : 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'players',
      title: 'Player Analysis',
      icon: Users,
      count: playerEvaluations.length,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'faceoffs',
      title: 'Face-off Analysis',
      icon: Target,
      count: faceOffAnalyses.length,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      id: 'transitions',
      title: 'Transition Analysis',
      icon: TrendingUp,
      count: transitionAnalyses.length,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-800'
    },
    {
      id: 'moments',
      title: 'Key Moments',
      icon: Sparkles,
      count: keyMoments.length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      id: 'detailed',
      title: 'Detailed Metrics',
      icon: BarChart3,
      count: playerEvaluations.length > 0 ? 1 : 0,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
    }
  ];

  // Filter out empty sections
  const activeSections = analysisSections.filter(section => section.count > 0);

  // Determine video type from metadata or title
  const videoType = (video as any).metadata?.videoType || 
    ((video as any).title?.toLowerCase().includes('drill') || 
     (video as any).title?.toLowerCase().includes('training') || 
     (video as any).title?.toLowerCase().includes('shooting') ? 'drill' : 
    (video as any).title?.toLowerCase().includes('highlight') ? 'highlight' :
    (video as any).title?.toLowerCase().includes('recruiting') ? 'recruiting' :
    (video as any).title?.toLowerCase().includes('practice') ? 'practice' :
    (video as any).title?.toLowerCase().includes('scrimmage') ? 'scrimmage' : 'game');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Mobile-Optimized Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/videos">
              <Button variant="ghost" size="sm" className="px-2 sm:px-4">
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant={(video as any).status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                {(video as any).status}
              </Badge>
              {(video as any).status === 'completed' && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="text-xs sm:text-sm px-3 sm:px-4"
                  onClick={async () => {
                    // Group analyses by type
                    const overallAnalysis = (analyses as any[]).find(a => a.type === 'overall');
                    const playerEvaluations = (analyses as any[]).filter(a => a.type === 'player_evaluation');
                    const faceOffAnalyses = (analyses as any[]).filter(a => a.type === 'face_off');
                    const transitionAnalyses = (analyses as any[]).filter(a => a.type === 'transition');
                    const keyMoments = (analyses as any[]).filter(a => a.type === 'key_moment');
                    
                    // Create PDF using jsPDF with proper formatting
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
                      return lines.length * (fontSize * 0.35);
                    };
                    
                    // Helper function to format timestamp
                    const formatTimestamp = (timestamp: number) => {
                      const minutes = Math.floor(timestamp / 60);
                      const seconds = Math.floor(timestamp % 60);
                      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    };
                    
                    // Header with video info
                    pdf.setFillColor(59, 130, 246);
                    pdf.rect(0, 0, pageWidth, 45, 'F');
                    
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(24);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text((video as any).title, margin, 25);
                    
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'normal');
                    const duration = (video as any).duration ? `${Math.floor((video as any).duration / 60)}:${((video as any).duration % 60).toString().padStart(2, '0')}` : 'Unknown duration';
                    const subtitle = `${videoType || 'Game'} Analysis • ${duration} • ${new Date((video as any).createdAt).toLocaleDateString()}`;
                    pdf.text(subtitle, margin, 38);
                    
                    yPos = 55;
                    pdf.setTextColor(0, 0, 0);
                    
                    // Summary Statistics
                    const totalAnalyses = (analyses as any[]).length;
                    if (totalAnalyses > 0) {
                      checkPageBreak(40);
                      
                      pdf.setFontSize(18);
                      pdf.setFont('helvetica', 'bold');
                      pdf.text('📊 Analysis Summary', margin, yPos);
                      yPos += 15;
                      
                      // Statistics boxes
                      const stats = [
                        ['Total Analyses', totalAnalyses.toString()],
                        ['Player Evaluations', playerEvaluations.length.toString()],
                        ['Face-offs', faceOffAnalyses.length.toString()],
                        ['Transitions', transitionAnalyses.length.toString()]
                      ];
                      
                      const boxWidth = (usableWidth - 15) / 4;
                      const boxHeight = 20;
                      
                      stats.forEach((stat, index) => {
                        const x = margin + (index * (boxWidth + 5));
                        
                        // Draw box
                        pdf.setFillColor(243, 244, 246);
                        pdf.rect(x, yPos, boxWidth, boxHeight, 'F');
                        pdf.setDrawColor(229, 231, 235);
                        pdf.rect(x, yPos, boxWidth, boxHeight, 'S');
                        
                        // Add number
                        pdf.setFontSize(16);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setTextColor(37, 99, 235);
                        const numWidth = pdf.getTextWidth(stat[1]);
                        pdf.text(stat[1], x + (boxWidth - numWidth) / 2, yPos + 8);
                        
                        // Add label
                        pdf.setFontSize(8);
                        pdf.setFont('helvetica', 'normal');
                        pdf.setTextColor(107, 114, 128);
                        const labelWidth = pdf.getTextWidth(stat[0]);
                        pdf.text(stat[0], x + (boxWidth - labelWidth) / 2, yPos + 16);
                      });
                      
                      yPos += 35;
                      pdf.setTextColor(0, 0, 0);
                    }
                    
                    // Overall Analysis Section
                    if (overallAnalysis) {
                      checkPageBreak(40);
                      
                      pdf.setFontSize(18);
                      pdf.setFont('helvetica', 'bold');
                      pdf.text('🎯 Overall Analysis', margin, yPos);
                      yPos += 15;
                      
                      // Background box
                      const contentHeight = addWrappedText(overallAnalysis.content, 0, 0, usableWidth - 10, 10) + 10;
                      checkPageBreak(contentHeight + 20);
                      
                      pdf.setFillColor(243, 244, 246);
                      pdf.rect(margin, yPos - 5, usableWidth, contentHeight + 15, 'F');
                      
                      const textHeight = addWrappedText(overallAnalysis.content, margin + 5, yPos + 5, usableWidth - 10, 10);
                      yPos += textHeight + 15;
                      
                      if (overallAnalysis.confidence) {
                        pdf.setFontSize(8);
                        pdf.setTextColor(107, 114, 128);
                        pdf.text(`Confidence: ${overallAnalysis.confidence}%`, margin + 5, yPos);
                        yPos += 8;
                      }
                      
                      yPos += 15;
                      pdf.setTextColor(0, 0, 0);
                    }
                    
                    // Player Evaluations Section
                    if (playerEvaluations.length > 0) {
                      checkPageBreak(30);
                      
                      pdf.setFontSize(18);
                      pdf.setFont('helvetica', 'bold');
                      pdf.text(`👤 Player Evaluations (${playerEvaluations.length})`, margin, yPos);
                      yPos += 15;
                      
                      playerEvaluations.slice(0, 10).forEach((evaluation, index) => {
                        checkPageBreak(35);
                        
                        // Header
                        pdf.setFillColor(249, 250, 251);
                        pdf.rect(margin, yPos - 5, usableWidth, 12, 'F');
                        
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setTextColor(55, 65, 81);
                        pdf.text(evaluation.title || `Player Evaluation ${index + 1}`, margin + 5, yPos + 3);
                        
                        const headerRight = `${evaluation.timestamp ? `@ ${formatTimestamp(evaluation.timestamp)}` : ''} • ${evaluation.confidence}% confidence`;
                        const headerRightWidth = pdf.getTextWidth(headerRight);
                        
                        pdf.setFontSize(9);
                        pdf.setTextColor(107, 114, 128);
                        pdf.text(headerRight, pageWidth - margin - headerRightWidth - 5, yPos + 3);
                        
                        yPos += 12;
                        
                        // Content
                        pdf.setTextColor(75, 85, 99);
                        const textHeight = addWrappedText(evaluation.content, margin + 5, yPos, usableWidth - 10, 9);
                        yPos += textHeight + 10;
                      });
                      
                      if (playerEvaluations.length > 10) {
                        pdf.setFontSize(10);
                        pdf.setTextColor(107, 114, 128);
                        pdf.text(`... and ${playerEvaluations.length - 10} more evaluations`, margin, yPos);
                        yPos += 15;
                      }
                    }
                    
                    // Other analysis sections (face-offs, transitions, key moments)
                    const sections = [
                      { data: faceOffAnalyses, title: '⚔️ Face-off Analysis', name: 'Face-off' },
                      { data: transitionAnalyses, title: '🏃 Transition Analysis', name: 'Transition' },
                      { data: keyMoments, title: '⭐ Key Moments', name: 'Moment' }
                    ];
                    
                    sections.forEach(section => {
                      if (section.data.length > 0) {
                        checkPageBreak(30);
                        
                        pdf.setFontSize(18);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(`${section.title} (${section.data.length})`, margin, yPos);
                        yPos += 15;
                        
                        section.data.slice(0, 8).forEach((item, index) => {
                          checkPageBreak(30);
                          
                          // Header
                          pdf.setFillColor(249, 250, 251);
                          pdf.rect(margin, yPos - 5, usableWidth, 12, 'F');
                          
                          pdf.setFontSize(12);
                          pdf.setFont('helvetica', 'bold');
                          pdf.setTextColor(55, 65, 81);
                          pdf.text(item.title || `${section.name} ${index + 1}`, margin + 5, yPos + 3);
                          
                          const headerRight = `${item.timestamp ? `@ ${formatTimestamp(item.timestamp)}` : ''} • ${item.confidence}% confidence`;
                          const headerRightWidth = pdf.getTextWidth(headerRight);
                          
                          pdf.setFontSize(9);
                          pdf.setTextColor(107, 114, 128);
                          pdf.text(headerRight, pageWidth - margin - headerRightWidth - 5, yPos + 3);
                          
                          yPos += 12;
                          
                          // Content
                          pdf.setTextColor(75, 85, 99);
                          const textHeight = addWrappedText(item.content, margin + 5, yPos, usableWidth - 10, 9);
                          yPos += textHeight + 10;
                        });
                      }
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
                    pdf.save(`${(video as any).title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-analysis.pdf`);
                  }}
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Export
                </Button>
              )}
              {(video as any).youtubeUrl && (
                <Button 
                  size="sm"
                  className="btn-primary text-xs sm:text-sm px-3 sm:px-4"
                  onClick={() => window.open((video as any).youtubeUrl, '_blank')}
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Watch
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Mobile-Optimized Video Info */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">{(video as any).title}</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            <span>{videoType || 'Game'} Analysis</span>
            {(video as any).duration && (
              <span>• {Math.floor((video as any).duration / 60)}:{((video as any).duration % 60).toString().padStart(2, '0')}</span>
            )}
            <span>• {new Date((video as any).createdAt).toLocaleDateString()}</span>
          </div>
          
          {/* Mobile-Optimized Thumbnail */}
          {(video as any).thumbnailUrl && (
            <div className="relative w-full max-w-full sm:max-w-md aspect-video rounded-lg overflow-hidden bg-gray-900 mb-4">
              <img 
                src={(video as any).thumbnailUrl} 
                alt={(video as any).title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Analysis Content - Compact */}
        {(video as any).status === 'completed' ? (
          <div className="max-w-full">
            {(() => {
              switch (videoType) {
                case 'drill':
                  return <DrillAnalysis video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                case 'highlight':
                  return <HighlightAnalysisEnhanced video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                case 'recruiting':
                  return <RecruitingAnalysisEnhanced video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                case 'practice':
                  return <PracticeAnalysisEnhanced video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                case 'scrimmage':
                  return <ScrimmageAnalysisEnhanced video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
                case 'game':
                default:
                  return <GameAnalysisMinimal video={video as any} analyses={analyses as any[]} formatTimestamp={formatTimestamp} />;
              }
            })()}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <LoaderPinwheel className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analysis in Progress</h3>
                <p className="text-muted-foreground">This may take a few minutes...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}