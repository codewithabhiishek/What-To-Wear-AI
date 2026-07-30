import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Check, AlertCircle, RefreshCw } from "lucide-react";
import { db } from "@/api/firebaseClient";
import { collection, doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import TagEditor from "./TagEditor";
import { prepareUploadImage } from "@/lib/imageUtils";

function normalizeTags(result) {
  return {
    category: result.category || "top",
    color_primary: result.color_primary || "",
    color_secondary: result.color_secondary || null,
    pattern: result.pattern || "solid",
    fit: result.fit || "regular",
    formality: Number(result.formality) || 3,
    material: result.material || null,
    season: result.season || "all-season",
  };
}

const PHASE = {
  SELECT: "select",
  PREPARING: "preparing",
  PROCESSING_BG: "processing_bg",
  UPLOADING: "uploading",
  TAGGING: "tagging",
  EDITING: "editing",
  SAVING: "saving",
};

export default function UploadItemDialog({ open, onOpenChange, onSaved, onFileSelected }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState(PHASE.SELECT);
  const [statusMessage, setStatusMessage] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [tags, setTags] = useState(null);
  const [error, setError] = useState(null);

  const reset = () => {
    setPhase(PHASE.SELECT);
    setStatusMessage("");
    setImageUrl(null);
    setTags(null);
    setError(null);
  };

  const handleClose = (open) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleSelectFile = (file) => {
    if (!file) return;
    if (onFileSelected) {
      onFileSelected(file);
      handleClose(false);
      return;
    }
    processFile(file);
  };

  const processFile = async (rawFile) => {
    if (!rawFile || !user) return;
    setError(null);
    const pipelineStart = performance.now();

    try {
      // -----------------------------------------------------------------------
      // Stage 1: Image Selection, Decoding, EXIF Correction & Resizing
      // -----------------------------------------------------------------------
      setPhase(PHASE.PREPARING);
      setStatusMessage("Preparing & resizing photo for fast processing…");

      const tPrepStart = performance.now();
      const prepared = await prepareUploadImage(rawFile, 1400);
      const prepTime = Math.round(performance.now() - tPrepStart);

      // -----------------------------------------------------------------------
      // Stage 2: Client-side Background Removal (with Timeout & Fallback)
      // -----------------------------------------------------------------------
      setPhase(PHASE.PROCESSING_BG);
      setStatusMessage("Removing background…");

      const tBgStart = performance.now();
      let uploadFile = prepared.file;

      try {
        const { removeBackground } = await import("@imgly/background-removal");
        
        // 30-second abort controller timeout to prevent hanging on slow hardware
        const bgPromise = removeBackground(prepared.blob);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("BG_TIMEOUT")), 30000)
        );

        const transparentBlob = await Promise.race([bgPromise, timeoutPromise]);
        
        const cleanName = rawFile.name.replace(/\.[^/.]+$/, "") + ".png";
        uploadFile = new File([transparentBlob], cleanName, { type: "image/png" });

        const bgTime = Math.round(performance.now() - tBgStart);
        console.log(`[Upload Audit] Background removal completed in ${bgTime}ms`);
      } catch (bgErr) {
        console.warn("[Upload Audit] Background removal skipped/failed:", bgErr.message);
        // Fallback: Continue with the pre-resized clean JPEG
        uploadFile = prepared.file;
      }

      // -----------------------------------------------------------------------
      // Stage 3: Upload photo to Vercel Blob
      // -----------------------------------------------------------------------
      setPhase(PHASE.UPLOADING);
      setStatusMessage("Uploading photo to cloud storage…");

      const tUploadStart = performance.now();
      const filename = `${Date.now()}_${uploadFile.name}`;
      
      const uploadRes = await fetch(`/api/upload-photo?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: uploadFile,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => "");
        throw new Error(`Cloud upload failed (${uploadRes.status}): ${errorText || "Network or size limit issue"}`);
      }
      
      const uploadData = await uploadRes.json();
      const file_url = uploadData.url;
      setImageUrl(file_url);

      const uploadTime = Math.round(performance.now() - tUploadStart);
      console.log(`[Upload Audit] Vercel Blob upload completed in ${uploadTime}ms -> ${file_url}`);

      // -----------------------------------------------------------------------
      // Stage 4: AI Tagging
      // -----------------------------------------------------------------------
      setPhase(PHASE.TAGGING);
      setStatusMessage("Analyzing clothing item with AI…");

      const tTagStart = performance.now();
      const res = await fetch("/api/tag-clothing-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: file_url })
      });

      if (!res.ok) {
        throw new Error("AI tagging failed to analyze the clothing photo.");
      }

      const result = await res.json();
      const tagTime = Math.round(performance.now() - tTagStart);
      const totalPipelineTime = Math.round(performance.now() - pipelineStart);

      console.log(`
==================================================
[UPLOAD PIPELINE AUDIT COMPLETED]
├── Resize & EXIF: ${prepTime}ms
├── Vercel Upload: ${uploadTime}ms
├── AI Tagging:    ${tagTime}ms
└── TOTAL TIME:    ${totalPipelineTime}ms
==================================================
`);

      // -----------------------------------------------------------------------
      // Stage 5: Tag Review & Edit
      // -----------------------------------------------------------------------
      setTags(normalizeTags(result));
      setPhase(PHASE.EDITING);
    } catch (e) {
      console.error("[Upload Audit] Pipeline error:", e);
      setError(e?.message || "An unexpected error occurred during upload.");
      setPhase(PHASE.SELECT);
    }
  };

  const handleSave = async () => {
    setPhase(PHASE.SAVING);
    setStatusMessage("Saving item to your wardrobe…");
    const tSaveStart = performance.now();

    try {
      const newItemRef = doc(collection(db, "users", user.id, "clothingItems"));
      await setDoc(newItemRef, {
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
        created_date: new Date().toISOString()
      });

      console.log(`[Upload Audit] Firestore save completed in ${Math.round(performance.now() - tSaveStart)}ms`);
      onSaved?.();
      handleClose(false);
    } catch (e) {
      setError(e?.message || "Could not save to database. Please check your connection.");
      setPhase(PHASE.EDITING);
    }
  };

  const isProcessing =
    phase === PHASE.PREPARING ||
    phase === PHASE.PROCESSING_BG ||
    phase === PHASE.UPLOADING;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a clothing item</DialogTitle>
          <DialogDescription>
            {phase === PHASE.EDITING
              ? "AI tagged your item. Correct anything that's off, then save."
              : "Upload a photo — we'll prepare it, remove the background, and AI will tag it."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 p-3.5 text-sm text-destructive border border-destructive/20">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold">Upload failed</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Stage 1-3: File selection & Progress */}
        {(phase === PHASE.SELECT || isProcessing) && (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20 p-6">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="space-y-1">
                  <p className="font-medium text-sm text-foreground">{statusMessage}</p>
                  <p className="text-xs text-muted-foreground">Please keep this window open.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-primary px-6 py-4 text-primary-foreground shadow-sm hover:bg-primary/90">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  <span className="font-medium">Take Photo</span>
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleSelectFile(e.target.files?.[0])}
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-background px-6 py-4 shadow-sm transition-colors hover:bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="hidden"
                    onChange={(e) => handleSelectFile(e.target.files?.[0])}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Stage 4: AI Tagging step */}
        {phase === PHASE.TAGGING && imageUrl && (
          <div className="space-y-4">
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-muted border">
              <img
                src={imageUrl}
                alt="item"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>{statusMessage}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="skeleton h-3 w-16 rounded-full" />
                  <div className="skeleton h-9 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 5: Tag review / edit step */}
        {(phase === PHASE.EDITING || phase === PHASE.SAVING) &&
          imageUrl &&
          tags && (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              <div className="flex gap-4 items-center">
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-muted border">
                  <img
                    src={imageUrl}
                    alt="item"
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review the AI's tags below. Tap any field to fix it if anything is incorrect.
                </p>
              </div>
              <TagEditor tags={tags} onChange={setTags} />
            </div>
          )}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={phase === PHASE.SAVING}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={phase !== PHASE.EDITING || !tags}
          >
            {phase === PHASE.SAVING ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Save item
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
