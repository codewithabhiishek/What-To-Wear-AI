import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import OutfitMedia from "./OutfitMedia";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";

export default function OutfitCard({
  outfit,
  explanation,
  isLogging,
  onWoreThis,
}) {
  const { score, items } = outfit;

  return (
    <article className="w-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <OutfitMedia items={items} />

      <div className="space-y-3 p-4 pt-3">
        {/* Item chips */}
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              <span
                className="h-2 w-2 rounded-full border border-border/50"
                style={{ backgroundColor: (item.color_primary || "").toLowerCase() }}
              />
              {CATEGORY_LABELS[item.category]} · {item.color_primary}
            </span>
          ))}
        </div>

        {/* Explanation + score */}
        <div className="flex items-start gap-3">
          <p className="flex-1 text-sm leading-relaxed text-foreground">
            {explanation ? (
              explanation
            ) : (
              <span className="text-muted-foreground italic">
                A balanced combo from your closet.
              </span>
            )}
          </p>
          <div
            className="flex shrink-0 flex-col items-center rounded-2xl bg-foreground/5 px-3.5 py-2.5 ring-1 ring-border/60"
            title="Outfit match score"
          >
            <span className="text-2xl font-bold tabular-nums leading-none tracking-tight">{score}</span>
            <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              match
            </span>
          </div>
        </div>

        <div className="flex justify-end border-t border-border/50 pt-3">
          <Button size="sm" className="cta" onClick={onWoreThis} disabled={isLogging}>
            {isLogging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging…
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> I wore this
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
