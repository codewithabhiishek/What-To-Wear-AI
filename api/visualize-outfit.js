export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    // Use Pollinations AI (free, no-auth image generation API)
    // We append a random seed to ensure it bypasses caching if needed, though caching is fine.
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&nologo=true&model=flux`;

    // Return the URL immediately. The user's browser will make the GET request to load the image.
    res.status(200).json({ url: imageUrl });

  } catch (error) {
    console.error('Error in visualize-outfit:', error);
    res.status(500).json({ error: error.message });
  }
}
