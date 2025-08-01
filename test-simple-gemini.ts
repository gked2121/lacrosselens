import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function testSimpleExtraction() {
  try {
    console.log("Testing simple extraction...");
    const youtubeUrl = "https://www.youtube.com/watch?v=Yw7fxk1J_vU";
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
      },
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
              text: `Extract plays from this lacrosse video. Return JSON:
{
  "plays": [
    {
      "startTime": number,
      "endTime": number,
      "description": "what happened",
      "playerInvolved": "jersey color and number"
    }
  ]
}`
            }
          ]
        }
      ]
    });
    
    const result = JSON.parse(response.text || "{}");
    console.log("Plays extracted:", result.plays?.length || 0);
    if (result.plays && result.plays.length > 0) {
      console.log("First play:", result.plays[0]);
    }
    
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

testSimpleExtraction();
