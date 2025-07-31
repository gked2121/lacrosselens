import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "../storage";
import { analyzeLacrosseVideo, analyzeLacrosseVideoFromYouTube } from "./gemini";
import { generateVideoThumbnail, getVideoMetadata, getYouTubeThumbnail } from "./thumbnailGenerator";
import { AdvancedVideoAnalyzer } from "./advancedVideoAnalysis";
import { EnhancedPromptSystem } from "./enhancedPromptSystem";
import { EnhancedAnalysisProcessor } from "./enhancedAnalysisProcessor";
import { YouTubeMetadataService } from "./youtubeMetadata";

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
    await storage.updateVideoStatus(videoId, "processing");
    
    // Generate thumbnail and get metadata
    try {
      console.log(`Generating thumbnail and metadata for video ${videoId}`);
      const [thumbnailUrl, metadata] = await Promise.all([
        generateVideoThumbnail(filePath, videoId),
        getVideoMetadata(filePath)
      ]);
      
      // Update video with thumbnail and metadata
      await storage.updateVideo(videoId, {
        thumbnailUrl,
        duration: metadata.duration
      });
      console.log(`Thumbnail and metadata updated for video ${videoId}`);
    } catch (thumbnailError) {
      console.error("Error generating thumbnail:", thumbnailError);
      // Continue processing even if thumbnail generation fails
    }

    // Determine analysis mode based on user preference
    const useAdvancedAnalysis = analysisOptions?.useAdvancedAnalysis !== false; // Default to true if not specified
    
    if (useAdvancedAnalysis) {
      console.log(`Starting ADVANCED multi-pass analysis for video ${videoId}`);
      
      try {
        // Perform comprehensive multi-pass analysis
        const detailedAnalysis = await AdvancedVideoAnalyzer.performComprehensiveAnalysis(filePath);
        
        // Convert detailed analysis to storage format
        console.log(`Processing ${detailedAnalysis.segments.length} segments, ${detailedAnalysis.technicalBreakdowns.length} technical breakdowns, ${detailedAnalysis.statisticalData.length} statistical events`);
        
        // Store segments as key moments
        for (const segment of detailedAnalysis.segments) {
          if (segment.importance === 'high') {
            await storage.createAnalysis({
              videoId,
              type: "key_moment",
              title: `${segment.playType} - ${segment.players.join(', ')}`,
              content: segment.description,
              timestamp: Math.round(segment.startTime),
              confidence: 95,
              metadata: {
                players: segment.players,
                playType: segment.playType,
                duration: segment.endTime - segment.startTime
              }
            });
          }
        }
        
        // Store technical breakdowns as player evaluations
        for (const breakdown of detailedAnalysis.technicalBreakdowns) {
          await storage.createAnalysis({
            videoId,
            type: "player_evaluation",
            title: `Player ${breakdown.playerNumber || 'Unknown'} - ${breakdown.skillArea}`,
            content: `BIOMECHANICS: ${breakdown.biomechanics}\n\nDECISION MAKING: ${breakdown.decisionMaking}\n\nIMPROVEMENT: ${breakdown.improvement}`,
            timestamp: Math.round(breakdown.timestamp),
            confidence: breakdown.confidence,
            metadata: {
              playerNumber: breakdown.playerNumber,
              skillArea: breakdown.skillArea
            }
          });
        }
        
        // Store tactical insights
        for (const insight of detailedAnalysis.tacticalInsights) {
          await storage.createAnalysis({
            videoId,
            type: "overall",
            title: `Tactical Analysis - ${insight.situation}`,
            content: `FORMATION: ${insight.formation}\n\nEXECUTION: ${insight.execution}\n\nALTERNATIVES: ${insight.alternatives}\n\nCOACHING: ${insight.coaching}`,
            timestamp: Math.round(insight.timestamp),
            confidence: insight.confidence,
            metadata: {
              formation: insight.formation,
              situation: insight.situation
            }
          });
        }
        
        // Process statistical data
        const statsMap = new Map();
        for (const stat of detailedAnalysis.statisticalData) {
          const key = `${stat.playType}-${stat.timestamp}`;
          if (!statsMap.has(key)) {
            await storage.createAnalysis({
              videoId,
              type: "key_moment",
              title: `${stat.playType} - ${stat.playerInvolved}`,
              content: stat.outcome,
              timestamp: Math.round(stat.timestamp),
              confidence: 90,
              metadata: stat.metrics
            });
          }
        }
        
        // Create comprehensive overall analysis
        const overallContent = `COMPREHENSIVE VIDEO ANALYSIS SUMMARY\n\nTotal Segments Analyzed: ${detailedAnalysis.segments.length}\nHigh-Importance Plays: ${detailedAnalysis.segments.filter(s => s.importance === 'high').length}\nTechnical Breakdowns: ${detailedAnalysis.technicalBreakdowns.length}\nTactical Insights: ${detailedAnalysis.tacticalInsights.length}\nStatistical Events: ${detailedAnalysis.statisticalData.length}\n\nThis advanced analysis used multiple AI passes to extract maximum detail from the video, including biomechanical breakdowns, tactical evaluations, and comprehensive statistical tracking.`;
        
        await storage.createAnalysis({
          videoId,
          type: "overall",
          title: "Comprehensive Multi-Pass Analysis Summary",
          content: overallContent,
          timestamp: 0,
          confidence: 95,
          metadata: {
            totalSegments: detailedAnalysis.segments.length,
            analysisMethod: "advanced_multi_pass"
          }
        });
        
        console.log(`Advanced analysis completed successfully for video ${videoId}`);
        
        // Update video status to completed after successful advanced analysis
        await storage.updateVideoStatus(videoId, "completed");
        console.log(`Video ${videoId} processing completed with advanced analysis`);
        return; // Exit after successful advanced analysis
        
      } catch (advancedError) {
        console.error("Advanced analysis failed, falling back to standard analysis:", advancedError);
        // Continue with standard analysis below
      }
    }
    
    // Standard single-pass analysis (or fallback from advanced)
    console.log(`Starting standard Gemini analysis for video ${videoId}`);
    const standardAnalysisOptions = {
      playerNumber: analysisOptions?.playerNumber,
      teamName: analysisOptions?.teamName,
      position: analysisOptions?.position,
      level: analysisOptions?.level,
      videoType: analysisOptions?.videoType
    };
    const analysis = await analyzeLacrosseVideo(filePath, title, userPrompt, standardAnalysisOptions);
    console.log(`Standard analysis completed for video ${videoId}`);
    
    // Log analysis details for debugging
    console.log(`Analysis contains:
    - Overall Analysis: ${analysis.overallAnalysis.length} characters
    - Player Evaluations: ${analysis.playerEvaluations.length} players
    - Face-off Analyses: ${analysis.faceOffAnalysis.length} analyses
    - Transition Analyses: ${analysis.transitionAnalysis.length} analyses
    - Key Moments: ${analysis.keyMoments.length} moments`);

    // Use Enhanced Analysis Processor for comprehensive data storage
    console.log("Using Enhanced Analysis Processor for detailed data extraction and storage");
    
    // Store overall analysis with enhanced processing
    await EnhancedAnalysisProcessor.processAndStoreAnalysis(
      videoId,
      "overall",
      analysis.overallAnalysis,
      { 
        type: "overall",
        videoType: analysisOptions?.videoType,
        level: analysisOptions?.level 
      },
      0,
      95
    );

    // Process player evaluations with detailed player profiles
    for (const playerEval of analysis.playerEvaluations) {
      // Skip analyses with confidence below 60%
      if (playerEval.confidence < 60) {
        console.log(`Skipping player evaluation with low confidence (${playerEval.confidence}%)`);
        continue;
      }
      
      await EnhancedAnalysisProcessor.processAndStoreAnalysis(
        videoId,
        "player_evaluation",
        playerEval.evaluation,
        { 
          playerNumber: playerEval.playerNumber,
          timestamp: playerEval.timestamp 
        },
        playerEval.timestamp ? Math.round(playerEval.timestamp) : undefined,
        Math.round(playerEval.confidence)
      );
    }

    // Process face-off analysis with detailed breakdowns
    for (const faceOff of analysis.faceOffAnalysis) {
      // Skip analyses with confidence below 60%
      if (faceOff.confidence < 60) {
        console.log(`Skipping face-off analysis with low confidence (${faceOff.confidence}%)`);
        continue;
      }
      
      await EnhancedAnalysisProcessor.processAndStoreAnalysis(
        videoId,
        "face_off",
        faceOff.analysis,
        { 
          winProbability: faceOff.winProbability,
          timestamp: faceOff.timestamp
        },
        faceOff.timestamp ? Math.round(faceOff.timestamp) : undefined,
        Math.round(faceOff.confidence)
      );
    }

    // Process transition analysis with tactical details
    for (const transition of analysis.transitionAnalysis) {
      // Skip analyses with confidence below 60%
      if (transition.confidence < 60) {
        console.log(`Skipping transition analysis with low confidence (${transition.confidence}%)`);
        continue;
      }
      
      await EnhancedAnalysisProcessor.processAndStoreAnalysis(
        videoId,
        "transition",
        transition.analysis,
        { 
          successProbability: transition.successProbability,
          timestamp: transition.timestamp
        },
        transition.timestamp ? Math.round(transition.timestamp) : undefined,
        Math.round(transition.confidence)
      );
    }

    // Process key moments with play-by-play details
    for (const moment of analysis.keyMoments) {
      // Skip analyses with confidence below 60%
      if (moment.confidence < 60) {
        console.log(`Skipping key moment with low confidence (${moment.confidence}%)`);
        continue;
      }
      
      await EnhancedAnalysisProcessor.processAndStoreAnalysis(
        videoId,
        "key_moment",
        moment.description,
        { 
          momentType: moment.type,
          timestamp: moment.timestamp
        },
        moment.timestamp ? Math.round(moment.timestamp) : undefined,
        Math.round(moment.confidence)
      );
    }

    console.log(`Enhanced analysis processing completed for video ${videoId}`);

    // Update video status to completed
    await storage.updateVideoStatus(videoId, "completed");
    console.log(`Video processing completed successfully for video ${videoId}`);
  } catch (error) {
    console.error(`Error processing video ${videoId}:`, error);
    console.error(`Full error details:`, error instanceof Error ? error.message : error);
    console.error(`Stack trace:`, error instanceof Error ? error.stack : 'No stack trace');
    await storage.updateVideoStatus(videoId, "failed");
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
    await storage.updateVideoStatus(videoId, "processing");
    
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
      metadata: {
        source: 'youtube',
        originalUrl: youtubeUrl,
        thumbnailGenerated: true,
        youtubeMetadata: youtubeMetadata ? {
          originalTitle: youtubeMetadata.title,
          channelTitle: youtubeMetadata.channelTitle,
          duration: youtubeMetadata.duration,
          publishedAt: youtubeMetadata.publishedAt,
          viewCount: youtubeMetadata.viewCount
        } : null
      }
    });
    
    console.log(`Updated video ${videoId} with enhanced title, description, thumbnail and metadata`);

    // Analyze YouTube video with Gemini using custom prompt
    const youtubeAnalysisOptions = {
      playerNumber: analysisOptions?.playerNumber,
      teamName: analysisOptions?.teamName,
      position: analysisOptions?.position,
      level: analysisOptions?.level,
      videoType: analysisOptions?.videoType
    };
    const analysis = await analyzeLacrosseVideoFromYouTube(youtubeUrl, finalTitle, userPrompt, youtubeAnalysisOptions);
    console.log(`YouTube analysis completed for video ${videoId}`);
    
    // Log analysis details for debugging
    console.log(`YouTube Analysis contains:
    - Overall Analysis: ${analysis.overallAnalysis.length} characters
    - Player Evaluations: ${analysis.playerEvaluations.length} players
    - Face-off Analyses: ${analysis.faceOffAnalysis.length} analyses
    - Transition Analyses: ${analysis.transitionAnalysis.length} analyses
    - Key Moments: ${analysis.keyMoments.length} moments`);

    // Store analysis results from YouTube video
    await storage.createAnalysis({
      videoId,
      type: "overall",
      title: "Overall Game Analysis",
      content: analysis.overallAnalysis,
      timestamp: null,
      confidence: 95,
      metadata: { 
        type: "overall",
        source: "youtube" 
      },
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
    console.error(`Error processing YouTube video ${videoId}:`, error);
    console.error(`Full error details:`, error instanceof Error ? error.message : error);
    console.error(`Stack trace:`, error instanceof Error ? error.stack : 'No stack trace');
    await storage.updateVideoStatus(videoId, "failed");
    throw error;
  }
}


