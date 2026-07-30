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
        "group flex flex-col overflow-hidden rounded-[2rem] border bg-card shadow-lg transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-primary/30 cursor-pointer [&_img]:transition-all [&_img]:duration-500 [&_img]:ease-out hover:[&_img]:scale-[1.04] hover:[&_img]:brightness-105",
        isFeatured && "ring-1 ring-primary/20 border-primary/40 sm:flex-row"
      )}
    >
      {/* Media Section */}
      <div className={cn("relative", isFeatured ? "sm:w-1/2 sm:border-r" : "w-full border-b")}>
        {isFeatured && (
          <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> Best Match
          </div>
        )}
        <OutfitMedia items={items} />
      </div>

      {/* Content Section */}
      <div className={cn("flex flex-1 flex-col p-6 sm:p-8", isFeatured ? "justify-center" : "")}>
        
        {/* Score Header */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {score}% Match
          </span>
        </div>

        {/* Explanation */}
        <p className="mb-8 text-base leading-relaxed text-foreground/90">
          {explanation ? (
            explanation
          ) : (
            <span className="text-muted-foreground italic">
              A balanced combo from your closet.
            </span>
          )}
        </p>

        {/* Action Button */}
        <div className="mt-auto flex justify-end">
          <Button 
            size={isFeatured ? "lg" : "default"} 
            className="w-full sm:w-auto shadow-sm" 
            onClick={onWoreThis} 
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
    </article>
  );
}
