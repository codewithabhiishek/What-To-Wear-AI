import OpenAI from "openai";

async function fetchWithRetry(fn, retries = 2, delayMs = 1000) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`[Llama 3.2 Vision Retry] Attempt ${attempt + 1}/${retries + 1} failed: ${err.message}`);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const fallbackTags = {
    category: "top",
    color_primary: "black",
    pattern: "solid",
    fit: "regular",
    formality: 3,
    season: "all-season",
  };

  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      console.warn("[Llama 3.2 Vision] Missing NVIDIA_API_KEY. Returning default fallback tags.");
      return res.status(200).json(fallbackTags);
    }

    const openai = new OpenAI({ 
      baseURL: "https://integrate.api.nvidia.com/v1", 
      apiKey,
      timeout: 25000, // 25 second timeout per attempt
    });

    const json = await fetchWithRetry(async () => {
      // Download the image as base64 to send to OpenAI format
      const imageResp = await fetch(imageUrl);
      if (!imageResp.ok) {
        throw new Error(`Failed to fetch image from URL (${imageResp.status})`);
      }

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

      let text = response.choices[0]?.message?.content || "{}";
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(text);
    });

    return res.status(200).json(json);

  } catch (error) {
    console.error('[Llama 3.2 Vision Error] Final failure after retries:', error.message || error);
    return res.status(200).json(fallbackTags);
  }
}
