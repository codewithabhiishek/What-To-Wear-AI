import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
import OutfitMedia from "./OutfitMedia";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";
import { cn } from "@/lib/utils";

function getScoreLabel(score) {
  if (score >= 95) return "Perfect";
  if (score >= 88) return "Excellent";
  if (score >= 78) return "Very Good";
  if (score >= 65) return "Good";
  if (score >= 50) return "Weak";
  return "Poor";
}

export default function OutfitCard({
  outfit,
  explanation,
  isLogging,
  onWoreThis,
  isFeatured = false,
}) {
  const { score, items, breakdowns } = outfit;
  const label = getScoreLabel(score);

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
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">{label}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-sm font-medium text-muted-foreground">{score}% Match</span>
          </div>
        </div>

        {/* Item Chips */}
        <div className="mb-5 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground cursor-default"
            >
              <span
                className="h-2 w-2 rounded-full shadow-sm"
                style={{ backgroundColor: (item.color_primary || "").toLowerCase() }}
              />
              {CATEGORY_LABELS[item.category]} · <span className="capitalize">{item.color_primary}</span>
            </span>
          ))}
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

        {/* Visual Score Breakdown */}
        {breakdowns && breakdowns.length > 0 && (
          <div className="mb-8 space-y-4 rounded-2xl bg-muted/30 p-5 border border-border/40">
            {breakdowns.map((b) => (
              <div key={b.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground/80">{b.category}</span>
                  <span className="font-medium text-muted-foreground tabular-nums">
                    {b.points}/{b.max}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/80">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-1000 ease-out"
                    style={{ width: `${(Math.max(0, b.points) / b.max) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/70">{b.reason}</p>
              </div>
            ))}
          </div>
        )}

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
