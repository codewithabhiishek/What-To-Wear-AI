import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
      <DialogContent 
        className="max-w-3xl max-h-[80vh] overflow-y-auto sm:overflow-hidden rounded-[1.75rem] border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-4 sm:p-6 transition-all duration-200 ease-out [&>button:last-child]:hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Outfit Details</DialogTitle>
        </DialogHeader>

        {/* 1. HEADER: Left (Badges), Center (Title), Right (Favorite + 36x36 Close) */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4 gap-3">
          {/* Left: Badges */}
          <div className="flex items-center gap-2 shrink-0">
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

          {/* Center: Title */}
          <h2 className="hidden md:block font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground text-center truncate">
            Outfit Details
          </h2>

          {/* Right: Favorite & 36x36 Circular Close Icon Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                toggleFavorite(
                  outfit,
                  explanation || outfit.explanation,
                  outfit.occasion || "casual"
                )
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 hover:bg-muted hover:scale-105 active:scale-95"
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )}
              />
              <span>{isFav ? "Saved" : "Favorite"}</span>
            </button>

            {/* Premium 36x36 Circular Close Button */}
            <DialogClose className="group h-9 w-9 grid place-items-center rounded-full border border-border/60 bg-muted/50 dark:bg-muted/80 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </div>

        {/* 2. BODY: Rebalanced Two-Column Grid (40% Preview / 60% Details) */}
        <div className="grid grid-cols-1 sm:grid-cols-[40%_1fr] gap-6 items-center">
          
          {/* Left Column (40%): Premium Preview Panel */}
          <div className="w-full max-w-[270px] mx-auto overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-2 shrink-0 flex items-center justify-center">
            <div className="w-full h-full max-h-[290px] flex items-center justify-center">
              <OutfitMedia items={items} isFeatured={false} />
            </div>
          </div>

          {/* Right Column (60%): Style Vibe, Pieces List & Metadata */}
          <div className="flex flex-col justify-between space-y-4 h-full min-w-0">
            
            {/* Style Vibe Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Style Vibe
              </h3>
              <p className="text-sm sm:text-[15px] text-foreground/90 font-medium leading-relaxed line-clamp-3">
                {explanation || outfit.explanation || "Clean everyday outfit with balanced casual styling."}
              </p>
            </div>

            {/* Clothing Piece Cards */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pieces in this outfit ({items.length})
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-2.5 text-xs transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xs"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/40 p-0.5">
                      <img
                        src={item.image_url}
                        alt={item.color_primary}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate text-xs sm:text-sm">
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

            {/* 3. FOOTER: Perfectly Aligned Buttons */}
            <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3 mt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl px-5 text-xs font-medium border-border/80 transition-all hover:bg-muted"
                >
                  Close
                </Button>
              </DialogClose>
              <Button
                size="sm"
                className="h-10 rounded-xl px-5 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-98"
                onClick={() => {
                  onWoreThis();
                  onOpenChange(false);
                }}
                disabled={isLogging}
              >
                {isLogging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging…
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> I Wore This
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
