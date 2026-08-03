const MODEL = "qwen/qwen-image-edit-2511";

function baseUrl() {
  const configured = process.env.QWEN_IMAGE_EDIT_BASE_URL;
  return configured ? configured.replace(/\/$/, "") : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const { referenceImage } = req.body || {};
  if (!referenceImage?.startsWith("data:image/")) return res.status(400).json({ error: "A garment reference image is required." });

  const endpoint = baseUrl();
  const apiKey = process.env.QWEN_IMAGE_EDIT_API_KEY;
  if (!endpoint || !apiKey) {
    return res.status(503).json({ error: "AI Styled Preview is not configured. Set QWEN_IMAGE_EDIT_BASE_URL and QWEN_IMAGE_EDIT_API_KEY." });
  }

  const prompt = [
    "Create a premium fashion ecommerce studio photograph of one neutral, faceless retail mannequin.",
    "Dress it only in the exact garments shown in the supplied reference board.",
    "Preserve the garment colors, logos, graphics, stitching, denim texture, fabric patterns, wrinkles, proportions, and silhouettes.",
    "Do not substitute, add, remove, recolor, or invent clothing. Soft neutral studio lighting, seamless warm-white background, full-length front view.",
  ].join(" ");

  try {
    const response = await fetch(`${endpoint}/images/edits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: MODEL, prompt, image: referenceImage, n: 1, response_format: "b64_json" }),
      signal: AbortSignal.timeout(90000),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: payload.error?.message || "NVIDIA image edit request failed." });
    const encoded = payload.data?.[0]?.b64_json;
    if (!encoded) return res.status(502).json({ error: "NVIDIA did not return an image." });
    return res.status(200).json({ image: `data:image/png;base64,${encoded}` });
  } catch (error) {
    return res.status(502).json({ error: error.name === "TimeoutError" ? "AI preview timed out." : "AI preview request failed." });
  }
}
