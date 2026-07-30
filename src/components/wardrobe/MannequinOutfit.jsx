import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";

/**
 * Per-category placement on the mannequin container (percent-based).
 * Coordinates tuned to the new, more realistic mannequin SVG below.
 */
const MANNEQUIN_SLOTS = {
  outerwear: {
    top: "7%",
    left: "50%",
    width: "76%",
    height: "36%",
    zIndex: 4,
    transform: "translateX(-50%)",
  },
  top: {
    top: "11%",
    left: "50%",
    width: "62%",
    height: "31%",
    zIndex: 3,
    transform: "translateX(-50%)",
  },
  bottom: {
    top: "38%",
    left: "50%",
    width: "50%",
    height: "40%",
    zIndex: 3,
    transform: "translateX(-50%)",
  },
  shoes: {
    bottom: "3%",
    left: "50%",
    width: "40%",
    height: "12%",
    zIndex: 5,
    transform: "translateX(-50%)",
  },
  accessory: {
    top: "9%",
    right: "7%",
    width: "20%",
    height: "15%",
    zIndex: 6,
  },
};

const LAYER_ORDER = ["outerwear", "top", "bottom", "shoes", "accessory"];

/**
 * Redesigned mannequin silhouette — slender, fashion-forward.
 * Fill is nearly transparent so clothing items are the star.
 * Only a soft stroke defines the human shape.
 */
function MannequinSilhouette() {
  return (
    <svg
      viewBox="0 0 240 540"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Near-invisible fill — just a ghost hint of a body */}
        <linearGradient id="mq-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.06" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.03" />
        </linearGradient>
        {/* Soft shadow under the figure */}
        <radialGradient id="mq-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.12" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Floor shadow ellipse */}
      <ellipse cx="120" cy="526" rx="52" ry="8" fill="url(#mq-floor)" />

      {/* Head — small, refined */}
      <ellipse
        cx="120"
        cy="28"
        rx="17"
        ry="21"
        fill="url(#mq-fill)"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
        strokeOpacity="0.18"
      />

      {/* Neck */}
      <rect
        x="112"
        y="49"
        width="16"
        height="16"
        rx="3"
        fill="url(#mq-fill)"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
        strokeOpacity="0.14"
      />

      {/*
        Main torso — elegant hourglass:
        · Wide shoulders ~y65
        · Narrow waist    ~y195
        · Hip flare       ~y238
        · Splits into two slim legs to ~y510
      */}
      <path
        d="
          M 120 65
          C 88 65 58 70 44 82
          C 30 94 28 112 28 130
          L 28 190
          C 28 210 42 222 62 228
          L 68 238
          L 74 510
          L 100 510
          L 104 252
          L 136 252
          L 140 510
          L 166 510
          L 172 238
          L 178 228
          C 198 222 212 210 212 190
          L 212 130
          C 212 112 210 94 196 82
          C 182 70 152 65 120 65
          Z
        "
        fill="url(#mq-fill)"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
        strokeOpacity="0.15"
        strokeLinejoin="round"
      />

      {/* Left arm — slim rod from shoulder down to mid-hip height */}
      <path
        d="M 44 88 C 34 96 26 112 24 130 L 20 220 C 20 232 28 238 38 234 L 44 200 L 46 120 C 46 104 50 92 62 84 Z"
        fill="url(#mq-fill)"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
        strokeOpacity="0.12"
        strokeLinejoin="round"
      />

      {/* Right arm */}
      <path
        d="M 196 88 C 206 96 214 112 216 130 L 220 220 C 220 232 212 238 202 234 L 196 200 L 194 120 C 194 104 190 92 178 84 Z"
        fill="url(#mq-fill)"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
        strokeOpacity="0.12"
        strokeLinejoin="round"
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
        "relative w-full overflow-hidden rounded-2xl border",
        "bg-gradient-to-b from-muted/20 via-background to-muted/30",
        "shadow-inner",
        className,
      )}
      style={{ aspectRatio: "3/5" }}
    >
      {/* Mannequin silhouette — ghost-light, clothes are the focus */}
      <MannequinSilhouette />

      {/* Clothing layers, composited over the silhouette */}
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
              className="max-h-full max-w-full object-contain"
              style={{
                filter: "drop-shadow(0px 6px 20px rgba(0,0,0,0.20)) drop-shadow(0px 2px 6px rgba(0,0,0,0.12))",
              }}
              draggable={false}
            />
          </div>
        );
      })}

      {/* Category legend — subtle strip at bottom */}
      <div className="absolute bottom-3 inset-x-3 flex flex-wrap justify-center gap-1.5">
        {layers.map((category) => (
          <span
            key={category}
            className="rounded-full bg-background/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm"
          >
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </div>
    </div>
  );
}
