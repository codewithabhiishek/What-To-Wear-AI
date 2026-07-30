
// =============================================================================
// Outfit "on model" visualization — image generation + per-combo cache.
// -----------------------------------------------------------------------------
// Caching is device-local (localStorage) and keyed by the sorted item IDs +
// occasion, so re-viewing the exact same outfit doesn't trigger another paid
// image generation. Move this to a persisted entity later if cross-device
// caching is needed.
// =============================================================================

const CACHE_PREFIX = "wardrobe_viz_v2_";

export function buildComboKey(items, occasion) {
  const ids = items.map((i) => i.id).sort().join(",");
  return `${CACHE_PREFIX}${(occasion || "").toLowerCase()}|${ids}`;
}

function getCached(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setCached(key, url) {
  try {
    localStorage.setItem(key, url);
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

export function describeForImage(item) {
  const parts = [];
  if (item.color_primary) parts.push(item.color_primary);
  if (item.pattern && item.pattern !== "solid") parts.push(item.pattern);
  if (item.fit && item.fit !== "regular") parts.push(item.fit);
  parts.push(item.category);
  if (item.material) parts.push(`made of ${item.material}`);
  return parts.join(" ");
}

export function buildVisualizePrompt(items) {
  const list = items.map(describeForImage).join(", ");
  return `Professional e-commerce product photography of a clean, bright white headless retail mannequin standing on a seamless white background, wearing this exact outfit: ${list}. High-end studio lighting, minimalist, clean, 8k resolution, crisp photorealistic style. The clothing should be the absolute main focus. No text, no logos.`;
}

export async function visualizeOutfit(items, occasion) {
  const key = buildComboKey(items, occasion);
  const cached = getCached(key);
  if (cached) return { imageUrl: cached, cached: true };

  const prompt = buildVisualizePrompt(items);

  const res = await fetch("/api/visualize-outfit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) {
    throw new Error("Failed to visualize outfit");
  }

  const { url } = await res.json();

  setCached(key, url);
  return { imageUrl: url, cached: false };
}