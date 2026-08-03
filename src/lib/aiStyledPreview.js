const CACHE_NAME = "what-to-wear-ai-styled-preview-v1";

function orderedItems(items) {
  const order = ["top", "bottom", "outerwear", "shoes", "accessory"];
  return [...items].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
}

async function loadImage(source) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = source;
  });
  return image;
}

function drawMannequin(context, x, y, scale) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  const gradient = context.createLinearGradient(-45, 0, 45, 0);
  gradient.addColorStop(0, "#cfd2d2");
  gradient.addColorStop(0.48, "#fbfbf8");
  gradient.addColorStop(1, "#c7c9c8");
  context.fillStyle = gradient;
  context.beginPath(); context.ellipse(0, -154, 32, 40, 0, 0, Math.PI * 2); context.fill();
  context.fillRect(-18, -114, 36, 35);
  context.beginPath(); context.moveTo(-49, -77); context.quadraticCurveTo(0, -99, 49, -77); context.lineTo(39, 73); context.quadraticCurveTo(0, 88, -39, 73); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(-37, 76); context.lineTo(-45, 255); context.lineTo(-8, 255); context.lineTo(-1, 80); context.closePath(); context.fill();
  context.beginPath(); context.moveTo(37, 76); context.lineTo(45, 255); context.lineTo(8, 255); context.lineTo(1, 80); context.closePath(); context.fill();
  context.restore();
}

export function buildAiPreviewKey(items) {
  return orderedItems(items).map((item) => `${item.id}:${item.image_url}`).join("|");
}

export async function getCachedAiPreview(key) {
  if (!("caches" in window)) return null;
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(`/ai-styled-preview/${encodeURIComponent(key)}`);
  return response ? response.blob() : null;
}

async function cacheAiPreview(key, blob) {
  if (!("caches" in window)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(`/ai-styled-preview/${encodeURIComponent(key)}`, new Response(blob, { headers: { "Content-Type": blob.type || "image/png" } }));
}

// A single source image is intentional: it matches NVIDIA's documented Qwen
// Edit request contract while preserving every supplied garment reference.
export async function createGarmentReferenceBoard(items) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  const background = context.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, "#fafaf7");
  background.addColorStop(1, "#e9ece7");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#4c534d";
  context.font = "600 22px system-ui, sans-serif";
  context.fillText("GARMENT REFERENCES", 42, 54);
  context.font = "16px system-ui, sans-serif";
  context.fillStyle = "#697069";
  context.fillText("Use the exact photographed garments below", 42, 82);
  drawMannequin(context, 450, 470, 1.85);
  context.fillStyle = "rgba(48, 54, 49, 0.16)";
  context.beginPath(); context.ellipse(450, 1018, 132, 18, 0, 0, Math.PI * 2); context.fill();

  const references = orderedItems(items).slice(0, 4);
  const positions = [
    { x: 42, y: 132, w: 185, h: 260 }, { x: 673, y: 132, w: 185, h: 260 },
    { x: 42, y: 720, w: 185, h: 260 }, { x: 673, y: 720, w: 185, h: 260 },
  ];

  await Promise.all(references.map(async (item, index) => {
    const position = positions[index];
    context.fillStyle = "rgba(255,255,255,.72)";
    context.fillRect(position.x, position.y, position.w, position.h);
    context.strokeStyle = "rgba(87, 96, 88, .16)";
    context.strokeRect(position.x, position.y, position.w, position.h);
    try {
      const image = await loadImage(item.image_url);
      const ratio = Math.min((position.w - 18) / image.naturalWidth, (position.h - 44) / image.naturalHeight);
      const width = image.naturalWidth * ratio;
      const height = image.naturalHeight * ratio;
      context.drawImage(image, position.x + (position.w - width) / 2, position.y + 10 + (position.h - 44 - height) / 2, width, height);
    } catch {
      // The server still receives a valid mannequin reference if a source image
      // cannot be read cross-origin; Styled Form remains available as fallback.
    }
    context.fillStyle = "#4c534d";
    context.font = "600 14px system-ui, sans-serif";
    context.fillText((item.category || "garment").toUpperCase(), position.x + 12, position.y + position.h - 15);
  }));

  return canvas.toDataURL("image/png");
}

export async function generateAiStyledPreview(items) {
  const key = buildAiPreviewKey(items);
  const cached = await getCachedAiPreview(key);
  if (cached) return { imageUrl: URL.createObjectURL(cached), cached: true };

  const referenceImage = await createGarmentReferenceBoard(items);
  const response = await fetch("/api/create-ai-styled-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referenceImage }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.image) throw new Error(payload.error || "AI preview could not be created.");

  const imageResponse = await fetch(payload.image);
  if (!imageResponse.ok) throw new Error("AI preview image could not be read.");
  const blob = await imageResponse.blob();
  await cacheAiPreview(key, blob);
  return { imageUrl: URL.createObjectURL(blob), cached: false };
}
