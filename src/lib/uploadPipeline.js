import { prepareUploadImage } from "./imageUtils";
import { db } from "@/api/firebaseClient";
import { collection, doc, setDoc } from "firebase/firestore";

function normalizeTags(result) {
  return {
    category: result.category || "top",
    color_primary: result.color_primary || "multicolor",
    color_secondary: result.color_secondary || null,
    pattern: result.pattern || "solid",
    fit: result.fit || "regular",
    formality: Number(result.formality) || 3,
    material: result.material || null,
    season: result.season || "all-season",
  };
}

/**
 * Executes the complete background upload pipeline for a clothing item file.
 * Accepts an onProgress callback to update optimistic UI state in real-time.
 *
 * @param {File|Blob} rawFile - the photo selected by the user
 * @param {string} userId - current authenticated user ID
 * @param {function(string): void} onProgress - status message callback
 * @returns {Promise<Object>} saved Firestore document object
 */
export async function executeUploadPipeline(rawFile, userId, onProgress) {
  const pipelineStart = performance.now();

  // 1. Prepare, decode, EXIF orientation & resize to max 1400px
  onProgress?.("Preparing image…");
  const tPrepStart = performance.now();
  const prepared = await prepareUploadImage(rawFile, 1400);
  const prepTime = Math.round(performance.now() - tPrepStart);

  // 2. Background removal (with 30s timeout & fallback)
  onProgress?.("Removing background…");
  const tBgStart = performance.now();
  let uploadFile = prepared.file;

  try {
    const { removeBackground } = await import("@imgly/background-removal");
    const bgPromise = removeBackground(prepared.blob);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("BG_TIMEOUT")), 30000)
    );

    const transparentBlob = await Promise.race([bgPromise, timeoutPromise]);
    const cleanName = (rawFile.name || "photo").replace(/\.[^/.]+$/, "") + ".png";
    uploadFile = new File([transparentBlob], cleanName, { type: "image/png" });
    console.log(`[Upload Pipeline] BG removal in ${Math.round(performance.now() - tBgStart)}ms`);
  } catch (bgErr) {
    console.warn("[Upload Pipeline] BG removal fallback used:", bgErr.message);
    uploadFile = prepared.file;
  }

  // 3. Vercel Blob cloud upload
  onProgress?.("Uploading photo…");
  const tUploadStart = performance.now();
  const filename = `${Date.now()}_${uploadFile.name}`;

  const uploadRes = await fetch(`/api/upload-photo?filename=${encodeURIComponent(filename)}`, {
    method: "POST",
    body: uploadFile,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => "");
    throw new Error(`Cloud upload failed (${uploadRes.status}): ${errText || "Network or limit issue"}`);
  }

  const uploadData = await uploadRes.json();
  const imageUrl = uploadData.url;
  console.log(`[Upload Pipeline] Cloud upload in ${Math.round(performance.now() - tUploadStart)}ms`);

  // 4. AI Tagging API
  onProgress?.("Analyzing with AI…");
  const tTagStart = performance.now();
  const tagRes = await fetch("/api/tag-clothing-item", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });

  let rawTags = {};
  if (tagRes.ok) {
    rawTags = await tagRes.json();
  } else {
    console.warn("[Upload Pipeline] AI tagging failed, using fallback tags.");
  }
  const tags = normalizeTags(rawTags);
  console.log(`[Upload Pipeline] AI tagging in ${Math.round(performance.now() - tTagStart)}ms`);

  // 5. Firestore Save
  onProgress?.("Saving item…");
  const tSaveStart = performance.now();
  const newItemRef = doc(collection(db, "users", userId, "clothingItems"));
  const itemData = {
    image_url: imageUrl,
    category: tags.category,
    color_primary: tags.color_primary,
    color_secondary: tags.color_secondary || null,
    pattern: tags.pattern,
    fit: tags.fit,
    formality: Number(tags.formality),
    material: tags.material || null,
    season: tags.season,
    laundry_status: "clean",
    created_date: new Date().toISOString(),
  };

  await setDoc(newItemRef, itemData);
  console.log(`[Upload Pipeline] Firestore save in ${Math.round(performance.now() - tSaveStart)}ms (Total: ${Math.round(performance.now() - pipelineStart)}ms)`);

  return {
    id: newItemRef.id,
    ...itemData,
  };
}
