import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, Heart } from "lucide-react";
import OutfitMedia from "./OutfitMedia";
import OutfitDetailDialog from "./OutfitDetailDialog";
import { useFavorites } from "@/lib/FavoritesContext";
import { cn } from "@/lib/utils";

export default function OutfitCard({
  outfit,
  explanation,
  occasion = "casual",
  isLogging,
  onWoreThis,
  isFeatured = false,
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { isFavorited, toggleFavorite } = useFavorites();
  const { score, items } = outfit;
  const isFav = isFavorited(outfit);

  return (
    <>
      <article
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border/70 bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"
        )}
      >
        <div className="relative border-b border-border/60 bg-muted/20 p-3 sm:p-4">
          {/* Top-Right Heart Overlay Button */}
          <button
            type="button"
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(outfit, explanation, occasion);
            }}
            className="absolute right-5 top-5 z-20 grid h-9 w-9 place-items-center rounded-full border border-border/50 bg-background/90 text-foreground shadow-sm backdrop-blur-md transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-all duration-200",
                isFav
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-foreground/70 hover:text-foreground"
              )}
            />
          </button>
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="block w-full rounded-[1.05rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="View outfit details"
          >
            <OutfitMedia
              items={items}
              isFeatured={isFeatured}
              showSwitcher={false}
              aspectClass="w-[min(86vw,252px)] aspect-[9/14] mx-auto"
            />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          
          {/* Score Header */}
          <div className="flex h-6 items-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              {score}% Match
            </span>
          </div>

          {/* Explanation (Exactly 2 Lines Max) */}
          <div className="min-h-10">
            <p className="line-clamp-2 text-sm leading-5 text-foreground/78">
              {explanation ? (
                explanation
              ) : (
                <span className="text-muted-foreground italic">
                  A balanced combo from your closet.
                </span>
              )}
            </p>
          </div>

          {/* Action Button (Pinned to Bottom) */}
          <div className="mt-auto flex items-center justify-end pt-1">
            <Button
              size="sm"
              className="h-9 w-full px-3 text-xs shadow-sm sm:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                onWoreThis();
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
      </article>

      <OutfitDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        outfit={outfit}
        explanation={explanation}
        isLogging={isLogging}
        onWoreThis={onWoreThis}
        isFeatured={isFeatured}
      />
    </>
  );
}
