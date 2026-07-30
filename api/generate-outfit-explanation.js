import Groq from "groq-sdk";

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

    if (!process.env.GROQ_API_KEY) {
      return res.status(200).json({ explanation: fallbackExplanation });
    }

    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const chatCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      });

      const text = chatCompletion.choices[0]?.message?.content || fallbackExplanation;
      
      return res.status(200).json({ explanation: text });
    } catch (innerError) {
      console.error('Groq explanation call failed, using fallback:', innerError);
      return res.status(200).json({ explanation: fallbackExplanation });
    }
  } catch (error) {
    console.error('Error in generate-outfit-explanation:', error);
    res.status(500).json({ error: error.message });
  }
}
