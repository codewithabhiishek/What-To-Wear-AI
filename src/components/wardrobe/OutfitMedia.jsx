import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import PremiumMoodboard from "./PremiumMoodboard";
import { visualizeOutfit } from "@/lib/visualizeOutfit";
import { cn } from "@/lib/utils";

/**
 * Opt-in "on model" visualization for one outfit. The flat-lay thumbnails are
 * the default; generating a mannequin image is triggered explicitly (it costs
 * an image-generation credit), cached per combo+occasion, and the flat-lay
 * stays available as a toggle / fallback.
 */
export default function OutfitMedia({ items, occasion }) {
  const [mode, setMode] = useState("flat"); // "flat" | "model"
  const [modelImage, setModelImage] = useState(null);
  const [visualizing, setVisualizing] = useState(false);
  const [error, setError] = useState(null);

  const handleVisualize = async () => {
    setError(null);
    setMode("model");
    setVisualizing(true);
    try {
      const { imageUrl } = await visualizeOutfit(items, occasion);
      setModelImage(imageUrl);
    } catch (e) {
      setError(e?.message || "Could not generate this look.");
    } finally {
      setVisualizing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top control: toggle once generated, otherwise an explicit opt-in button */}
      {modelImage ? (
        <div className="flex items-center gap-1">
          <SegBtn
            active={mode === "flat"}
            onClick={() => setMode("flat")}
            icon={ImageIcon}
            label="Moodboard"
          />
          <SegBtn
            active={mode === "model"}
            onClick={() => setMode("model")}
            icon={Sparkles}
            label="On model"
          />
        </div>
      ) : (
        !visualizing &&
        !error && (
          <Button variant="outline" size="sm" onClick={handleVisualize}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Visualize on model
          </Button>
        )
      )}

      {/* Premium Moodboard (default + fallback) */}
      {mode === "flat" && <PremiumMoodboard items={items} />}

      {/* Generating */}
      {mode === "model" && visualizing && (
        <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-xl bg-muted/40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Styling your outfit…
          </span>
        </div>
      )}

      {/* Generation failed — keep flat-lay reachable */}
      {mode === "model" && !visualizing && error && (
        <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-xl bg-muted/40 p-6 text-center">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-sm text-muted-foreground">{error}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleVisualize}>
              Try again
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setMode("flat")}>
              View flat-lay
            </Button>
          </div>
        </div>
      )}

      {/* Generated model image */}
      {mode === "model" && !visualizing && !error && modelImage && (
        <div className="overflow-hidden rounded-xl bg-muted">
          <Image
            src={modelImage}
            alt="Outfit visualized on a model"
            className="aspect-[4/5] w-full"
          />
        </div>
      )}
    </div>
  );
}

function SegBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
