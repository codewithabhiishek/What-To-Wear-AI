import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Loader2 } from "lucide-react";
import OutfitMedia from "./OutfitMedia";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";

export default function OutfitDetailDialog({
  open,
  onOpenChange,
  outfit,
  explanation,
  isLogging,
  onWoreThis,
  isFeatured = false,
}) {
  if (!outfit) return null;
  const { score, items } = outfit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-6 sm:p-8">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {score}% Match
            </span>
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                Best Match
              </span>
            )}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground pt-2">
            Outfit Details
          </DialogTitle>
        </DialogHeader>

        {/* Larger Outfit Preview */}
        <div className="mb-6 overflow-hidden rounded-2xl border bg-muted/20">
          <OutfitMedia items={items} isFeatured={false} />
        </div>

        {/* Full Explanation */}
        <div className="mb-6 space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Why this works
          </h4>
          <p className="text-base leading-relaxed text-foreground/90">
            {explanation || "A balanced combination from your closet."}
          </p>
        </div>

        {/* Garment Breakdown List */}
        <div className="mb-8 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pieces in this outfit ({items.length})
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border bg-card p-2.5 text-xs shadow-sm"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={item.image_url}
                    alt={item.color_primary}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
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

        {/* Footer Action */}
        <div className="flex justify-end pt-2 border-t">
          <Button
            size="lg"
            className="w-full sm:w-auto shadow-sm"
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
      </DialogContent>
    </Dialog>
  );
}
