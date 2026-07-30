import { useState } from "react";
import { LayoutGrid, UserRound } from "lucide-react";
import PremiumMoodboard from "./PremiumMoodboard";
import MannequinOutfit from "./MannequinOutfit";
import { cn } from "@/lib/utils";

/**
 * Outfit preview with two views:
 * - Flat lay moodboard (default): editorial grid of the user's actual photos
 * - On mannequin: composites the exact uploaded items onto a mannequin silhouette
 */
export default function OutfitMedia({ items }) {
  const [mode, setMode] = useState("flat"); // "flat" | "mannequin"

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
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
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {items.length} piece{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {mode === "flat" ? (
        <PremiumMoodboard items={items} />
      ) : (
        <MannequinOutfit items={items} />
      )}
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
