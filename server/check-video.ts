import { storage } from './storage.js';

async function checkVideo() {
  // Get video 18
  const video = await storage.getVideo(18);
  console.log('Video:', video);

  // Get analyses for video 18
  const analyses = await storage.getVideoAnalyses(18);
  console.log('\nAnalyses count:', analyses.length);
  console.log('\nAnalysis types:', analyses.map(a => a.type));
  
  // Check for overall analysis
  const overallAnalysis = analyses.find(a => a.type === 'overall');
  if (overallAnalysis) {
    console.log('\nOverall Analysis found:');
    console.log('Title:', overallAnalysis.title);
    console.log('Content preview:', overallAnalysis.content.substring(0, 300) + '...');
  }
  
  // Check player evaluations
  const playerEvals = analyses.filter(a => a.type === 'player_evaluation');
  console.log('\nPlayer evaluations count:', playerEvals.length);
  if (playerEvals.length > 0) {
    console.log('First player eval:', playerEvals[0].title);
  }
}

checkVideo().catch(console.error);
