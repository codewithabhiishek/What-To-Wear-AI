import { useState } from "react";
import { LayoutGrid, Shirt } from "lucide-react";
import MannequinOutfit from "./MannequinOutfit";
import PremiumMoodboard from "./PremiumMoodboard";
import { cn } from "@/lib/utils";

/**
 * Outfit preview with segmented control view switcher:
 * Styled Form is deterministic and remains the default visualization.
 */
export default function OutfitMedia({ 
  items, 
  showSwitcher = true,
  aspectClass = "w-full max-w-[320px] aspect-[9/14]"
}) {
  const [mode, setMode] = useState("styled-form");

  return (
    <div className="flex flex-col items-center gap-2.5 w-full">
      {/* Segmented Control View Switcher (Only in detail modal) */}
      {showSwitcher && (
        <div className="flex h-9 w-full max-w-[220px] items-center rounded-full bg-muted/60 p-1 border border-border/40 shadow-2xs" role="group" aria-label="Outfit visualization mode">
          <button
            type="button"
            onClick={() => setMode("styled-form")}
            aria-pressed={mode === "styled-form"}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1.5 rounded-full text-xs transition-all duration-200 h-full",
              mode === "styled-form"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground font-medium"
            )}
          >
            <Shirt className="h-3.5 w-3.5" />
            Styled Form
          </button>
          <button
            type="button"
            onClick={() => setMode("flat")}
            aria-pressed={mode === "flat"}
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
        </div>
      )}

      {/* Hero Image Stage */}
      <div className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-[1.25rem] border border-border/40 bg-muted/10 shadow-[0_16px_36px_-28px_rgba(0,0,0,.6)]",
        aspectClass
      )}>
        {/* No overlays allowed inside the preview stage */}
        {mode === "styled-form" ? (
          <MannequinOutfit items={items} className="border-0 rounded-none w-full h-full" />
        ) : (
          <PremiumMoodboard items={items} className="border-0 rounded-none w-full h-full" />
        )}
      </div>
    </div>
  );
}
