import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Loader2, Heart } from "lucide-react";
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:overflow-hidden rounded-[2rem] p-5 sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Outfit Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-[230px_1fr] gap-5 items-start">
          
          {/* LEFT COLUMN: Scaled-down Outfit Preview (Reduced ~35%) */}
          <div className="w-full max-w-[230px] mx-auto overflow-hidden rounded-xl border bg-muted/20 shrink-0">
            <OutfitMedia items={items} isFeatured={false} />
          </div>

          {/* RIGHT COLUMN: Badges, Rationale, Pieces & Action Buttons */}
          <div className="flex flex-col justify-between space-y-4 h-full min-w-0">
            
            {/* Header Toolbar: Match score, Best match badge, Heart favorite */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {score}% Match
                </span>
                {isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
                    Best Match
                  </span>
                )}
              </div>

              {/* Heart Favorite Button */}
              <button
                type="button"
                onClick={() =>
                  toggleFavorite(
                    outfit,
                    explanation || outfit.explanation,
                    outfit.occasion || "casual"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm transition-all hover:scale-105 active:scale-95 hover:bg-muted"
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

            {/* Explanation Section */}
            <div className="space-y-1">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Why this works
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 font-medium">
                {explanation || outfit.explanation || "A balanced combination from your closet."}
              </p>
            </div>

            {/* Compact Pieces List */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pieces ({items.length})
              </h4>
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 rounded-lg border bg-card p-1.5 text-xs shadow-xs"
                  >
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-muted">
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
                      <p className="text-muted-foreground capitalize truncate text-[10px]">
                        {item.color_primary} · {item.fit} · {item.pattern}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-2 border-t flex items-center justify-end gap-2">
              <Button
                size="sm"
                className="w-full sm:w-auto shadow-sm text-xs h-9 px-4 font-semibold"
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
