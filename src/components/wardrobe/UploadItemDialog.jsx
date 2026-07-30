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

  const handleFile = async (file) => {
    if (!file || !user) return;
    setError(null);
    try {
      // 1. Upload the photo to Vercel Blob via our serverless function
      setPhase(PHASE.UPLOADING);
      const filename = `${Date.now()}_${file.name}`;
      
      const uploadRes = await fetch(`/api/upload-photo?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: file, // Send file directly as binary payload
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload photo");
      }
      
      const uploadData = await uploadRes.json();
      const file_url = uploadData.url;
      setImageUrl(file_url);

      // 2. Send to Vercel API for structured tagging.
      setPhase(PHASE.TAGGING);
      const res = await fetch("/api/tag-clothing-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: file_url })
      });
      if (!res.ok) throw new Error("Tagging failed");
      const result = await res.json();

      // 3. Show extracted tags for the user to correct before saving.
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
              : "Upload a photo — AI will tag it, and you confirm before it's saved."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Photo upload step */}
        {(phase === PHASE.SELECT || phase === PHASE.UPLOADING) && (
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/40 transition-colors hover:bg-muted">
            {phase === PHASE.UPLOADING ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-background text-muted-foreground">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Tap to upload a photo
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
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
