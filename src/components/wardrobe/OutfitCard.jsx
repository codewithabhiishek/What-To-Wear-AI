import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
import OutfitMedia from "./OutfitMedia";
import { cn } from "@/lib/utils";

export default function OutfitCard({
  outfit,
  explanation,
  isLogging,
  onWoreThis,
  isFeatured = false,
}) {
  const { score, items } = outfit;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[2rem] border bg-card shadow-lg transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-primary/30 cursor-pointer [&_img]:transition-all [&_img]:duration-500 [&_img]:ease-out hover:[&_img]:scale-[1.04] hover:[&_img]:brightness-105"
      )}
    >
      {/* Media Section */}
      <div className="relative w-full border-b bg-muted/20">
        <OutfitMedia items={items} isFeatured={isFeatured} />
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        
        {/* Score Header - Fixed Height */}
        <div className="mb-2 h-6 flex items-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            {score}% Match
          </span>
        </div>

        {/* Explanation - Fixed Height (Exactly 2 Lines) */}
        <div className="mb-4 h-10 flex items-center">
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

        {/* Action Button - Pinned Baseline */}
        <div className="mt-auto flex justify-end items-center h-8">
          <Button 
            size="sm"
            className="w-full sm:w-auto shadow-sm text-xs h-8 px-3" 
            onClick={onWoreThis} 
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
  );
}
