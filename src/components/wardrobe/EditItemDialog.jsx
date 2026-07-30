import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { db } from "@/api/firebaseClient";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import TagEditor from "./TagEditor";

/**
 * Edit the tags of an already-saved clothing item — for when the AI's first
 * guess was wrong. The photo itself isn't changed, only the attributes.
 */
export default function EditItemDialog({ item, open, onOpenChange, onSaved }) {
  const { user } = useAuth();
  const [tags, setTags] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setTags({
        category: item.category,
        color_primary: item.color_primary,
        color_secondary: item.color_secondary || null,
        pattern: item.pattern,
        fit: item.fit,
        formality: item.formality,
        material: item.material || null,
        season: item.season,
      });
    }
  }, [item]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const itemRef = doc(db, "users", user.id, "clothingItems", item.id);
      await updateDoc(itemRef, {
        category: tags.category,
        color_primary: tags.color_primary,
        color_secondary: tags.color_secondary || null,
        pattern: tags.pattern,
        fit: tags.fit,
        formality: Number(tags.formality),
        material: tags.material || null,
        season: tags.season,
      });
      onSaved?.();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
          <DialogDescription>
            Correct any tags that were wrong when the item was added.
          </DialogDescription>
        </DialogHeader>

        {item && tags && (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              <img
                src={item.image_url}
                alt="item"
                className="h-full w-full object-cover"
              />
            </div>
            <TagEditor tags={tags} onChange={setTags} />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !tags}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
