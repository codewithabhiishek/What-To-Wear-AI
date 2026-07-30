import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Imagen 3 requires imagen-3.0-generate-001 model in the new SDK
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "3:4"
      }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const b64 = response.generatedImages[0].image.imageBytes;
      // Convert base64 back to data URL so the frontend can display it easily
      const imageUrl = `data:image/jpeg;base64,${b64}`;
      res.status(200).json({ url: imageUrl });
    } else {
      throw new Error("No image generated");
    }
  } catch (error) {
    console.error('Error in visualize-outfit:', error);
    res.status(500).json({ error: error.message });
  }
}
