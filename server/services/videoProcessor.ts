import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "../storage";
import { VIDEO_STATUS } from "@shared/schema";
import { analyzeLacrosseVideo, analyzeLacrosseVideoFromYouTube } from "./gemini";
import { generateVideoThumbnail, getVideoMetadata, getYouTubeThumbnail } from "./thumbnailGenerator";
import { AdvancedVideoAnalyzer } from "./advancedVideoAnalysis";
import { EnhancedPromptSystem } from "./enhancedPromptSystem";
import { EnhancedAnalysisProcessor } from "./enhancedAnalysisProcessor";
import { YouTubeMetadataService } from "./youtubeMetadata";
import { TwoPhaseGeminiAnalyzer } from "./geminiTwoPhase";

// Configure multer for video uploads
const uploadDir = "uploads/videos";

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only MP4, MOV, and AVI files are allowed."), false);
  }
};

export const upload = multer({
  storage: videoStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit
  },
});

export async function processVideoUpload(
  videoId: number,
  filePath: string,
  title: string,
  userPrompt?: string,
  analysisOptions?: {
    playerNumber?: string;
    teamName?: string;
    position?: string;
    level?: 'youth' | 'high_school' | 'college' | 'professional';
    videoType?: 'game' | 'practice' | 'highlight' | 'drill' | 'scrimmage' | 'recruiting';
    useAdvancedAnalysis?: boolean;
  }
): Promise<void> {
  try {
    console.log(`Starting video processing for video ${videoId}: ${title}`);
    
    // Update video status to processing
    await storage.updateVideoStatus(videoId, VIDEO_STATUS.PROCESSING);
    
    // Get video metadata
    console.log(`Getting video metadata for ${filePath}`);
    const metadata = await getVideoMetadata(filePath);
    const durationInSeconds = Math.round(metadata.duration);
    
    // Update video with duration
    await storage.updateVideo(videoId, {
      duration: durationInSeconds,
    });
    
    // Generate thumbnail
    try {
      console.log(`Generating thumbnail for video ${videoId}`);
      const thumbnailPath = await generateVideoThumbnail(filePath, videoId);
      const publicThumbnailPath = `/uploads/thumbnails/video-${videoId}.jpg`;
      await storage.updateVideo(videoId, {
        thumbnailUrl: publicThumbnailPath,
      });
      console.log(`Thumbnail generated successfully: ${publicThumbnailPath}`);
    } catch (thumbnailError) {
      console.error("Error generating thumbnail:", thumbnailError);
      // Continue processing even if thumbnail generation fails
    }

    // Use the new two-phase Gemini analysis approach
    console.log(`Starting TWO-PHASE Gemini analysis for video ${videoId}`);
    
    try {
      // Phase 1: Extract comprehensive data from video
      const comprehensiveData = await TwoPhaseGeminiAnalyzer.extractComprehensiveData(filePath);
      
      console.log(`Phase 1 complete: Extracted ${comprehensiveData.plays?.length || 0} plays, ${comprehensiveData.individualPerformance?.length || 0} player performances`);
      
      // Store the raw comprehensive data as an overall analysis with metadata
      await storage.createAnalysis({
        videoId,
        type: "overall", 
        title: "Comprehensive Video Data",
        content: "Two-phase analysis complete - see metadata for full data",
        timestamp: 0,
        confidence: 100,
        metadata: {
          comprehensiveAnalysisData: comprehensiveData,
          analysisVersion: 'two-phase-v1',
          analysisTimestamp: new Date().toISOString()
        }
      });
      
      // Phase 2: Format the data for specific outputs
      console.log(`Starting Phase 2: Formatting analysis for display`);
      const [playerEvaluations, statistics, tactical, highlights] = await Promise.all([
        TwoPhaseGeminiAnalyzer.formatAnalysis(comprehensiveData, 'playerEvaluation'),
        TwoPhaseGeminiAnalyzer.formatAnalysis(comprehensiveData, 'statistics'),
        TwoPhaseGeminiAnalyzer.formatAnalysis(comprehensiveData, 'tactical'),
        TwoPhaseGeminiAnalyzer.formatAnalysis(comprehensiveData, 'highlights')
      ]);
      
      console.log(`Phase 2 complete: Generated formatted analyses`);
      
      // Store overall analysis
      if (comprehensiveData.tacticalObservations) {
        await storage.createAnalysis({
          videoId,
          type: "overall",
          title: "Game Overview",
          content: tactical,
          timestamp: 0,
          confidence: 95,
          metadata: {
            comprehensiveData: comprehensiveData.videoMetadata,
            statistics: statistics
          }
        });
      }
      
      // Process and store player evaluations
      if (typeof playerEvaluations === 'string') {
        // Parse player evaluations from formatted text
        const evaluationSections = playerEvaluations.split(/Player #?\d+|Player in \w+/g).filter(Boolean);
        for (let i = 0; i < comprehensiveData.individualPerformance.length && i < evaluationSections.length; i++) {
          const player = comprehensiveData.individualPerformance[i];
          await storage.createAnalysis({
            videoId,
            type: "player_evaluation",
            title: `Player ${player.player}`,
            content: evaluationSections[i].trim(),
            timestamp: 0,
            confidence: 95,
            metadata: {
              stats: player.stats,
              skills: player.skills,
              athleticism: player.athleticism
            }
          });
        }
      }
      
      // Store highlights as key moments
      if (typeof highlights === 'string') {
        const highlightLines = highlights.split('\n').filter(line => line.includes('Timestamp:'));
        for (const play of comprehensiveData.plays || []) {
          if (play.result === 'goal' || play.playType === 'fast_break') {
            await storage.createAnalysis({
              videoId,
              type: "key_moment",
              title: `${play.playType} - ${play.result}`,
              content: `Play from ${play.startTime}s to ${play.endTime}s`,
              timestamp: Math.round(play.startTime),
              confidence: 90,
              metadata: {
                playDetails: play
              }
            });
          }
        }
      }
      
      // Store face-off analyses
      const faceoffs = comprehensiveData.plays?.filter(p => p.playType === 'face_off') || [];
      for (const faceoff of faceoffs) {
        await storage.createAnalysis({
          videoId,
          type: "face_off",
          title: "Face-off",
          content: `Face-off at ${faceoff.startTime}s`,
          timestamp: Math.round(faceoff.startTime),
          confidence: 85,
          metadata: {
            technique: comprehensiveData.tacticalObservations?.specialSituations?.faceoffs?.technique?.[0] || 'standard'
          }
        });
      }
      
      // Store transition analyses
      const transitions = comprehensiveData.plays?.filter(p => p.playType === 'clear' || p.playType === 'ride') || [];
      for (const transition of transitions) {
        await storage.createAnalysis({
          videoId,
          type: "transition",
          title: transition.playType === 'clear' ? "Clear" : "Ride",
          content: `${transition.playType} from ${transition.startTime}s to ${transition.endTime}s`,
          timestamp: Math.round(transition.startTime),
          confidence: 85,
          metadata: {
            result: transition.result,
            formations: transition.formations
          }
        });
      }
      
      console.log(`Successfully stored analyses from two-phase Gemini processing`);
      
    } catch (analysisError) {
      console.error("Error during two-phase analysis:", analysisError);
      // Update video status to failed on error
      await storage.updateVideoStatus(videoId, VIDEO_STATUS.FAILED);
      throw analysisError;
    }
    
    // Update video status to completed
    await storage.updateVideoStatus(videoId, VIDEO_STATUS.COMPLETED);
    console.log(`Video ${videoId} processing completed successfully`);
    
  } catch (error) {
    console.error("Error processing video:", error);
    // Update video status to failed
    await storage.updateVideoStatus(videoId, VIDEO_STATUS.FAILED);
    throw error;
  }
}

export async function processYouTubeVideo(
  videoId: number,
  youtubeUrl: string,
  title: string,
  userPrompt?: string,
  analysisOptions?: {
    playerNumber?: string;
    teamName?: string;
    position?: string;
    level?: 'youth' | 'high_school' | 'college' | 'professional';
    videoType?: 'game' | 'practice' | 'highlight' | 'drill' | 'scrimmage' | 'recruiting';
    useAdvancedAnalysis?: boolean;
  }
): Promise<void> {
  try {
    console.log(`Starting YouTube video processing for video ${videoId}: ${title}`);
    
    // Update video status to processing
    await storage.updateVideoStatus(videoId, VIDEO_STATUS.PROCESSING);
    
    // Extract video ID from URL
    const ytVideoId = YouTubeMetadataService.extractVideoId(youtubeUrl);
    if (!ytVideoId) {
      throw new Error("Invalid YouTube URL format");
    }
    
    // Get YouTube metadata
    console.log(`Fetching YouTube metadata for video ID: ${ytVideoId}`);
    const youtubeMetadata = await YouTubeMetadataService.getVideoMetadata(ytVideoId);
    
    // Use YouTube metadata if user didn't provide title/description
    let finalTitle = title;
    let finalDescription = "";
    
    if (youtubeMetadata) {
      // If user didn't provide a title or gave a generic one, use YouTube title
      if (!title || title.trim() === "" || title === "YouTube Video Analysis") {
        finalTitle = YouTubeMetadataService.createEnhancedTitle(youtubeMetadata);
        console.log(`Using YouTube title: ${finalTitle}`);
      }
      
      // Always use enhanced description with metadata
      finalDescription = YouTubeMetadataService.createEnhancedDescription(youtubeMetadata);
      console.log(`Generated enhanced description from YouTube metadata`);
    }
    
    // Get thumbnail URL (prefer from metadata, fallback to static)
    const thumbnailUrl = youtubeMetadata?.thumbnailUrl || getYouTubeThumbnail(youtubeUrl);
    console.log(`Using thumbnail URL: ${thumbnailUrl}`);
    
    // Update video with enhanced metadata
    await storage.updateVideo(videoId, {
      title: finalTitle,
      description: finalDescription,
      thumbnailUrl,
    });
    
    console.log(`Updated video ${videoId} with enhanced title, description, and thumbnail`);

    // Use the new two-phase Gemini analysis approach for YouTube videos
    console.log(`Starting TWO-PHASE Gemini analysis for YouTube video ${videoId}`);
    
    try {
      // Phase 1: Extract comprehensive data from YouTube video
      const comprehensiveData = await TwoPhaseGeminiAnalyzer.extractFromYouTube(youtubeUrl);
      
      console.log(`Phase 1 complete: Extracted ${comprehensiveData.plays?.length || 0} plays, ${comprehensiveData.individualPerformance?.length || 0} player performances`);
      
      // Store the raw comprehensive data as an overall analysis with metadata
      await storage.createAnalysis({
        videoId,
        type: "overall", 
        title: "Comprehensive YouTube Video Data",
        content: "Two-phase analysis complete - see metadata for full data",
        timestamp: 0,
        confidence: 100,
        metadata: {
          comprehensiveAnalysisData: comprehensiveData,
          analysisVersion: 'two-phase-v1',
          analysisTimestamp: new Date().toISOString(),
          source: 'youtube'
        }
      });
      
      // Phase 2: Format the data for specific outputs
      console.log(`Starting Phase 2: Formatting analysis for display`);
      const [playerEvaluations, statistics, tactical, highlights] = await Promise.all([
        TwoPhaseGeminiAnalyzer.formatAnalysis(comprehensiveData, 'playerEvaluation'),
        TwoPhaseGeminiAnalyzer.formatAnalysis(comprehensiveData, 'statistics'),
        TwoPhaseGeminiAnalyzer.formatAnalysis(comprehensiveData, 'tactical'),
        TwoPhaseGeminiAnalyzer.formatAnalysis(comprehensiveData, 'highlights')
      ]);
      
      console.log(`Phase 2 complete: Generated formatted analyses`);
      
      // Store overall analysis (always store even if no tactical observations)
      await storage.createAnalysis({
        videoId,
        type: "overall",
        title: "Game Overview",
        content: tactical || "Analysis based on available video data.",
        timestamp: 0,
        confidence: 95,
        metadata: {
          comprehensiveData: comprehensiveData.videoMetadata || {},
          statistics: statistics,
          source: 'youtube'
        }
      });
      
      // Process and store player evaluations
      if (typeof playerEvaluations === 'string' && playerEvaluations.trim().length > 0) {
        // If no individual performances extracted, create one general evaluation
        if (!comprehensiveData.individualPerformance || comprehensiveData.individualPerformance.length === 0) {
          await storage.createAnalysis({
            videoId,
            type: "player_evaluation",
            title: `Player Evaluation`,
            content: playerEvaluations,
            timestamp: 0,
            confidence: 95,
            metadata: {
              source: 'youtube'
            }
          });
        } else {
          // Parse player evaluations from formatted text
          const evaluationSections = playerEvaluations.split(/\*\*\[.*?\]\*\*/g).filter(s => s.trim().length > 50);
          for (let i = 0; i < comprehensiveData.individualPerformance.length && i < evaluationSections.length; i++) {
            const player = comprehensiveData.individualPerformance[i];
            await storage.createAnalysis({
              videoId,
              type: "player_evaluation",
              title: `Player ${player.player}`,
              content: evaluationSections[i].trim(),
              timestamp: 0,
              confidence: 95,
              metadata: {
                stats: player.stats,
                skills: player.skills,
                athleticism: player.athleticism,
                source: 'youtube'
              }
            });
          }
        }
      }
      
      // Store highlights as key moments
      if (typeof highlights === 'string') {
        const highlightLines = highlights.split('\n').filter(line => line.includes('Timestamp:'));
        for (const play of comprehensiveData.plays || []) {
          if (play.result === 'goal' || play.playType === 'fast_break') {
            await storage.createAnalysis({
              videoId,
              type: "key_moment",
              title: `${play.playType} - ${play.result}`,
              content: `Play from ${play.startTime}s to ${play.endTime}s`,
              timestamp: Math.round(play.startTime),
              confidence: 90,
              metadata: {
                playDetails: play,
                source: 'youtube'
              }
            });
          }
        }
      }
      
      // Store face-off analyses
      const faceoffs = comprehensiveData.plays?.filter(p => p.playType === 'face_off') || [];
      for (const faceoff of faceoffs) {
        await storage.createAnalysis({
          videoId,
          type: "face_off",
          title: "Face-off",
          content: `Face-off at ${faceoff.startTime}s`,
          timestamp: Math.round(faceoff.startTime),
          confidence: 85,
          metadata: {
            technique: comprehensiveData.tacticalObservations?.specialSituations?.faceoffs?.technique?.[0] || 'standard',
            source: 'youtube'
          }
        });
      }
      
      // Store transition analyses
      const transitions = comprehensiveData.plays?.filter(p => p.playType === 'clear' || p.playType === 'ride') || [];
      for (const transition of transitions) {
        await storage.createAnalysis({
          videoId,
          type: "transition",
          title: transition.playType === 'clear' ? "Clear" : "Ride",
          content: `${transition.playType} from ${transition.startTime}s to ${transition.endTime}s`,
          timestamp: Math.round(transition.startTime),
          confidence: 85,
          metadata: {
            result: transition.result,
            formations: transition.formations,
            source: 'youtube'
          }
        });
      }
      
      console.log(`Successfully stored analyses from two-phase Gemini processing for YouTube video`);
      
    } catch (analysisError) {
      console.error("Error during two-phase YouTube analysis:", analysisError);
      throw analysisError;
    }

    // Update video status to completed
    await storage.updateVideoStatus(videoId, VIDEO_STATUS.COMPLETED);
  } catch (error) {
    console.error(`Error processing YouTube video ${videoId}:`, error);
    console.error(`Full error details:`, error instanceof Error ? error.message : error);
    console.error(`Stack trace:`, error instanceof Error ? error.stack : 'No stack trace');
    await storage.updateVideoStatus(videoId, VIDEO_STATUS.FAILED);
    throw error;
  }
}