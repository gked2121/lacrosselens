import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { upload, processVideoUpload, processYouTubeVideo } from "./services/videoProcessor";
import { insertVideoSchema, insertTeamSchema, insertPlayerSchema } from "@shared/schema";

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

  // Video routes
  app.post('/api/videos/upload', isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description, teamId } = req.body;
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
      };

      const video = await storage.createVideo(videoData);

      // Process video asynchronously
      processVideoUpload(video.id, file.path, video.title).catch(console.error);

      res.json(video);
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  app.post('/api/videos/youtube', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { youtubeUrl, title, description, teamId } = req.body;

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
      };

      const video = await storage.createVideo(videoData);

      // Process YouTube video asynchronously
      processYouTubeVideo(video.id, youtubeUrl, video.title).catch(console.error);

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

      // Calculate basic stats
      const stats = {
        videosAnalyzed: completedVideos.length,
        videosProcessing: processingVideos.length,
        totalVideos: videos.length,
        totalTeams: teams.length,
        analysisAccuracy: 92, // Static for now, could be calculated from confidence scores
        hoursSaved: Math.floor(completedVideos.length * 0.75), // Rough estimate
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
