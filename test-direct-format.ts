import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function testDirectFormat() {
  try {
    console.log("Testing direct formatting without two-phase...");
    const youtubeUrl = "https://www.youtube.com/watch?v=Yw7fxk1J_vU";
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        {
          parts: [
            {
              fileData: {
                fileUri: youtubeUrl,
                mimeType: "video/mp4"
              }
            },
            {
              text: `You're a lacrosse coach analyzing this video. Talk like you're in the film room with your team.

**What We're Looking At:**
What type of video is this? Who's playing?

**Key Plays:**
List 3-5 key plays with timestamps and what happened.

**Player Evaluation:**
Who stands out and why? Be specific with examples.

**Coaching Adjustments:**
What would you tell your team about playing against this player/team?

Use authentic coaching language and reference specific timestamps.`
            }
          ]
        }
      ]
    });
    
    console.log("Response received, length:", response.text?.length || 0);
    console.log("\nFirst 500 chars:", response.text?.substring(0, 500));
    
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

testDirectFormat();
