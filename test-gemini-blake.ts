import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function testBlakeVideo() {
  try {
    console.log("Testing Gemini API with Blake Farnsworth video...");
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
              text: "This is a lacrosse highlight video. Describe the first play you see in the video."
            }
          ]
        }
      ]
    });
    
    console.log("Response:", response.text);
  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Status Text:", error.response.statusText);
    }
  }
}

testBlakeVideo();
