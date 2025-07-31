import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { upload, processVideoUpload, processYouTubeVideo } from "./services/videoProcessor";
import { insertVideoSchema, insertTeamSchema, insertPlayerSchema } from "@shared/schema";
import * as path from "path";
import * as fs from "fs";

// Helper function to calculate average confidence from analyses
async function calculateAverageConfidence(videoIds: number[]): Promise<number> {
  if (videoIds.length === 0) return 0;
  
  try {
    const allAnalyses = await Promise.all(
      videoIds.map(id => storage.getVideoAnalyses(id))
    );
    
    const allConfidences: number[] = [];
    allAnalyses.forEach(analyses => {
      analyses.forEach(analysis => {
        if (analysis.confidence) {
          allConfidences.push(analysis.confidence);
        }
      });
    });
    
    if (allConfidences.length === 0) return 0;
    
    const sum = allConfidences.reduce((acc, conf) => acc + conf, 0);
    return sum / allConfidences.length;
  } catch (error) {
    console.error("Error calculating average confidence:", error);
    return 0;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Analysis settings routes
  app.get("/api/settings/analysis", isAuthenticated, async (req: any, res) => {
    try {
      // For now, return default settings
      // In production, this would be stored per user
      res.json({
        useAdvancedAnalysis: true,
        analysisDepth: "maximum",
        preferredStrategy: "comprehensive"
      });
    } catch (error) {
      console.error("Error fetching analysis settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings/analysis", isAuthenticated, async (req: any, res) => {
    try {
      const { useAdvancedAnalysis, analysisDepth, preferredStrategy } = req.body;
      // In production, save to user preferences
      res.json({ 
        message: "Settings updated successfully",
        settings: { useAdvancedAnalysis, analysisDepth, preferredStrategy }
      });
    } catch (error) {
      console.error("Error updating analysis settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Video routes
  app.post('/api/videos/upload', isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description, teamId, userPrompt, playerNumber, teamName, position, level, useAdvancedAnalysis, videoType } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      const videoData = {
        title: title || file.originalname,
        description: description || "",
        filePath: file.path,
        youtubeUrl: null,
        duration: null,
        thumbnailUrl: null,
        userId,
        teamId: teamId ? parseInt(teamId) : null,
        status: "uploading",
        userPrompt,
        playerNumber,
        teamName,
        position,
        level,
      };

      const video = await storage.createVideo(videoData);

      // Process video asynchronously with custom options
      const analysisOptions = { 
        playerNumber, 
        teamName, 
        position, 
        level,
        videoType: videoType || 'game',
        useAdvancedAnalysis: useAdvancedAnalysis === 'true' || useAdvancedAnalysis === true
      };
      processVideoUpload(video.id, file.path, video.title, userPrompt, analysisOptions).catch(console.error);

      res.json(video);
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  app.post('/api/videos/youtube', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { youtubeUrl, title, description, teamId, userPrompt, playerNumber, teamName, position, level, useAdvancedAnalysis, videoType } = req.body;

      if (!youtubeUrl) {
        return res.status(400).json({ message: "YouTube URL is required" });
      }

      const videoData = {
        title: title || "YouTube Video Analysis",
        description: description || "",
        filePath: null,
        youtubeUrl,
        duration: null,
        thumbnailUrl: null,
        userId,
        teamId: teamId ? parseInt(teamId) : null,
        status: "uploading",
        userPrompt,
        playerNumber,
        teamName,
        position,
        level,
      };

      const video = await storage.createVideo(videoData);

      // Process YouTube video asynchronously with custom options
      const analysisOptions = { 
        playerNumber, 
        teamName, 
        position, 
        level,
        videoType: videoType || 'game',
        useAdvancedAnalysis: useAdvancedAnalysis === true
      };
      processYouTubeVideo(video.id, youtubeUrl, video.title, userPrompt, analysisOptions).catch(console.error);

      res.json(video);
    } catch (error) {
      console.error("Error processing YouTube video:", error);
      res.status(500).json({ message: "Failed to process YouTube video" });
    }
  });

  app.get('/api/videos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videos = await storage.getUserVideos(userId);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get('/api/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Check if user owns the video
      const userId = req.user.claims.sub;
      if (video.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.get('/api/videos/:id/analyses', isAuthenticated, async (req: any, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Check if user owns the video
      const userId = req.user.claims.sub;
      if (video.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const analyses = await storage.getVideoAnalyses(videoId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ message: "Failed to fetch analyses" });
    }
  });

  // Get video play statistics
  app.get('/api/videos/:id/statistics', isAuthenticated, async (req: any, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Check if user owns the video
      const userId = req.user.claims.sub;
      if (video.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { AnalysisEnhancer } = await import('./services/analysisEnhancer');
      const stats = await AnalysisEnhancer.getVideoPlayStatistics(videoId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get all transition analyses for a user
  app.get('/api/transition-analyses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videos = await storage.getUserVideos(userId);
      
      // Get all transition analyses across all videos
      const transitionData = await Promise.all(
        videos
          .filter(v => v.status === 'completed')
          .map(async (video) => {
            const analyses = await storage.getVideoAnalyses(video.id);
            const transitions = analyses.filter(a => a.type === 'transition');
            return {
              videoId: video.id,
              videoTitle: video.title,
              uploadDate: video.createdAt,
              transitions: transitions.map(t => ({
                ...t,
                videoTitle: video.title
              }))
            };
          })
      );

      // Calculate aggregate statistics
      const allTransitions = transitionData.flatMap(d => d.transitions);
      const totalTransitions = allTransitions.length;
      
      // Extract success rates from metadata
      const clearingSuccessRates = allTransitions
        .filter(t => t.metadata && typeof t.metadata === 'object' && 'clearingSuccess' in t.metadata)
        .map(t => (t.metadata as any).clearingSuccess as number);
      const ridingSuccessRates = allTransitions
        .filter(t => t.metadata && typeof t.metadata === 'object' && 'ridingSuccess' in t.metadata)
        .map(t => (t.metadata as any).ridingSuccess as number);
      
      const avgClearingSuccess = clearingSuccessRates.length > 0
        ? clearingSuccessRates.reduce((sum, rate) => sum + rate, 0) / clearingSuccessRates.length
        : 0;
      const avgRidingSuccess = ridingSuccessRates.length > 0
        ? ridingSuccessRates.reduce((sum, rate) => sum + rate, 0) / ridingSuccessRates.length
        : 0;
      
      // Extract strategies from content
      const strategies = new Map<string, number>();
      allTransitions.forEach(t => {
        const strategyMatches = t.content.match(/(?:banana split|wide break|over the shoulder|fast break|slow break|substitution pattern|defensive slide)/gi);
        if (strategyMatches) {
          strategyMatches.forEach(strat => {
            const normalized = strat.toLowerCase();
            strategies.set(normalized, (strategies.get(normalized) || 0) + 1);
          });
        }
      });

      res.json({
        totalTransitions,
        avgClearingSuccess: Math.round(avgClearingSuccess),
        avgRidingSuccess: Math.round(avgRidingSuccess),
        videoBreakdown: transitionData.filter(d => d.transitions.length > 0),
        strategies: Array.from(strategies.entries()).map(([name, count]) => ({ name, count })),
        recentTransitions: allTransitions.slice(-10).reverse()
      });
    } catch (error) {
      console.error("Error fetching transition analyses:", error);
      res.status(500).json({ message: "Failed to fetch transition analyses" });
    }
  });

  // Get all face-off analyses for a user
  app.get('/api/faceoff-analyses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videos = await storage.getUserVideos(userId);
      
      // Get all face-off analyses across all videos
      const faceoffData = await Promise.all(
        videos
          .filter(v => v.status === 'completed')
          .map(async (video) => {
            const analyses = await storage.getVideoAnalyses(video.id);
            const faceoffs = analyses.filter(a => a.type === 'face_off');
            return {
              videoId: video.id,
              videoTitle: video.title,
              uploadDate: video.createdAt,
              faceoffs: faceoffs.map(fo => ({
                ...fo,
                videoTitle: video.title
              }))
            };
          })
      );

      // Calculate aggregate statistics
      const allFaceoffs = faceoffData.flatMap(d => d.faceoffs);
      const totalFaceoffs = allFaceoffs.length;
      const avgWinProbability = totalFaceoffs > 0
        ? allFaceoffs.reduce((sum, fo) => sum + ((fo.metadata && typeof fo.metadata === 'object' && 'winProbability' in fo.metadata) ? (fo.metadata as any).winProbability : 50), 0) / totalFaceoffs
        : 0;
      
      // Extract techniques from content
      const techniques = new Map<string, number>();
      allFaceoffs.forEach(fo => {
        const techniqueMatches = fo.content.match(/(?:clamp|jump counter|rake.*pull|quick exit|plunger|laser|traditional)/gi);
        if (techniqueMatches) {
          techniqueMatches.forEach(tech => {
            const normalized = tech.toLowerCase();
            techniques.set(normalized, (techniques.get(normalized) || 0) + 1);
          });
        }
      });

      res.json({
        totalFaceoffs,
        avgWinProbability: Math.round(avgWinProbability),
        videoBreakdown: faceoffData.filter(d => d.faceoffs.length > 0),
        techniques: Array.from(techniques.entries()).map(([name, count]) => ({ name, count })),
        recentFaceoffs: allFaceoffs.slice(-10).reverse()
      });
    } catch (error) {
      console.error("Error fetching face-off analyses:", error);
      res.status(500).json({ message: "Failed to fetch face-off analyses" });
    }
  });

  // Team routes
  app.post('/api/teams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teamData = insertTeamSchema.parse({
        ...req.body,
        userId,
      });

      const team = await storage.createTeam(teamData);
      res.json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.get('/api/teams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teams = await storage.getUserTeams(userId);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Player routes
  app.post('/api/teams/:teamId/players', isAuthenticated, async (req: any, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if user owns the team
      const userId = req.user.claims.sub;
      if (team.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const playerData = insertPlayerSchema.parse({
        ...req.body,
        teamId,
      });

      const player = await storage.createPlayer(playerData);
      res.json(player);
    } catch (error) {
      console.error("Error creating player:", error);
      res.status(500).json({ message: "Failed to create player" });
    }
  });

  app.get('/api/teams/:teamId/players', isAuthenticated, async (req: any, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if user owns the team
      const userId = req.user.claims.sub;
      if (team.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const players = await storage.getTeamPlayers(teamId);
      res.json(players);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Dashboard stats route
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videos = await storage.getUserVideos(userId);
      const teams = await storage.getUserTeams(userId);

      const completedVideos = videos.filter(v => v.status === 'completed');
      const processingVideos = videos.filter(v => v.status === 'processing');

      // Calculate real stats from user data
      const stats = {
        videosAnalyzed: completedVideos.length,
        videosProcessing: processingVideos.length,
        totalVideos: videos.length,
        totalTeams: teams.length,
        // Calculate average confidence from completed analyses
        analysisAccuracy: completedVideos.length > 0 ? 
          await calculateAverageConfidence(completedVideos.map(v => v.id)) : 0,
        // Each video saves approximately 45 minutes of manual analysis
        hoursSaved: Math.floor(completedVideos.length * 0.75),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Serve thumbnails
  app.get('/api/thumbnails/:filename', (req, res) => {
    const filename = req.params.filename;
    const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnails', filename);
    
    fs.access(thumbnailPath, fs.constants.F_OK, (err) => {
      if (err) {
        res.status(404).json({ message: "Thumbnail not found" });
        return;
      }
      res.sendFile(thumbnailPath);
    });
  });

  // Retry processing for stuck videos
  app.post('/api/videos/retry-processing', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videos = await storage.getUserVideos(userId);
      
      // Find videos that are uploaded but not processed
      const unprocessedVideos = videos.filter(v => v.status === 'uploaded');
      
      console.log(`Found ${unprocessedVideos.length} unprocessed videos for user ${userId}`);
      
      // Trigger processing for each unprocessed video
      for (const video of unprocessedVideos) {
        if (video.youtubeUrl) {
          console.log(`Retrying YouTube video processing for video ${video.id}`);
          processYouTubeVideo(video.id, video.youtubeUrl, video.title).catch(error => {
            console.error(`Failed to process YouTube video ${video.id}:`, error);
          });
        } else if (video.filePath) {
          console.log(`Retrying file video processing for video ${video.id}`);
          processVideoUpload(video.id, video.filePath, video.title).catch(error => {
            console.error(`Failed to process file video ${video.id}:`, error);
          });
        }
      }
      
      res.json({ 
        message: `Started processing ${unprocessedVideos.length} videos`,
        count: unprocessedVideos.length 
      });
    } catch (error) {
      console.error("Error retrying video processing:", error);
      res.status(500).json({ message: "Failed to retry processing" });
    }
  });
  
  // Retry single failed video
  app.post('/api/videos/:id/retry', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videoId = parseInt(req.params.id);
      
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      if (video.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (video.status !== 'failed') {
        return res.status(400).json({ message: "Only failed videos can be retried" });
      }
      
      // Update status to processing
      await storage.updateVideoStatus(videoId, "processing");
      
      // Retry processing based on video type
      if (video.youtubeUrl) {
        console.log(`Retrying YouTube video processing for video ${videoId}`);
        processYouTubeVideo(videoId, video.youtubeUrl, video.title).catch(error => {
          console.error(`Failed to retry YouTube video ${videoId}:`, error);
        });
      } else if (video.filePath) {
        console.log(`Retrying file video processing for video ${videoId}`);
        processVideoUpload(videoId, video.filePath, video.title).catch(error => {
          console.error(`Failed to retry file video ${videoId}:`, error);
        });
      }
      
      res.json({ message: "Video processing restarted", video });
    } catch (error) {
      console.error("Error retrying video:", error);
      res.status(500).json({ message: "Failed to retry video processing" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
