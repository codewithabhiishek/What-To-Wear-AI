import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const fallbackTags = {
      category: "top",
      color_primary: "black",
      pattern: "solid",
      fit: "regular",
      formality: 3,
      season: "all-season",
    };

    if (!process.env.NVIDIA_API_KEY) {
      console.warn("NVIDIA_API_KEY missing. Returning default tags.");
      return res.status(200).json(fallbackTags);
    }

    try {
      const openai = new OpenAI({ 
        baseURL: "https://integrate.api.nvidia.com/v1", 
        apiKey: process.env.NVIDIA_API_KEY 
      });

      // Download the image as base64 to send to OpenAI
      const imageResp = await fetch(imageUrl);
      const arrayBuffer = await imageResp.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      const rawMime = imageResp.headers.get('content-type') || 'image/jpeg';
      const mimeType = rawMime.split(';')[0].trim();

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

      const response = await openai.chat.completions.create({
        model: "meta/llama-3.2-90b-vision-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this clothing item photo and return ONLY valid JSON matching this schema exactly. Pay close attention to patterns (checkered, striped) and true colors: " + JSON.stringify(TAGGING_SCHEMA) },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 1024,
      });

      // Llama 3.2 Vision on NVIDIA sometimes wraps JSON in markdown blocks
      let text = response.choices[0]?.message?.content || "{}";
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch (innerError) {
      console.error('NVIDIA API call failed, falling back to manual tag review:', innerError);
      return res.status(200).json(fallbackTags);
    }
  } catch (error) {
    console.error('Error in tag-clothing-item:', error);
    res.status(500).json({ error: error.message });
  }
}
