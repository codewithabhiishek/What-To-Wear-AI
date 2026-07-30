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
        onClick={() => setDetailOpen(true)}
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 cursor-pointer [&_img]:transition-all [&_img]:duration-300 [&_img]:ease-out hover:[&_img]:scale-[1.02]"
        )}
      >
        {/* Media Section (No switcher, max-height 210px) */}
        <div className="relative w-full border-b bg-muted/20 p-2.5 pb-1">
          {/* Top-Right Heart Overlay Button */}
          <button
            type="button"
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(outfit, explanation, occasion);
            }}
            className="absolute top-4 right-4 z-20 grid h-8 w-8 place-items-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-background"
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
          <OutfitMedia 
            items={items} 
            isFeatured={isFeatured} 
            showSwitcher={false}
            aspectClass="w-[168px] h-[210px] mx-auto"
          />
        </div>

        {/* Content Section (Tight padding, fixed heights) */}
        <div className="flex flex-1 flex-col p-3.5 sm:p-4 gap-2.5">
          
          {/* Score Header */}
          <div className="h-6 flex items-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              {score}% Match
            </span>
          </div>

          {/* Explanation (Exactly 2 Lines Max) */}
          <div className="h-9 flex items-center">
            <p className="text-xs sm:text-sm leading-snug text-foreground/80 line-clamp-2">
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
          <div className="mt-auto flex justify-end items-center h-8">
            <Button 
              size="sm"
              className="w-full sm:w-auto shadow-sm text-xs h-8 px-3" 
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
