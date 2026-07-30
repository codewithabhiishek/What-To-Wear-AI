import { useState } from "react";
import {
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import OutfitThumbnails from "./OutfitThumbnails";
import OutfitRenderer from "./OutfitRenderer";
import { cn } from "@/lib/utils";

/**
 * Opt-in "on model" visualization for one outfit. The flat-lay thumbnails are
 * the default; generating a mannequin image is now INSTANT using the 2D
 * layered renderer instead of AI.
 */
export default function OutfitMedia({ items, occasion }) {
  const [mode, setMode] = useState("flat"); // "flat" | "model"

  return (
    <div className="space-y-3">
      {/* Top control: toggle */}
      <div className="flex items-center gap-1">
        <SegBtn
          active={mode === "flat"}
          onClick={() => setMode("flat")}
          icon={ImageIcon}
          label="Flat-lay"
        />
        <SegBtn
          active={mode === "model"}
          onClick={() => setMode("model")}
          icon={Sparkles}
          label="On model"
        />
      </div>

      {/* Flat-lay thumbnails (default + fallback) */}
      {mode === "flat" && <OutfitThumbnails items={items} />}

      {/* Generated model image (instant 2D layer) */}
      {mode === "model" && (
        <OutfitRenderer items={items} />
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
