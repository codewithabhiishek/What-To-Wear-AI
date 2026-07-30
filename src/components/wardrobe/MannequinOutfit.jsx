import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";

/**
 * Modern High-Fashion Mannequin View (Zara / Uniqlo / COS Inspired)
 * ─────────────────────────────────────────────────────────────
 * Headless, slim proportions, tapered silhouette, matte neutral finish.
 * Automatically masks covered body parts so torso/legs don't protrude awkwardly.
 */

const SLOTS = {
  outerwear: { top: "8%",  height: "54%", width: "92%", zIndex: 5 },
  top:       { top: "10%", height: "46%", width: "82%", zIndex: 3 },
  bottom:    { top: "38%", height: "55%", width: "66%", zIndex: 2 },
  shoes:     { top: "87%", height: "11%", width: "48%", zIndex: 4 },
  accessory: { top: "6%",  right: "5%", height: "14%", width: "18%", zIndex: 6 },
};

const LAYER_ORDER = ["bottom", "top", "outerwear", "shoes", "accessory"];

function MannequinBody({ hasTop, hasBottom }) {
  return (
    <svg
      viewBox="0 0 240 520"
      className="absolute inset-0 h-full w-full opacity-80 transition-opacity duration-300"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="mq-neutral" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d6d6d6" />
          <stop offset="30%" stopColor="#f0f0f0" />
          <stop offset="70%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#cccccc" />
        </linearGradient>

        <linearGradient id="mq-neck" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#c8c8c8" />
        </linearGradient>

        <radialGradient id="mq-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Floor Contact Shadow */}
      <ellipse cx="120" cy="505" rx="55" ry="6.5" fill="url(#mq-shadow)" />

      {/* Neck Stem */}
      <path
        d="M 112 18 C 112 32 128 32 128 18 L 128 36 L 112 36 Z"
        fill="url(#mq-neck)"
      />

      {/* Shoulders & Torso (Hidden if covered by top/outerwear) */}
      <path
        d="
          M 120 36
          C 100 36 78 44 64 56
          C 56 63 52 74 54 86
          C 56 100 62 125 64 150
          C 66 175 74 210 76 240
          C 78 260 84 275 90 280
          L 150 280
          C 156 275 162 260 164 240
          C 166 210 174 175 176 150
          C 178 125 184 100 186 86
          C 188 74 184 63 176 56
          C 162 44 140 36 120 36
          Z
        "
        fill="url(#mq-neutral)"
        className={cn("transition-opacity duration-300", hasTop ? "opacity-20" : "opacity-90")}
      />

      {/* Natural Tapered Arms */}
      <path
        d="
          M 54 86
          C 40 120 30 180 34 260
          C 35 268 45 268 46 260
          C 42 185 52 130 64 96
          Z
        "
        fill="url(#mq-neutral)"
        className="opacity-75"
      />
      <path
        d="
          M 186 86
          C 200 120 210 180 206 260
          C 205 268 195 268 194 260
          C 198 185 188 130 176 96
          Z
        "
        fill="url(#mq-neutral)"
        className="opacity-75"
      />

      {/* Legs & Lower Body (Hidden if covered by pants) */}
      <path
        d="
          M 90 280
          L 84 498
          L 112 498
          L 118 280
          Z
          M 122 280
          L 128 498
          L 156 498
          L 150 280
          Z
        "
        fill="url(#mq-neutral)"
        className={cn("transition-opacity duration-300", hasBottom ? "opacity-15" : "opacity-85")}
      />
    </svg>
  );
}

export default function MannequinOutfit({ items, className }) {
  const byCategory = Object.fromEntries(items.map((i) => [i.category, i]));
  const hasTop = !!(byCategory.top || byCategory.outerwear);
  const hasBottom = !!byCategory.bottom;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[1.5rem] border border-border/60",
        "bg-[#fdfdfd] dark:bg-[#121212]",
        className,
      )}
      style={{ aspectRatio: "4/5" }}
    >
      {/* High-fashion Mannequin Silhouette */}
      <MannequinBody hasTop={hasTop} hasBottom={hasBottom} />

      {/* Layered Garments */}
      {LAYER_ORDER.map((category) => {
        const item = byCategory[category];
        if (!item) return null;
        const slot = SLOTS[category];
        const isRight = !!slot.right;
        return (
          <div
            key={item.id}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              top:       slot.top,
              height:    slot.height,
              width:     slot.width,
              zIndex:    slot.zIndex,
              left:      isRight ? "auto" : "50%",
              right:     isRight ? slot.right : "auto",
              transform: isRight ? "none" : "translateX(-50%)",
            }}
          >
            <img
              src={item.image_url}
              alt={CATEGORY_LABELS[category] || category}
              className="h-full w-full object-contain pointer-events-auto transition-all duration-200 ease-out hover:scale-105 hover:brightness-105"
              style={{
                filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.12)) drop-shadow(0px 2px 4px rgba(0,0,0,0.08))",
              }}
              draggable={false}
            />
          </div>
        );
      })}

      {/* Category Labels Footer */}
      <div className="absolute bottom-2.5 inset-x-2.5 flex flex-wrap justify-center gap-1">
        {LAYER_ORDER.filter((c) => byCategory[c]).map((category) => (
          <span
            key={category}
            className="rounded-full bg-background/85 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground shadow-xs backdrop-blur-md border border-border/40"
          >
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </div>
    </div>
  );
}
