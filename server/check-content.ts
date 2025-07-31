import { storage } from './storage.js';

async function checkContent() {
  const analyses = await storage.getVideoAnalyses(18);
  
  // Get overall analysis
  const overallAnalysis = analyses.find(a => a.type === 'overall');
  if (overallAnalysis) {
    console.log('=== OVERALL ANALYSIS ===');
    console.log('Title:', overallAnalysis.title);
    console.log('Full Content:\n', overallAnalysis.content);
    console.log('\n');
  }
  
  // Get first player evaluation
  const playerEval = analyses.find(a => a.type === 'player_evaluation');
  if (playerEval) {
    console.log('=== FIRST PLAYER EVALUATION ===');
    console.log('Title:', playerEval.title);
    console.log('Content:\n', playerEval.content);
  }
}

checkContent().catch(console.error);
