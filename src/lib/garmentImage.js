/**
 * Produces a temporary, tightly-cropped PNG for a transparent garment image.
 * This removes upload padding without resizing, recolouring, or softening the
 * garment itself. Images without usable alpha data fall back to their source.
 */
export async function trimGarmentImage(source) {
  if (!source) return source;

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = source;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return source;

  context.drawImage(image, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 12) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  // Fully opaque files have no removable background/padding to infer safely.
  if (right < 0 || (left === 0 && top === 0 && right === width - 1 && bottom === height - 1)) return source;

  const padding = Math.max(3, Math.round(Math.min(width, height) * 0.012));
  const cropLeft = Math.max(0, left - padding);
  const cropTop = Math.max(0, top - padding);
  const cropWidth = Math.min(width - cropLeft, right - left + 1 + padding * 2);
  const cropHeight = Math.min(height - cropTop, bottom - top + 1 + padding * 2);
  const cropped = document.createElement("canvas");
  cropped.width = cropWidth;
  cropped.height = cropHeight;
  cropped.getContext("2d").drawImage(canvas, cropLeft, cropTop, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  const blob = await new Promise((resolve) => cropped.toBlob(resolve, "image/png"));
  return blob ? URL.createObjectURL(blob) : source;
}
