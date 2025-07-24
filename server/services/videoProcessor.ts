import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "../storage";
import { analyzeLacrosseVideo, analyzeLacrosseVideoFromYouTube } from "./gemini";
import { generateVideoThumbnail, getVideoMetadata, getYouTubeThumbnail } from "./thumbnailGenerator";

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
  title: string
): Promise<void> {
  try {
    // Update video status to processing
    await storage.updateVideoStatus(videoId, "processing");
    
    // Generate thumbnail and get metadata
    try {
      const [thumbnailUrl, metadata] = await Promise.all([
        generateVideoThumbnail(filePath, videoId),
        getVideoMetadata(filePath)
      ]);
      
      // Update video with thumbnail and metadata
      await storage.updateVideo(videoId, {
        thumbnailUrl,
        duration: metadata.duration
      });
    } catch (thumbnailError) {
      console.error("Error generating thumbnail:", thumbnailError);
      // Continue processing even if thumbnail generation fails
    }

    // Analyze video with Gemini
    const analysis = await analyzeLacrosseVideo(filePath, title);

    // Store analysis results
    await storage.createAnalysis({
      videoId,
      type: "overall",
      title: "Overall Game Analysis",
      content: analysis.overallAnalysis,
      timestamp: null,
      confidence: 95,
      metadata: { type: "overall" },
    });

    // Store player evaluations
    for (const playerEval of analysis.playerEvaluations) {
      await storage.createAnalysis({
        videoId,
        type: "player_evaluation",
        title: `Player Evaluation ${playerEval.playerNumber ? `- #${playerEval.playerNumber}` : ""}`,
        content: playerEval.evaluation,
        timestamp: playerEval.timestamp ? Math.round(playerEval.timestamp) : null,
        confidence: Math.round(playerEval.confidence),
        metadata: { 
          type: "player_evaluation",
          playerNumber: playerEval.playerNumber 
        },
      });
    }

    // Store face-off analysis
    for (const faceOff of analysis.faceOffAnalysis) {
      await storage.createAnalysis({
        videoId,
        type: "face_off",
        title: "Face-Off Analysis",
        content: faceOff.analysis,
        timestamp: faceOff.timestamp ? Math.round(faceOff.timestamp) : null,
        confidence: Math.round(faceOff.confidence),
        metadata: { 
          type: "face_off",
          winProbability: faceOff.winProbability 
        },
      });
    }

    // Store transition analysis
    for (const transition of analysis.transitionAnalysis) {
      await storage.createAnalysis({
        videoId,
        type: "transition",
        title: "Transition Intelligence",
        content: transition.analysis,
        timestamp: transition.timestamp ? Math.round(transition.timestamp) : null,
        confidence: Math.round(transition.confidence),
        metadata: { 
          type: "transition",
          successProbability: transition.successProbability 
        },
      });
    }

    // Store key moments
    for (const moment of analysis.keyMoments) {
      await storage.createAnalysis({
        videoId,
        type: "key_moment",
        title: `Key Moment: ${moment.type}`,
        content: moment.description,
        timestamp: moment.timestamp ? Math.round(moment.timestamp) : null,
        confidence: Math.round(moment.confidence),
        metadata: { 
          type: "key_moment",
          momentType: moment.type 
        },
      });
    }

    // Update video status to completed
    await storage.updateVideoStatus(videoId, "completed");
  } catch (error) {
    console.error("Error processing video:", error);
    await storage.updateVideoStatus(videoId, "failed");
    throw error;
  }
}

export async function processYouTubeVideo(
  videoId: number,
  youtubeUrl: string,
  title: string
): Promise<void> {
  try {
    // Update video status to processing
    await storage.updateVideoStatus(videoId, "processing");
    
    // For YouTube videos, get thumbnail from YouTube API
    try {
      const thumbnailUrl = getYouTubeThumbnail(youtubeUrl);
      await storage.updateVideo(videoId, {
        thumbnailUrl
      });
    } catch (thumbnailError) {
      console.error("Error getting YouTube thumbnail:", thumbnailError);
      // Continue processing even if thumbnail fails
    }

    // Analyze YouTube video with Gemini
    const analysis = await analyzeLacrosseVideoFromYouTube(youtubeUrl, title);

    // Store analysis results (same pattern as file upload)
    await storage.createAnalysis({
      videoId,
      type: "overall",
      title: "Overall Game Analysis",
      content: analysis.overallAnalysis,
      timestamp: null,
      confidence: 95,
      metadata: { type: "overall" },
    });

    // Store other analyses...
    for (const playerEval of analysis.playerEvaluations) {
      await storage.createAnalysis({
        videoId,
        type: "player_evaluation",
        title: `Player Evaluation ${playerEval.playerNumber ? `- #${playerEval.playerNumber}` : ""}`,
        content: playerEval.evaluation,
        timestamp: playerEval.timestamp ? Math.round(playerEval.timestamp) : null,
        confidence: Math.round(playerEval.confidence),
        metadata: { 
          type: "player_evaluation",
          playerNumber: playerEval.playerNumber 
        },
      });
    }

    for (const faceOff of analysis.faceOffAnalysis) {
      await storage.createAnalysis({
        videoId,
        type: "face_off",
        title: "Face-Off Analysis",
        content: faceOff.analysis,
        timestamp: faceOff.timestamp ? Math.round(faceOff.timestamp) : null,
        confidence: Math.round(faceOff.confidence),
        metadata: { 
          type: "face_off",
          winProbability: faceOff.winProbability 
        },
      });
    }

    for (const transition of analysis.transitionAnalysis) {
      await storage.createAnalysis({
        videoId,
        type: "transition",
        title: "Transition Intelligence",
        content: transition.analysis,
        timestamp: transition.timestamp ? Math.round(transition.timestamp) : null,
        confidence: Math.round(transition.confidence),
        metadata: { 
          type: "transition",
          successProbability: transition.successProbability 
        },
      });
    }

    for (const moment of analysis.keyMoments) {
      await storage.createAnalysis({
        videoId,
        type: "key_moment",
        title: `Key Moment: ${moment.type}`,
        content: moment.description,
        timestamp: moment.timestamp ? Math.round(moment.timestamp) : null,
        confidence: Math.round(moment.confidence),
        metadata: { 
          type: "key_moment",
          momentType: moment.type 
        },
      });
    }

    // Update video status to completed
    await storage.updateVideoStatus(videoId, "completed");
  } catch (error) {
    console.error("Error processing YouTube video:", error);
    await storage.updateVideoStatus(videoId, "failed");
    throw error;
  }
}
