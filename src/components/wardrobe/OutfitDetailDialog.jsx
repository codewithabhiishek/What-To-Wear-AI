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
}) {
  const { isFavorited, toggleFavorite } = useFavorites();
  if (!outfit) return null;
  const { score, items } = outfit;
  const isFav = isFavorited(outfit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-full max-w-[900px] max-h-[85vh] sm:h-[560px] overflow-hidden rounded-[2rem] border-0 bg-background/95 backdrop-blur-2xl shadow-2xl p-0 gap-0 transition-all duration-250 ease-out [&>button:last-child]:hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Outfit Details</DialogTitle>
        </DialogHeader>

        {/* 2-COLUMN FASHION E-COMMERCE STAGE (60% HERO STAGE / 40% DETAILS PANE) */}
        <div className="grid grid-cols-1 sm:grid-cols-[58%_1fr] h-full w-full overflow-y-auto sm:overflow-hidden">
          
          {/* LEFT STAGE (58%): Hero Stage — Large Centered Preview (Occupies 70% of modal height) */}
          <div className="relative w-full h-full min-h-[320px] sm:min-h-full bg-gradient-to-b from-muted/30 via-muted/10 to-background/40 flex items-center justify-center p-6 sm:p-8 shrink-0">
            {/* Match Badge Floating Badge on Hero Image */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-md border border-border/40 px-3 py-1 text-xs font-bold text-foreground shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {score}% Match
              </span>
            </div>

            {/* Centered Hero Outfit Preview */}
            <div className="w-full max-w-[340px] h-[82%] flex items-center justify-center">
              <OutfitMedia items={items} isFeatured={false} />
            </div>
          </div>

          {/* RIGHT PANE (42%): Clean Minimal Header, Rationale, Items & Actions */}
          <div className="flex flex-col justify-between p-6 sm:p-7 h-full w-full border-t sm:border-t-0 sm:border-l border-border/40 bg-background">
            
            {/* 1. HEADER ROW: Title + Favorite Toggle + 36x36 Close Button */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-border/40">
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
                Outfit Details
              </h2>

              <div className="flex items-center gap-2">
                {/* Favorite Toggle Button */}
                <button
                  type="button"
                  onClick={() =>
                    toggleFavorite(
                      outfit,
                      explanation || outfit.explanation,
                      outfit.occasion || "casual"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 hover:bg-muted hover:scale-105 active:scale-95"
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
                <DialogClose className="group h-9 w-9 grid place-items-center rounded-full border border-border/40 bg-muted/40 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </div>
            </div>

            {/* 2. STYLE VIBE RATIONALE (2-3 Lines Max) */}
            <div className="space-y-1 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Style Vibe
              </span>
              <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed line-clamp-3">
                {explanation || outfit.explanation || "Clean everyday outfit with balanced casual styling."}
              </p>
            </div>

            {/* 3. CLOTHING PIECES (Minimalist List Items) */}
            <div className="space-y-2 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Pieces ({items.length})
              </span>
              <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 p-2.5 text-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30"
                  >
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/30 p-0.5">
                      <img
                        src={item.image_url}
                        alt={item.color_primary}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate text-xs">
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

            {/* 4. FOOTER: Primary ("I Wore This") & Secondary ("Close") Buttons */}
            <div className="pt-4 border-t border-border/40 flex items-center justify-end gap-3">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl px-5 text-xs font-medium border-border/60 transition-all hover:bg-muted"
                >
                  Close
                </Button>
              </DialogClose>
              <Button
                className="h-11 rounded-xl px-5 text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-98"
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
