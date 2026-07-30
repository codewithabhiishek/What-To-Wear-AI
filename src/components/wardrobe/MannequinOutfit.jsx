import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";

/** Per-category placement on the mannequin (percent-based box model). */
const MANNEQUIN_SLOTS = {
  outerwear: {
    top: "6%",
    left: "50%",
    width: "78%",
    height: "34%",
    zIndex: 4,
    transform: "translateX(-50%)",
  },
  top: {
    top: "10%",
    left: "50%",
    width: "68%",
    height: "30%",
    zIndex: 3,
    transform: "translateX(-50%)",
  },
  bottom: {
    top: "36%",
    left: "50%",
    width: "52%",
    height: "38%",
    zIndex: 3,
    transform: "translateX(-50%)",
  },
  shoes: {
    bottom: "4%",
    left: "50%",
    width: "42%",
    height: "11%",
    zIndex: 5,
    transform: "translateX(-50%)",
  },
  accessory: {
    top: "8%",
    right: "8%",
    width: "22%",
    height: "16%",
    zIndex: 6,
  },
};

const LAYER_ORDER = ["outerwear", "top", "bottom", "shoes", "accessory"];

function MannequinSilhouette() {
  return (
    <svg
      viewBox="0 0 240 480"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="mannequin-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.55" />
          <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {/* Headless retail mannequin — subtle guide behind the user's clothes */}
      <ellipse cx="120" cy="36" rx="22" ry="10" fill="url(#mannequin-fill)" />
      <path
        d="M120 46 C95 46 78 58 72 78 L58 118 C52 132 48 148 48 168 L48 210 C48 218 54 224 62 224 L78 224 L82 380 C82 396 94 408 110 408 L130 408 C146 408 158 396 158 380 L162 224 L178 224 C186 224 192 218 192 210 L192 168 C192 148 188 132 182 118 L168 78 C162 58 145 46 120 46 Z"
        fill="url(#mannequin-fill)"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      <ellipse cx="92" cy="108" rx="14" ry="22" fill="url(#mannequin-fill)" />
      <ellipse cx="148" cy="108" rx="14" ry="22" fill="url(#mannequin-fill)" />
      <path
        d="M108 408 L108 448 C108 456 114 462 122 462 L118 462 C110 462 104 456 104 448 L104 408 M136 408 L136 448 C136 456 130 462 122 462 L126 462 C134 462 140 456 140 448 L140 408"
        fill="url(#mannequin-fill)"
        stroke="hsl(var(--border))"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

export default function MannequinOutfit({ items, className }) {
  const byCategory = Object.fromEntries(items.map((item) => [item.category, item]));
  const layers = LAYER_ORDER.filter((cat) => byCategory[cat]);

  return (
    <div
      className={cn(
        "relative aspect-[3/5] w-full overflow-hidden rounded-2xl border bg-gradient-to-b from-muted/30 via-background to-muted/40 shadow-inner",
        className,
      )}
    >
      {/* Studio floor shadow */}
      <div className="pointer-events-none absolute inset-x-[15%] bottom-[3%] h-[6%] rounded-[50%] bg-foreground/8 blur-md" />

      <MannequinSilhouette />

      {layers.map((category) => {
        const item = byCategory[category];
        const slot = MANNEQUIN_SLOTS[category];
        return (
          <div
            key={item.id}
            className="absolute flex items-center justify-center"
            style={{
              top: slot.top,
              left: slot.left,
              right: slot.right,
              bottom: slot.bottom,
              width: slot.width,
              height: slot.height,
              zIndex: slot.zIndex,
              transform: slot.transform,
            }}
          >
            <img
              src={item.image_url}
              alt={CATEGORY_LABELS[category] || category}
              className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
              draggable={false}
            />
          </div>
        );
      })}

      {/* Category legend */}
      <div className="absolute bottom-3 inset-x-3 flex flex-wrap justify-center gap-1.5">
        {layers.map((category) => (
          <span
            key={category}
            className="rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm"
          >
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </div>
    </div>
  );
}
