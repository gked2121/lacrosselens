import { processYouTubeVideo } from './server/services/videoProcessor';
import { storage } from './server/storage';

async function reprocessVideo29() {
  try {
    console.log("Reprocessing video #29 with fixed two-phase extraction...");
    
    // Clear old analyses first
    await storage.db.delete(storage.db.schema.analyses).where(
      storage.db.eq(storage.db.schema.analyses.videoId, 29)
    );
    
    // Update status
    await storage.updateVideoStatus(29, 'uploading');
    
    // Process with fixed extraction
    await processYouTubeVideo(
      29,
      "https://www.youtube.com/watch?v=cNQxaUlmZwo",
      "4⭐️| Blake Farnsworth| defense/lsm(2026) summer 2024 highlights",
      "",
      {
        videoType: 'highlight',
        useAdvancedAnalysis: true
      }
    );
    
    console.log("✓ Successfully reprocessed video #29");
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

reprocessVideo29();
