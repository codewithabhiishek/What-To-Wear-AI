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
import { Loader2, Upload, Check, AlertCircle } from "lucide-react";
import { db } from "@/api/firebaseClient";
import { collection, doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import TagEditor from "./TagEditor";

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
  PROCESSING_BG: "processing_bg",
  UPLOADING: "uploading",
  TAGGING: "tagging",
  EDITING: "editing",
  SAVING: "saving",
};

export default function UploadItemDialog({ open, onOpenChange, onSaved }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState(PHASE.SELECT);
  const [imageUrl, setImageUrl] = useState(null);
  const [tags, setTags] = useState(null);
  const [error, setError] = useState(null);

  const reset = () => {
    setPhase(PHASE.SELECT);
    setImageUrl(null);
    setTags(null);
    setError(null);
  };

  const handleClose = (open) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const processFile = async (file) => {
    if (!file || !user) return;
    setError(null);
    try {
      // 1. Remove background client-side
      setPhase(PHASE.PROCESSING_BG);
      const { removeBackground } = await import("@imgly/background-removal");
      
      // We pass the raw File object. removeBackground works with Blob/File/URL.
      const transparentBlob = await removeBackground(file);
      
      // Convert Blob to File to pass to Vercel Blob
      // .png extension because removeBackground outputs PNG for transparency
      const cleanFile = new File([transparentBlob], file.name.replace(/\.[^/.]+$/, "") + ".png", { type: "image/png" });

      // 2. Upload the processed photo to Vercel Blob via our serverless function
      setPhase(PHASE.UPLOADING);
      const filename = `${Date.now()}_${cleanFile.name}`;
      
      const uploadRes = await fetch(`/api/upload-photo?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: cleanFile,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload photo");
      }
      
      const uploadData = await uploadRes.json();
      const file_url = uploadData.url;
      setImageUrl(file_url);

      // 3. Send to Vercel API for structured tagging.
      setPhase(PHASE.TAGGING);
      const res = await fetch("/api/tag-clothing-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: file_url })
      });
      if (!res.ok) throw new Error("Tagging failed");
      const result = await res.json();

      // 4. Show extracted tags for the user to correct before saving.
      setTags(normalizeTags(result));
      setPhase(PHASE.EDITING);
    } catch (e) {
      setError(e?.message || "Something went wrong. Please try again.");
      setPhase(PHASE.SELECT);
    }
  };

  const handleSave = async () => {
    setPhase(PHASE.SAVING);
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
      onSaved?.();
      handleClose(false);
    } catch (e) {
      setError(e?.message || "Could not save. Please try again.");
      setPhase(PHASE.EDITING);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a clothing item</DialogTitle>
          <DialogDescription>
            {phase === PHASE.EDITING
              ? "AI tagged your item. Correct anything that's off, then save."
              : "Upload a photo — we'll remove the background, and AI will tag it."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Photo upload / process step */}
        {(phase === PHASE.SELECT || phase === PHASE.PROCESSING_BG || phase === PHASE.UPLOADING) && (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/20">
            {phase === PHASE.PROCESSING_BG || phase === PHASE.UPLOADING ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {phase === PHASE.PROCESSING_BG ? "Removing background (this might take a moment)..." : "Uploading clean photo..."}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-primary px-6 py-4 text-primary-foreground shadow-sm hover:bg-primary/90">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  <span className="font-medium">Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => processFile(e.target.files?.[0])}
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-background px-6 py-4 shadow-sm transition-colors hover:bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => processFile(e.target.files?.[0])}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* AI tagging step */}
        {phase === PHASE.TAGGING && imageUrl && (
          <div className="space-y-4">
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              <img
                src={imageUrl}
                alt="item"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> AI is tagging your
              item…
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

        {/* Tag review / edit step */}
        {(phase === PHASE.EDITING || phase === PHASE.SAVING) &&
          imageUrl &&
          tags && (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              <div className="flex gap-4">
                <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={imageUrl}
                    alt="item"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Review the AI's tags below. Tap any field to fix it — don't
                  trust the first guess.
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
