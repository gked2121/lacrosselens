import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LoaderPinwheel, Target, Shield, Clock, Percent, ArrowRight } from "lucide-react";

interface VideoFaceoffAnalysesProps {
  video: any;
  formatTimestamp: (seconds: number) => string;
}

export default function VideoFaceoffAnalyses({ video, formatTimestamp }: VideoFaceoffAnalysesProps) {
  // Fetch analyses for this specific video
  const { data: analyses, isLoading } = useQuery({
    queryKey: [`/api/videos/${video.id}/analyses`],
  });

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="py-8 text-center">
          <LoaderPinwheel className="w-6 h-6 animate-spin text-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  // Filter for face-off analyses
  const faceoffAnalyses = (analyses as any[])?.filter((a: any) => a.type === 'face_off') || [];

  if (faceoffAnalyses.length === 0) {
    return null;
  }

  // Calculate aggregate stats
  const avgWinProbability = faceoffAnalyses.reduce((sum: number, fo: any) => 
    sum + (fo.metadata?.winProbability || 0), 0
  ) / faceoffAnalyses.length;

  const avgConfidence = faceoffAnalyses.reduce((sum: number, fo: any) => 
    sum + fo.confidence, 0
  ) / faceoffAnalyses.length;

  return (
    <Card className="shadow-soft hover:shadow-glow transition-all">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{video.title}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {faceoffAnalyses.length} Face-offs
            </Badge>
            <Badge 
              className={`${
                avgWinProbability >= 70 
                  ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                  : avgWinProbability >= 50
                  ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
              }`}
            >
              <Percent className="w-3 h-3 mr-1" />
              {Math.round(avgWinProbability)}% Avg Win
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pb-4 border-b">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Analyzed</p>
              <p className="text-xl font-bold">{faceoffAnalyses.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-xl font-bold text-primary">{Math.round(avgWinProbability)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Confidence</p>
              <p className="text-xl font-bold">{Math.round(avgConfidence)}%</p>
            </div>
          </div>

          {/* Individual Face-offs */}
          {faceoffAnalyses.map((faceoff: any, index: number) => (
            <div key={faceoff.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium">Face-off #{index + 1}</span>
                  {faceoff.timestamp && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(faceoff.timestamp)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {faceoff.metadata?.winProbability && (
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        faceoff.metadata.winProbability >= 70 
                          ? 'text-green-600 border-green-500/50' 
                          : faceoff.metadata.winProbability >= 50
                          ? 'text-yellow-600 border-yellow-500/50'
                          : 'text-red-600 border-red-500/50'
                      }`}
                    >
                      {faceoff.metadata.winProbability}% Win
                    </Badge>
                  )}
                  {faceoff.metadata?.technique && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      {faceoff.metadata.technique}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Analysis Content Preview */}
              <div className="pl-6 text-sm text-muted-foreground">
                {faceoff.content.split('\n')[0].substring(0, 150)}...
              </div>
            </div>
          ))}
          
          {/* View Full Analysis Button */}
          <div className="mt-4 pt-4 border-t">
            <Link href={`/analysis/${video.id}?tab=faceoffs`}>
              <Button className="w-full" variant="outline">
                View Full Face-off Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}