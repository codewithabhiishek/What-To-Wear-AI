import { Image } from "@/components/ui/image";
import { Trash2, Pencil } from "lucide-react";
import {
  CATEGORY_LABELS,
  PATTERN_LABELS,
  FIT_LABELS,
  SEASON_LABELS,
} from "@/lib/wardrobeConstants";

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

export default function ClosetItemCard({ item, onDelete, onEdit }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="aspect-[3/4] w-full bg-muted">
        <Image
          src={item.image_url}
          alt={item.color_primary || "clothing item"}
          className="h-full w-full"
        />
      </div>
      <div className="absolute right-2 top-2 flex gap-1">
        <button
          onClick={() => onEdit?.(item)}
          aria-label="Edit item"
          className="grid h-8 w-8 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-foreground hover:text-background opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(item)}
          aria-label="Delete item"
          className="grid h-8 w-8 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-destructive hover:text-destructive-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABELS[item.category] || item.category}
          </span>
          <FormalityDots value={item.formality} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full border border-border"
            style={{ backgroundColor: swatch(item.color_primary) }}
          />
          <span className="text-sm capitalize text-foreground">
            {item.color_primary}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <Tag text={FIT_LABELS[item.fit] || item.fit} />
          <Tag text={PATTERN_LABELS[item.pattern] || item.pattern} />
          {item.season && (
            <Tag text={SEASON_LABELS[item.season] || item.season} />
          )}
        </div>
      </div>
    </div>
  );
}

function Tag({ text }) {
  return (
    <span className="pill rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
      {text}
    </span>
  );
}

// Best-effort color swatch; falls back to a neutral when the color name is unknown.
function swatch(name) {
  if (!name) return "transparent";
  return name.toLowerCase();
}
