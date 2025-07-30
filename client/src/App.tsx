import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import VideoLibrary from "@/pages/video-library";
import AnalysisDetail from "@/pages/analysis-detail";
import FaceoffAnalysis from "@/pages/faceoff-analysis";
import TransitionAnalysis from "@/pages/transition-analysis";
import PlayerEvaluation from "@/pages/player-evaluation";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={isLoading || !isAuthenticated ? Landing : Dashboard} />
      <Route path="/videos" component={VideoLibrary} />
      <Route path="/analysis/players" component={PlayerEvaluation} />
      <Route path="/analysis/faceoffs" component={FaceoffAnalysis} />
      <Route path="/analysis/transitions" component={TransitionAnalysis} />
      <Route path="/analysis/:id" component={AnalysisDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
