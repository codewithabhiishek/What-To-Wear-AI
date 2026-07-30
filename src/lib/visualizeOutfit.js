
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

// Visual-focused description of one item for the image prompt.
function describeForImage(item) {
  const base = [item.color_primary, item.pattern, item.fit, item.category]
    .filter(Boolean)
    .join(" ");
  return item.material ? `${base} made of ${item.material}` : base;
}

export function buildVisualizePrompt(items) {
  const list = items.map(describeForImage).join(", ");
  return `High-end fashion editorial photography, full-body shot of a stylish, attractive fashion model wearing this exact outfit: ${list}. Studio lighting, Vogue magazine style, photorealistic, 8k resolution, confident pose. The clothing should be the absolute main focus. No text, no logos.`;
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