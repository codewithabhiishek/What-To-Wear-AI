import { useState } from "react";
import { LayoutGrid, UserRound, Sparkles } from "lucide-react";
import PremiumMoodboard from "./PremiumMoodboard";
import MannequinOutfit from "./MannequinOutfit";
import { cn } from "@/lib/utils";

/**
 * Outfit preview with two views:
 * - Flat lay moodboard (default): editorial grid of the user's actual photos
 * - On mannequin: composites the exact uploaded items onto a mannequin silhouette
 */
export default function OutfitMedia({ items, isFeatured }) {
  const [mode, setMode] = useState("flat"); // "flat" | "mannequin"

  return (
    <div className="space-y-2.5 p-3">
      {/* Header bar - 100% identical height and layout across all cards */}
      <div className="flex h-7 items-center justify-start gap-2 px-1">
        <div className="inline-flex rounded-full border bg-muted/40 p-0.5">
          <ViewTab
            active={mode === "flat"}
            onClick={() => setMode("flat")}
            icon={LayoutGrid}
            label="Flat lay"
          />
          <ViewTab
            active={mode === "mannequin"}
            onClick={() => setMode("mannequin")}
            icon={UserRound}
            label="On mannequin"
          />
        </div>
      </div>

      {/* Image container with absolute corner overlay badge */}
      <div className="relative overflow-hidden rounded-xl">
        {isFeatured && (
          <span className="absolute top-2 left-2 z-20 inline-flex items-center gap-1 rounded-full bg-primary/95 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm backdrop-blur-sm pointer-events-none">
            <Sparkles className="h-3 w-3" /> Best Match
          </span>
        )}
        {mode === "flat" ? (
          <PremiumMoodboard items={items} />
        ) : (
          <MannequinOutfit items={items} />
        )}
      </div>
    </div>
  );
}

function ViewTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
