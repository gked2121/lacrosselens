import { TwoPhaseGeminiAnalyzer } from './server/services/geminiTwoPhase';

async function testTwoPhase() {
  try {
    console.log("Testing two-phase analysis on Blake Farnsworth video...");
    const youtubeUrl = "https://www.youtube.com/watch?v=Yw7fxk1J_vU";
    
    // Phase 1: Extract data
    const rawData = await TwoPhaseGeminiAnalyzer.extractFromYouTube(youtubeUrl);
    
    console.log("Phase 1 Results:");
    console.log("- Plays extracted:", rawData.plays?.length || 0);
    console.log("- Players identified:", rawData.individualPerformance?.length || 0);
    console.log("- Video metadata:", rawData.videoMetadata);
    
    if (rawData.plays && rawData.plays.length > 0) {
      console.log("\nFirst play:", JSON.stringify(rawData.plays[0], null, 2));
    }
    
    if (rawData.individualPerformance && rawData.individualPerformance.length > 0) {
      console.log("\nFirst player stats:", JSON.stringify(rawData.individualPerformance[0], null, 2));
    }
    
  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.stack) {
      console.error("Stack:", error.stack);
    }
  }
}

testTwoPhase();
