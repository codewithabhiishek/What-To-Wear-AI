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
export default function OutfitMedia({ 
  items, 
  isFeatured, 
  showSwitcher = true,
  aspectClass = "aspect-[4/5]"
}) {
  const [mode, setMode] = useState("flat"); // "flat" | "mannequin"

  return (
    <div className="flex flex-col items-center gap-2.5 w-full">
      {/* Segmented Control View Switcher (Only in detail modal) */}
      {showSwitcher && (
        <div className="flex h-9 w-full max-w-[220px] items-center rounded-full bg-muted/60 p-1 border border-border/40 shadow-2xs">
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
            Mannequin
          </button>
        </div>
      )}

      {/* Hero Image Stage */}
      <div className={cn(
        "relative w-full flex items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-muted/10",
        aspectClass
      )}>
        {isFeatured && (
          <span className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm backdrop-blur-sm pointer-events-none">
            <Sparkles className="h-3 w-3" /> Best Match
          </span>
        )}
        {mode === "flat" ? (
          <PremiumMoodboard items={items} className="border-0 rounded-none w-full h-full" />
        ) : (
          <MannequinOutfit items={items} className="border-0 rounded-none w-full h-full" />
        )}
      </div>
    </div>
  );
}
