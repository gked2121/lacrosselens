import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LoaderPinwheel, Zap, TrendingUp, Clock, Percent, ArrowRight, Activity } from "lucide-react";

interface VideoTransitionAnalysesProps {
  video: any;
  formatTimestamp: (seconds: number) => string;
}

export default function VideoTransitionAnalyses({ video, formatTimestamp }: VideoTransitionAnalysesProps) {
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

  // Filter for transition analyses
  const transitionAnalyses = (analyses as any[])?.filter((a: any) => a.type === 'transition') || [];

  if (transitionAnalyses.length === 0) {
    return null;
  }

  // Calculate aggregate stats
  const avgSuccessRate = transitionAnalyses.reduce((sum: number, t: any) => 
    sum + (t.metadata?.successProbability || 0), 0
  ) / transitionAnalyses.length;

  const avgConfidence = transitionAnalyses.reduce((sum: number, t: any) => 
    sum + t.confidence, 0
  ) / transitionAnalyses.length;

  return (
    <Card className="shadow-soft hover:shadow-glow transition-all">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{video.title}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {transitionAnalyses.length} Transitions
            </Badge>
            <Badge 
              className={`${
                avgSuccessRate >= 70 
                  ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                  : avgSuccessRate >= 50
                  ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
              }`}
            >
              <Activity className="w-3 h-3 mr-1" />
              {Math.round(avgSuccessRate)}% Success Rate
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
              <p className="text-xl font-bold">{transitionAnalyses.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-xl font-bold text-primary">{Math.round(avgSuccessRate)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Confidence</p>
              <p className="text-xl font-bold">{Math.round(avgConfidence)}%</p>
            </div>
          </div>

          {/* Individual Transitions */}
          {transitionAnalyses.map((transition: any, index: number) => (
            <div key={transition.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-medium">Transition #{index + 1}</span>
                  {transition.timestamp && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(transition.timestamp)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {transition.metadata?.successProbability && (
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        transition.metadata.successProbability >= 70 
                          ? 'text-green-600 border-green-500/50' 
                          : transition.metadata.successProbability >= 50
                          ? 'text-yellow-600 border-yellow-500/50'
                          : 'text-red-600 border-red-500/50'
                      }`}
                    >
                      {transition.metadata.successProbability}% Success
                    </Badge>
                  )}
                  {transition.metadata?.type && (
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {transition.metadata.type}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Analysis Content Preview */}
              <div className="pl-6 text-sm text-muted-foreground">
                {transition.content.split('\n')[0].substring(0, 150)}...
              </div>
            </div>
          ))}
          
          {/* View Full Analysis Button */}
          <div className="mt-4 pt-4 border-t">
            <Link href={`/analysis/${video.id}?tab=transitions`}>
              <Button className="w-full" variant="outline">
                View Full Transition Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}