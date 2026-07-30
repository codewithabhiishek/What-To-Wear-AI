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

    const fallbackExplanation = "A well-balanced combination matching the formality level and color tones for this occasion.";

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-key") {
      return res.status(200).json({ explanation: fallbackExplanation });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text;
      
      return res.status(200).json({ explanation: text });
    } catch (innerError) {
      console.error('Gemini explanation call failed, using fallback:', innerError);
      return res.status(200).json({ explanation: fallbackExplanation });
    }
  } catch (error) {
    console.error('Error in generate-outfit-explanation:', error);
    res.status(500).json({ error: error.message });
  }
}
