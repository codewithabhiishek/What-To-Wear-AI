import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Loader2, Heart, X } from "lucide-react";
import OutfitMedia from "./OutfitMedia";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";
import { useFavorites } from "@/lib/FavoritesContext";
import { cn } from "@/lib/utils";

export default function OutfitDetailDialog({
  open,
  onOpenChange,
  outfit,
  explanation,
  isLogging,
  onWoreThis,
  isFeatured = false,
}) {
  const { isFavorited, toggleFavorite } = useFavorites();
  if (!outfit) return null;
  const { score, items } = outfit;
  const isFav = isFavorited(outfit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto sm:overflow-hidden rounded-[1.75rem] border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-5 sm:p-6 transition-all duration-200 ease-out">
        <DialogHeader className="sr-only">
          <DialogTitle>Outfit Details</DialogTitle>
        </DialogHeader>

        {/* TOP BAR: Match percentage badge, Best match badge & Favorite toggle */}
        <div className="flex items-center justify-between border-b pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {score}% Match
            </span>
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                Best Match
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              toggleFavorite(
                outfit,
                explanation || outfit.explanation,
                outfit.occasion || "casual"
              )
            }
            className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 hover:scale-105 active:scale-95 hover:bg-muted"
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
            <span>{isFav ? "Saved" : "Favorite"}</span>
          </button>
        </div>

        {/* MIDDLE: 40% / 60% Rebalanced Two-Column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-[40%_1fr] gap-6 items-center">
          
          {/* LEFT COLUMN (40%): Scaled-down Outfit Preview */}
          <div className="w-full max-w-[270px] mx-auto overflow-hidden rounded-2xl border bg-muted/20 p-1 shrink-0 flex items-center justify-center">
            <OutfitMedia items={items} isFeatured={false} />
          </div>

          {/* RIGHT COLUMN (60%): Short AI Explanation & Compact Item Chips */}
          <div className="flex flex-col justify-between space-y-4 h-full min-w-0">
            
            {/* Short AI Explanation (Max 2-3 lines) */}
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Style Vibe
              </h4>
              <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed line-clamp-3">
                {explanation || outfit.explanation || "Clean everyday outfit with balanced casual styling."}
              </p>
            </div>

            {/* Clothing Pieces as Compact Chips */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Pieces ({items.length})
              </h4>
              <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border bg-card/70 p-2 text-xs hover:border-primary/20 transition-colors"
                  >
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted border p-0.5">
                      <img
                        src={item.image_url}
                        alt={item.color_primary}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate text-xs">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </p>
                      <p className="text-muted-foreground capitalize truncate text-[11px]">
                        {item.color_primary} · {item.fit} · {item.pattern}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM ACTIONS BAR: Secondary "Close" + Primary "I Wore This" */}
            <div className="pt-3 border-t flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-xs font-medium"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                size="sm"
                className="h-9 px-4 text-xs font-semibold shadow-sm"
                onClick={() => {
                  onWoreThis();
                  onOpenChange(false);
                }}
                disabled={isLogging}
              >
                {isLogging ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Logging…
                  </>
                ) : (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" /> I Wore This
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
