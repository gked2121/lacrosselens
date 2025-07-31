import { Router } from "express";
import { isAuthenticated } from "../replitAuth";
import { EnhancedAnalyticsService } from "../services/enhancedAnalytics";

const router = Router();

// Get player performance metrics
router.get("/player/:playerId/performance", isAuthenticated, async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId);
    const metrics = await EnhancedAnalyticsService.getPlayerPerformanceMetrics(playerId);
    
    if (!metrics) {
      return res.status(404).json({ message: "Player not found" });
    }
    
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching player performance:", error);
    res.status(500).json({ message: "Failed to fetch player performance metrics" });
  }
});

// Get team analytics for a video
router.get("/video/:videoId/team/:teamColor", isAuthenticated, async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const teamColor = req.params.teamColor;
    
    const analytics = await EnhancedAnalyticsService.getTeamAnalytics(videoId, teamColor);
    
    if (!analytics) {
      return res.status(404).json({ message: "Team analytics not found" });
    }
    
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching team analytics:", error);
    res.status(500).json({ message: "Failed to fetch team analytics" });
  }
});

// Get game flow analysis
router.get("/video/:videoId/gameflow", isAuthenticated, async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const analysis = await EnhancedAnalyticsService.getGameFlowAnalysis(videoId);
    
    if (!analysis) {
      return res.status(404).json({ message: "Game flow analysis not found" });
    }
    
    res.json(analysis);
  } catch (error) {
    console.error("Error fetching game flow analysis:", error);
    res.status(500).json({ message: "Failed to fetch game flow analysis" });
  }
});

// Get faceoff analytics
router.get("/video/:videoId/faceoffs", isAuthenticated, async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const analytics = await EnhancedAnalyticsService.getFaceoffAnalytics(videoId);
    
    if (!analytics) {
      return res.status(404).json({ message: "Faceoff analytics not found" });
    }
    
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching faceoff analytics:", error);
    res.status(500).json({ message: "Failed to fetch faceoff analytics" });
  }
});

// Get coaching insights
router.get("/video/:videoId/insights", isAuthenticated, async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId);
    const insights = await EnhancedAnalyticsService.getCoachingInsights(videoId);
    
    if (!insights) {
      return res.status(404).json({ message: "Coaching insights not found" });
    }
    
    res.json(insights);
  } catch (error) {
    console.error("Error fetching coaching insights:", error);
    res.status(500).json({ message: "Failed to fetch coaching insights" });
  }
});

export default router;