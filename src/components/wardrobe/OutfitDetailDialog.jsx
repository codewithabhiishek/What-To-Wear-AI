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
        className="w-full max-w-[800px] h-auto max-h-[90vh] overflow-y-auto rounded-[2rem] border border-border/40 bg-background/95 backdrop-blur-2xl shadow-2xl p-6 gap-0 transition-all duration-200 ease-out [&>button:last-child]:hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Outfit Details</DialogTitle>
        </DialogHeader>

        {/* 1. TOP HEADER BAR: Perfectly Vertically Centered Baseline */}
        <div className="flex h-12 items-center justify-between border-b border-border/40 pb-4 mb-6 gap-3">
          
          {/* LEFT: Match % & Best Match Badges */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
              {score}% Match
            </span>
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shrink-0">
                Best Match
              </span>
            )}
          </div>

          {/* CENTER: Outfit Details Title */}
          <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground text-center shrink-0 px-2">
            Outfit Details
          </h2>

          {/* RIGHT: Favorite Button & 36x36 Circular Close Button */}
          <div className="flex items-center gap-2.5 flex-1 justify-end shrink-0">
            <button
              type="button"
              onClick={() =>
                toggleFavorite(
                  outfit,
                  explanation || outfit.explanation,
                  outfit.occasion || "casual"
                )
              }
              className="h-9 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3.5 text-xs font-semibold text-foreground shadow-2xs transition-all duration-150 hover:bg-muted hover:scale-105 active:scale-95"
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )}
              />
              <span>{isFav ? "Saved" : "Favorite"}</span>
            </button>

            {/* 36x36 Circular Close Button */}
            <DialogClose className="group h-9 w-9 grid place-items-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </div>

        {/* 2. BODY GRID: 300px Left Column / Rest Right Column */}
        <div className="grid grid-cols-1 sm:grid-cols-[300px_1fr] gap-8 items-start w-full">
          
          {/* LEFT COLUMN: Outfit Media Preview stage */}
          <div className="w-full shrink-0">
            <OutfitMedia items={items} isFeatured={false} />
          </div>

          {/* RIGHT COLUMN: Style Vibe rationale, Pieces & Footer Buttons (Strict intrinsic layout flow) */}
          <div className="flex flex-col gap-6 w-full h-full justify-start">
            
            {/* Style Vibe Description */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Style Vibe
              </h3>
              <p className="text-sm sm:text-[15px] text-foreground/90 font-medium leading-relaxed">
                {explanation || outfit.explanation || "Relaxed denim and cotton combo for easy wear."}
              </p>
            </div>

            {/* Clothing Pieces List */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Pieces in this Outfit ({items.length})
              </h3>
              <div className="flex flex-col gap-2 w-full">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="h-14 flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/30 p-0.5 grid place-items-center">
                      <img
                        src={item.image_url}
                        alt={item.color_primary}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="font-bold text-foreground truncate text-xs sm:text-sm">
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

            {/* 3. FOOTER ACTIONS: Placed immediately under the pieces list */}
            <div className="pt-5 border-t border-border/40 flex items-center justify-end gap-3 w-full">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl px-5 text-xs font-medium border-border/60 transition-all hover:bg-muted active:scale-98"
                >
                  Close
                </Button>
              </DialogClose>
              <Button
                className="h-10 rounded-xl px-5 text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-1.5"
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
