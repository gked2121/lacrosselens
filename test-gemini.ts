import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function testGemini() {
  try {
    console.log("Testing Gemini API with YouTube URL...");
    const youtubeUrl = "https://www.youtube.com/watch?v=DcXPUC4wkgY";
    
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
              text: "Describe what you see in this video in one sentence."
            }
          ]
        }
      ]
    });
    
    console.log("Response:", response.text);
  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("API Response:", error.response);
    }
  }
}

testGemini();
