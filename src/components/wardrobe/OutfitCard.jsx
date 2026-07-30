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
  const { score, items, breakdowns } = outfit;

  return (
    <article className="group w-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 cursor-pointer [&_img]:transition-all [&_img]:duration-300 [&_img]:ease-out hover:[&_img]:scale-[1.03] hover:[&_img]:brightness-105">
      <OutfitMedia items={items} />

      <div className="space-y-3 p-4 pt-3">
        {/* Item chips */}
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-muted-foreground/10 hover:text-foreground cursor-default"
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

        {/* Score Breakdown UI */}
        {breakdowns && breakdowns.length > 0 && (
          <div className="mt-4 rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Score Breakdown</p>
            {breakdowns.map((b) => (
              <div key={b.category} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium w-16">{b.category}</span>
                <span className="text-muted-foreground/70 text-[10px] truncate flex-1 px-2">{b.reason}</span>
                <span className="font-medium tabular-nums text-right w-12">
                  +{b.points} <span className="text-muted-foreground/50 text-[10px]">/ {b.max}</span>
                </span>
              </div>
            ))}
          </div>
        )}

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
