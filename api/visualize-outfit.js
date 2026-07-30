import OpenAI from "openai";

async function fetchWithRetry(fn, retries = 2, delayMs = 1000) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`[Qwen Image Retry] Attempt ${attempt + 1}/${retries + 1} failed: ${err.message}`);
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

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const apiKey = process.env.QWEN_IMAGE_API_KEY || process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      console.warn("[Qwen Image] Missing QWEN_IMAGE_API_KEY / NVIDIA_API_KEY. Using fallback URL generator.");
      const encodedPrompt = encodeURIComponent(prompt);
      return res.status(200).json({
        url: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&nologo=true`
      });
    }

    const baseURL = process.env.QWEN_BASE_URL || "https://integrate.api.nvidia.com/v1";
    const model = process.env.QWEN_IMAGE_MODEL || "qwen/qwen-2.5-72b-instruct";

    const openai = new OpenAI({ 
      baseURL, 
      apiKey,
      timeout: 15000, // 15 second timeout per attempt
    });

    const imageUrl = await fetchWithRetry(async () => {
      // 1. Try dedicated Qwen Image Generation API
      try {
        const response = await openai.images.generate({
          model: "qwen/qwen-image",
          prompt,
          n: 1,
          size: "1024x1024",
        });
        if (response.data?.[0]?.url) {
          return response.data[0].url;
        }
      } catch (imgErr) {
        console.warn("[Qwen Image API] Image generation endpoint notice:", imgErr.message);
      }

      // 2. Multimodal Chat completion format for Qwen model
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: "user", content: `Generate a high resolution e-commerce product photograph matching this prompt: ${prompt}` }
        ],
        temperature: 0.2,
      });

      const text = response.choices[0]?.message?.content || "";
      const urlMatch = text.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp)/i);
      if (urlMatch) {
        return urlMatch[0];
      }

      // 3. Robust fallback URL if text response does not contain direct link
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&nologo=true`;
    });

    return res.status(200).json({ url: imageUrl });

  } catch (error) {
    console.error('[Qwen Image Error] Final failure after retries:', error.message || error);
    const encodedPrompt = encodeURIComponent(req.body.prompt || "clothing outfit");
    return res.status(200).json({
      url: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&nologo=true`
    });
  }
}
