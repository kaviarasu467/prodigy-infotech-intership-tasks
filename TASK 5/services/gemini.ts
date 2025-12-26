
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const enhancePostContent = async (text: string, imageData?: string) => {
  try {
    const ai = getAI();
    const parts: any[] = [{ text: `Act as a creative social media manager. Given the following draft content: "${text}". Please provide:
    1. An improved, engaging version of the caption.
    2. A list of 5 relevant trending hashtags.
    Return in JSON format with "caption" and "tags" keys.` }];

    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData.split(',')[1] // remove data:image/jpeg;base64,
        }
      });
    }

    const response = await ai.models.generateContent({
      model: imageData ? 'gemini-1.5-flash' : 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["caption", "tags"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Enhancement failed:", error);
    return null;
  }
};

export const generateSmartComment = async (postContent: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a short, friendly, and relevant comment for this social media post: "${postContent}". Keep it under 15 words.`,
    });
    return response.text.trim();
  } catch (error) {
    return "Cool post! 🔥";
  }
};
