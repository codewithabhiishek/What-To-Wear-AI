import { useState } from "react";
import { Trash2, Pencil, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
  CATEGORY_LABELS,
  PATTERN_LABELS,
  FIT_LABELS,
  SEASON_LABELS,
} from "@/lib/wardrobeConstants";
import { cn } from "@/lib/utils";

function FormalityDots({ value }) {
  const v = value || 3;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-1.5 rounded-full ${
            n <= v ? "bg-foreground" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

export default function ClosetItemCard({ item, onDelete, onEdit, onRetry }) {
  const [loaded, setLoaded] = useState(false);
  const isOptimistic = item.isOptimistic;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/20">
      
      {/* Fixed aspect ratio container (3/4) to prevent any layout shift */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/30 border-b">
        {/* Placeholder skeleton while image loads */}
        {!loaded && (
          <div className="absolute inset-0 bg-muted/60 animate-pulse" />
        )}

        <img
          src={item.image_url || item.previewUrl}
          alt={item.color_primary || "clothing item"}
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-contain p-2 transition-all duration-300 ease-out",
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
            isOptimistic && "blur-[1px] brightness-95"
          )}
          draggable={false}
        />

        {/* Optimistic Status Badge Overlay */}
        {isOptimistic && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-background/60 backdrop-blur-[2px] text-center gap-2">
            {item.error ? (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <p className="text-[11px] font-semibold text-destructive px-1 leading-tight">
                  {item.error}
                </p>
                <button
                  type="button"
                  onClick={() => onRetry?.(item)}
                  className="inline-flex items-center gap-1 rounded-full bg-destructive text-destructive-foreground px-2.5 py-1 text-[10px] font-semibold shadow-sm hover:opacity-90 transition-opacity mt-1"
                >
                  <RefreshCw className="h-3 w-3" /> Retry
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
                  {item.statusMessage || "Uploading…"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons (Disabled during upload) */}
        {!isOptimistic && (
          <div className="absolute right-2 top-2 flex gap-1 z-10">
            <button
              onClick={() => onEdit?.(item)}
              aria-label="Edit item"
              className="grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-all hover:bg-foreground hover:text-background opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete?.(item)}
              aria-label="Delete item"
              className="grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-all hover:bg-destructive hover:text-destructive-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Card Content Area — Fixed height spacing */}
      <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              {CATEGORY_LABELS[item.category] || item.category || "Item"}
            </span>
            <FormalityDots value={item.formality} />
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full border border-border shrink-0 shadow-sm"
              style={{ backgroundColor: swatch(item.color_primary) }}
            />
            <span className="text-xs font-medium capitalize text-foreground truncate">
              {item.color_primary || "Processing..."}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 pt-1 min-h-[1.5rem]">
          {item.fit && <Tag text={FIT_LABELS[item.fit] || item.fit} />}
          {item.pattern && <Tag text={PATTERN_LABELS[item.pattern] || item.pattern} />}
          {item.season && <Tag text={SEASON_LABELS[item.season] || item.season} />}
        </div>
      </div>
    </div>
  );
}

function Tag({ text }) {
  return (
    <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground cursor-default">
      {text}
    </span>
  );
}

function swatch(name) {
  if (!name || name === "processing") return "transparent";
  return name.toLowerCase();
}
