import { useState } from "react";
import { LayoutGrid, UserRound, Sparkles } from "lucide-react";
import PremiumMoodboard from "./PremiumMoodboard";
import MannequinOutfit from "./MannequinOutfit";
import { cn } from "@/lib/utils";

/**
 * Outfit preview with segmented control view switcher:
 * - Flat lay (default): editorial grid of real item photos
 * - On mannequin: slim fashion mannequin silhouette composition
 */
export default function OutfitMedia({ items, isFeatured }) {
  const [mode, setMode] = useState("flat"); // "flat" | "mannequin"

  return (
    <div className="flex flex-col items-center gap-3 w-full h-full">
      {/* Segmented Control View Switcher */}
      <div className="flex h-9 w-full max-w-[250px] items-center rounded-full bg-muted/60 p-1 border border-border/40 shadow-2xs">
        <button
          type="button"
          onClick={() => setMode("flat")}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 rounded-full text-xs transition-all duration-200 h-full",
            mode === "flat"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Flat lay
        </button>
        <button
          type="button"
          onClick={() => setMode("mannequin")}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 rounded-full text-xs transition-all duration-200 h-full",
            mode === "mannequin"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          <UserRound className="h-3.5 w-3.5" />
          On mannequin
        </button>
      </div>

      {/* Hero Image Stage (Centered, No Double Borders) */}
      <div className="relative w-full max-w-[320px] h-[340px] flex items-center justify-center overflow-hidden rounded-2xl">
        {isFeatured && (
          <span className="absolute top-2 left-2 z-20 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm backdrop-blur-sm pointer-events-none">
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
