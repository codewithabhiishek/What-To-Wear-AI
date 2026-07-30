import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Download the image as base64 to send to Gemini
    const imageResp = await fetch(imageUrl);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    const TAGGING_SCHEMA = {
      type: "object",
      properties: {
        category: { type: "string", enum: ["top", "bottom", "outerwear", "shoes", "accessory"] },
        color_primary: { type: "string" },
        color_secondary: { type: "string" },
        pattern: { type: "string", enum: ["solid", "striped", "printed", "checked", "other"] },
        fit: { type: "string", enum: ["fitted", "regular", "oversized"] },
        formality: { type: "integer" },
        material: { type: "string" },
        season: { type: "string", enum: ["summer", "winter", "all-season"] },
      },
      required: ["category", "color_primary", "pattern", "fit", "formality", "season"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Analyze this clothing item photo and return ONLY valid JSON matching the schema." },
            { inlineData: { data: base64Data, mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: TAGGING_SCHEMA,
      }
    });

    const text = response.text;
    const json = JSON.parse(text);
    
    res.status(200).json(json);
  } catch (error) {
    console.error('Error in tag-clothing-item:', error);
    res.status(500).json({ error: error.message });
  }
}
