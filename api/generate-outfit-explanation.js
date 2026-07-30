import OpenAI from "openai";

async function fetchWithRetry(fn, retries = 2, delayMs = 1000) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`[DeepSeek Explanation Retry] Attempt ${attempt + 1}/${retries + 1} failed: ${err.message}`);
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

  const fallbackExplanation = "A well-balanced combination matching the formality level and color tones for this occasion.";

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      console.warn("[DeepSeek Explanation] Missing DEEPSEEK_API_KEY / NVIDIA_API_KEY. Using fallback.");
      return res.status(200).json({ explanation: fallbackExplanation });
    }

    const isDeepSeekKey = process.env.DEEPSEEK_API_KEY && !process.env.DEEPSEEK_API_KEY.startsWith("nvapi-");
    const baseURL = process.env.DEEPSEEK_BASE_URL || (isDeepSeekKey ? "https://api.deepseek.com" : "https://integrate.api.nvidia.com/v1");
    const model = process.env.DEEPSEEK_MODEL || (isDeepSeekKey ? "deepseek-chat" : "deepseek-ai/deepseek-v4-flash");

    const openai = new OpenAI({ 
      baseURL, 
      apiKey,
      timeout: 10000, // 10 second timeout per attempt
    });

    const text = await fetchWithRetry(async () => {
      const chatCompletion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 250,
      });

      return chatCompletion.choices[0]?.message?.content?.trim() || fallbackExplanation;
    });
    
    return res.status(200).json({ explanation: text });

  } catch (error) {
    console.error('[DeepSeek Explanation Error] Final failure after retries:', error.message || error);
    return res.status(200).json({ explanation: fallbackExplanation });
  }
}
