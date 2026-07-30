/**
 * Utility functions for image pre-processing, HEIC conversion, EXIF orientation, and downscaling.
 */

/**
 * Prepares an uploaded File for background removal and cloud storage.
 * - Converts iPhone HEIC/HEIF files to standard JPEG Blobs.
 * - Corrects EXIF orientation so portrait images never rotate.
 * - Downscales large phone photos (e.g. 4032x3024) to maxDimension (default 1400px)
 *   to accelerate WebAssembly processing by 10x and prevent mobile OOM crashes.
 *
 * @param {File|Blob} inputBlob - the raw image File/Blob from input
 * @param {number} maxDimension - maximum width or height in pixels (default 1400)
 * @returns {Promise<{blob: Blob, file: File, originalSize: number, newSize: number, width: number, height: number}>}
 */
export async function prepareUploadImage(inputBlob, maxDimension = 1400) {
  const t0 = performance.now();
  let workingBlob = inputBlob;
  const fileName = inputBlob.name || "photo.jpg";
  const fileExt = fileName.split(".").pop().toLowerCase();
  const isHeic = fileExt === "heic" || fileExt === "heif" || (inputBlob.type || "").includes("heic");

  // Step 1: HEIC / HEIF conversion using heic2any
  if (isHeic) {
    const tHeic0 = performance.now();
    try {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({
        blob: inputBlob,
        toType: "image/jpeg",
        quality: 0.9,
      });
      workingBlob = Array.isArray(converted) ? converted[0] : converted;
      console.log(`[Upload Audit] HEIC converted to JPEG in ${(performance.now() - tHeic0).toFixed(0)}ms`);
    } catch (err) {
      console.error("[Upload Audit] HEIC conversion failed:", err);
      throw new Error("Could not parse HEIC image from camera. Please select a standard JPG or PNG.");
    }
  }

  // Step 2: Decode image with EXIF orientation correction
  let imgBitmap;
  try {
    if ("createImageBitmap" in window) {
      imgBitmap = await createImageBitmap(workingBlob, { imageOrientation: "from-image" });
    }
  } catch {
    // Fallback if createImageBitmap with options fails
    imgBitmap = null;
  }

  let width, height;
  let sourceElement;

  if (imgBitmap) {
    width = imgBitmap.width;
    height = imgBitmap.height;
    sourceElement = imgBitmap;
  } else {
    // Standard HTMLImageElement fallback
    const url = URL.createObjectURL(workingBlob);
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to decode image file."));
      img.src = url;
    });
    URL.revokeObjectURL(url);
    width = img.naturalWidth;
    height = img.naturalHeight;
    sourceElement = img;
  }

  // Step 3: Calculate downscaled dimensions preserving aspect ratio
  let targetWidth = width;
  let targetHeight = height;
  const longestSide = Math.max(width, height);

  if (longestSide > maxDimension) {
    const scale = maxDimension / longestSide;
    targetWidth = Math.round(width * scale);
    targetHeight = Math.round(height * scale);
  }

  // Step 4: Draw to canvas and produce optimized JPEG Blob
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  // High quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(sourceElement, 0, 0, targetWidth, targetHeight);

  if (imgBitmap && imgBitmap.close) {
    imgBitmap.close();
  }

  const processedBlob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.90);
  });

  const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_") + ".jpg";
  const processedFile = new File([processedBlob], cleanName, { type: "image/jpeg" });

  const totalTime = Math.round(performance.now() - t0);
  console.log(`[Upload Audit] Image decode & resize completed in ${totalTime}ms: ${width}x${height} -> ${targetWidth}x${targetHeight} (${(inputBlob.size / 1024 / 1024).toFixed(2)}MB -> ${(processedBlob.size / 1024 / 1024).toFixed(2)}MB)`);

  return {
    blob: processedBlob,
    file: processedFile,
    originalSize: inputBlob.size,
    newSize: processedBlob.size,
    width: targetWidth,
    height: targetHeight,
  };
}
