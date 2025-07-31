// Simple script to retry failed YouTube videos
import { processYouTubeVideo } from './services/videoProcessor.js';
import { storage } from './storage.js';

console.log('Starting failed video retry process...');

async function retryFailedVideos() {
  try {
    // Get all failed videos
    const videos = await storage.getAllVideos();
    const failedVideos = videos.filter(v => v.status === 'failed' && v.youtubeUrl);
    
    console.log(`Found ${failedVideos.length} failed YouTube videos to retry`);
    
    for (const video of failedVideos) {
      console.log(`\nRetrying video ${video.id}: ${video.title}`);
      console.log(`YouTube URL: ${video.youtubeUrl}`);
      
      try {
        // Reset status to uploading
        await storage.updateVideoStatus(video.id, 'uploading');
        
        // Retry processing
        await processYouTubeVideo(
          video.id,
          video.youtubeUrl,
          video.title,
          video.userPrompt,
          {
            videoType: 'highlight',
            useAdvancedAnalysis: true
          }
        );
        
        console.log(`✓ Successfully retried video ${video.id}`);
      } catch (error) {
        console.error(`✗ Failed to retry video ${video.id}:`, error.message);
        await storage.updateVideoStatus(video.id, 'failed');
      }
    }
    
    console.log('\nRetry process completed');
  } catch (error) {
    console.error('Error in retry process:', error);
  }
}

retryFailedVideos();