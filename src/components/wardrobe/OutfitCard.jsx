import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import OutfitMedia from "./OutfitMedia";

export default function OutfitCard({
  outfit,
  explanation,
  occasion,
  isLogging,
  onWoreThis,
}) {
  const { score, items } = outfit;
  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border bg-card p-4 shadow-sm">
      <OutfitMedia items={items} occasion={occasion} />

      <div className="mt-3 flex items-start justify-between gap-3">
        <p className="flex-1 text-sm text-foreground">{explanation || "…"}</p>
        <div className="flex shrink-0 flex-col items-center">
          <span className="text-2xl font-semibold tabular-nums">{score}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            score
          </span>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={onWoreThis} disabled={isLogging}>
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
  );
}
