import { storage } from "../storage";
import { processVideoUpload, processYouTubeVideo } from "./videoProcessor";

// Constants for retry logic
const PROCESSING_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
const MAX_RETRIES = 1; // Retry once before marking as failed

// Map to track processing start times and retry counts
const processingVideos = new Map<number, { startTime: number; retryCount: number }>();

export function startVideoMonitoring() {
  // Check for stuck videos every 30 seconds
  setInterval(async () => {
    try {
      const videos = await storage.getAllVideos();
      const now = Date.now();
      
      for (const video of videos) {
        if (video.status === 'processing') {
          const trackingInfo = processingVideos.get(video.id);
          
          if (!trackingInfo) {
            // Start tracking this video
            processingVideos.set(video.id, { startTime: now, retryCount: 0 });
          } else {
            // Check if it's been processing too long
            const processingTime = now - trackingInfo.startTime;
            
            if (processingTime > PROCESSING_TIMEOUT) {
              console.log(`Video ${video.id} has been processing for ${Math.round(processingTime / 1000)}s, attempting retry...`);
              
              if (trackingInfo.retryCount < MAX_RETRIES) {
                // Retry the video
                await retryVideoProcessing(video.id);
                trackingInfo.retryCount++;
                trackingInfo.startTime = now; // Reset the timer
              } else {
                // Mark as failed after max retries
                console.error(`Video ${video.id} failed after ${trackingInfo.retryCount} retries`);
                await storage.updateVideo(video.id, { 
                  status: 'failed'
                });
                processingVideos.delete(video.id);
              }
            }
          }
        } else {
          // Remove from tracking if no longer processing
          processingVideos.delete(video.id);
        }
      }
    } catch (error) {
      console.error('Error in video monitoring:', error);
    }
  }, CHECK_INTERVAL);
  
  console.log('Video retry monitoring service started');
}

export async function retryVideoProcessing(videoId: number): Promise<void> {
  try {
    const video = await storage.getVideo(videoId);
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }
    
    console.log(`Retrying video ${videoId}: ${video.title}`);
    
    // Update status to processing
    await storage.updateVideo(videoId, { status: 'processing' });
    
    // Track this retry
    const trackingInfo = processingVideos.get(videoId) || { startTime: Date.now(), retryCount: 0 };
    processingVideos.set(videoId, trackingInfo);
    
    // Process based on video type
    if (video.youtubeUrl) {
      await processYouTubeVideo(
        videoId, 
        video.youtubeUrl, 
        video.title,
        video.userPrompt || undefined,
        {
          playerNumber: video.playerNumber || undefined,
          teamName: video.teamName || undefined,
          position: video.position || undefined,
          level: video.level as any || 'high_school',
          videoType: 'game',
          useAdvancedAnalysis: true
        }
      );
    } else if (video.filePath) {
      await processVideoUpload(
        videoId, 
        video.filePath, 
        video.title,
        video.userPrompt || undefined,
        {
          playerNumber: video.playerNumber || undefined,
          teamName: video.teamName || undefined,
          position: video.position || undefined,
          level: video.level as any || 'high_school',
          videoType: 'game',
          useAdvancedAnalysis: true
        }
      );
    } else {
      throw new Error('Video has neither file path nor YouTube URL');
    }
  } catch (error) {
    console.error(`Error retrying video ${videoId}:`, error);
    await storage.updateVideo(videoId, { 
      status: 'failed'
    });
    processingVideos.delete(videoId);
  }
}

// Clean up old tracking entries on startup
export function cleanupTracking() {
  processingVideos.clear();
}