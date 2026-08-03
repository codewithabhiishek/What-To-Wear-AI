import { useState } from "react";
import { Shirt, Sparkles, Wand2 } from "lucide-react";
import MannequinOutfit from "./MannequinOutfit";
import AiStyledPreview from "./AiStyledPreview";
import { cn } from "@/lib/utils";

/**
 * Outfit preview with segmented control view switcher:
 * Styled Form is deterministic and remains the default. AI Styled Preview is
 * an opt-in beta enhancement that gracefully falls back to Styled Form.
 */
export default function OutfitMedia({ 
  items, 
  isFeatured, 
  showSwitcher = true,
  aspectClass = "aspect-[4/5]"
}) {
  const [mode, setMode] = useState("styled-form");

  return (
    <div className="flex flex-col items-center gap-2.5 w-full">
      {/* Segmented Control View Switcher (Only in detail modal) */}
      {showSwitcher && (
        <div className="flex h-9 w-full max-w-[290px] items-center rounded-full bg-muted/60 p-1 border border-border/40 shadow-2xs" role="group" aria-label="Outfit visualization mode">
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
            onClick={() => setMode("ai")}
            aria-pressed={mode === "ai"}
            title="Generated from your uploaded garments using AI. Minor visual differences may occur."
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-1.5 rounded-full text-xs transition-all duration-200 h-full",
              mode === "ai"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground font-medium"
            )}
          >
            <Wand2 className="h-3.5 w-3.5" />
            AI Preview <span className="rounded bg-foreground/10 px-1 text-[9px]">Beta</span>
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
        {mode === "styled-form" ? (
          <MannequinOutfit items={items} className="border-0 rounded-none w-full h-full" />
        ) : (
          <AiStyledPreview items={items} className="border-0 rounded-none" />
        )}
      </div>
    </div>
  );
}
