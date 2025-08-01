import { processYouTubeVideo } from './server/services/videoProcessor';
import { storage } from './server/storage';

async function processVideo30() {
  try {
    console.log("Processing video #30...");
    
    // Update status to uploading first
    await storage.updateVideoStatus(30, 'uploading');
    
    // Process the video
    await processYouTubeVideo(
      30,
      "https://www.youtube.com/watch?v=Yw7fxk1J_vU&pp=ygUZYmxha2UgZmFybnN3b3J0aCBsYWNyb3NzZQ%3D%3D",
      "Blake Farnsworth class of 2026 sophomore spring highlights",
      "",
      {
        videoType: 'highlight',
        useAdvancedAnalysis: true
      }
    );
    
    console.log("✓ Successfully processed video #30");
  } catch (error: any) {
    console.error("Error processing video #30:", error.message);
    if (error.response) {
      console.error("API Response:", error.response);
    }
  }
}

processVideo30();
