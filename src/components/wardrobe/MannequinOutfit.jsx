import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";

/**
 * Premium Mannequin View
 * ──────────────────────
 * Solid warm-gray mannequin (not wireframe) with smooth gradients and shading.
 * Garments are layered in correct dressing order:
 *   Mannequin → Pants → Shirt (overlaps pants waist) → Outerwear → Shoes
 *
 * The shirt top % intentionally reaches INTO the pants top % to simulate
 * the shirt naturally overlapping the waistband.
 */

// Garment slots as % of container. Shirt (top) extends PAST pants' top edge
// so the shirt overlaps the waistband — exactly like real clothing.
const SLOTS = {
  outerwear: { top: "4%",  height: "53%", width: "84%", zIndex: 5 },
  top:       { top: "8%",  height: "46%", width: "70%", zIndex: 3 },
  bottom:    { top: "42%", height: "55%", width: "54%", zIndex: 2 },
  shoes:     { top: "89%", height: "9%",  width: "48%", zIndex: 4 },
  accessory: { top: "6%",  right: "4%",  height: "13%", width: "16%", zIndex: 6 },
};

const LAYER_ORDER = ["bottom", "top", "outerwear", "shoes", "accessory"];

/** Premium solid mannequin — warm gray, smooth gradients, no wireframe */
function MannequinBody() {
  return (
    <svg
      viewBox="0 0 240 520"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Main body fill: side-to-side gradient creates roundness */}
        <linearGradient id="mq-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#A8A49F" />
          <stop offset="30%"  stopColor="#CCC8C3" />
          <stop offset="50%"  stopColor="#D6D2CD" />
          <stop offset="70%"  stopColor="#C8C4BF" />
          <stop offset="100%" stopColor="#A4A09B" />
        </linearGradient>

        {/* Arm gradient — slightly darker than body */}
        <linearGradient id="mq-arm" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#9C9892" />
          <stop offset="40%"  stopColor="#C0BCB7" />
          <stop offset="100%" stopColor="#9C9892" />
        </linearGradient>

        {/* Vertical tonal shift — subtle darker at bottom for depth */}
        <linearGradient id="mq-vert" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.10" />
          <stop offset="60%"  stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>

        {/* Chest highlight — subtle convex sheen */}
        <radialGradient id="mq-chest-hl" cx="50%" cy="38%" r="45%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        {/* Floor shadow */}
        <radialGradient id="mq-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Floor shadow ─────────────────────────── */}
      <ellipse cx="120" cy="510" rx="58" ry="9" fill="url(#mq-floor)" />

      {/* ── Neck ────────────────────────────────── */}
      <path
        d="M 104 0 C 104 0 104 10 104 24 Q 120 30 136 24 C 136 10 136 0 136 0 Z"
        fill="url(#mq-body)"
      />

      {/* ── Main torso + hips + leg channel ─────── */}
      {/*
        Shoulders at y=28, x=44 to x=196
        Waist at y=218, x=82 to x=158
        Hips at y=260, x=72 to x=168
        Legs split from y=260 to y=498
      */}
      <path
        d="
          M 104 24
          C  76 24  46 30  30 46
          C  18 58  14 76  14 96
          L  14 196
          C  14 218  26 232  46 238
          L  58 242
          C  62 256  64 270  64 284
          L  68 304
          L  72 498
          L 104 498
          L 106 280
          L 134 280
          L 136 498
          L 168 498
          L 172 304
          L 176 284
          C 176 270 178 256 182 242
          L 194 238
          C 214 232 226 218 226 196
          L 226  96
          C 226  76 222  58 210  46
          C 194  30 164  24 136  24
          Z
        "
        fill="url(#mq-body)"
      />
      {/* Vertical tonal overlay (same path) */}
      <path
        d="
          M 104 24
          C  76 24  46 30  30 46 C  18 58  14 76  14 96
          L  14 196 C  14 218  26 232  46 238 L  58 242
          C  62 256  64 270  64 284 L  68 304
          L  72 498 L 104 498 L 106 280 L 134 280 L 136 498
          L 168 498 L 172 304 L 176 284
          C 176 270 178 256 182 242 L 194 238
          C 214 232 226 218 226 196 L 226 96
          C 226  76 222  58 210  46 C 194  30 164  24 136  24 Z
        "
        fill="url(#mq-vert)"
      />
      {/* Chest highlight */}
      <path
        d="
          M 104 24 C 76 24 46 30 30 46 C 18 58 14 76 14 96
          L 14 196 C 14 218 26 232 46 238 L 194 238
          C 214 232 226 218 226 196 L 226 96
          C 226 76 222 58 210 46 C 194 30 164 24 136 24 Z
        "
        fill="url(#mq-chest-hl)"
      />

      {/* ── Left arm ────────────────────────────── */}
      <path
        d="
          M 14 96
          C 10 100  4 112  4 128
          L  4 248
          C  4 262 10 270 20 268
          L 28 264
          L 30 180
          L 30 100
          C 28  90 22  86 14  96 Z
        "
        fill="url(#mq-arm)"
      />
      <path d="M 14 96 C 10 100 4 112 4 128 L 4 248 C 4 262 10 270 20 268 L 28 264 L 30 180 L 30 100 C 28 90 22 86 14 96 Z"
        fill="url(#mq-vert)" />

      {/* ── Right arm ───────────────────────────── */}
      <path
        d="
          M 226 96
          C 234  90 240  86 236  96
          L 210 100
          L 210 180
          L 212 264
          L 220 268
          C 230 270 236 262 236 248
          L 236 128
          C 236 112 230 100 226 96 Z
        "
        fill="url(#mq-arm)"
      />
      <path d="M 226 96 C 234 90 240 86 236 96 L 210 100 L 210 180 L 212 264 L 220 268 C 230 270 236 262 236 248 L 236 128 C 236 112 230 100 226 96 Z"
        fill="url(#mq-vert)" />

      {/* ── Waist seam line (very subtle) ───────── */}
      <line x1="82" y1="218" x2="158" y2="218"
        stroke="#fff" strokeWidth="0.6" strokeOpacity="0.25" />
    </svg>
  );
}

export default function MannequinOutfit({ items, className }) {
  const byCategory = Object.fromEntries(items.map((i) => [i.category, i]));

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border",
        "bg-gradient-to-b from-[#f2f1ef] via-[#eeede9] to-[#e8e7e4]",
        "dark:from-[#1e1e1e] dark:via-[#1a1a1a] dark:to-[#181818]",
        "shadow-inner",
        className,
      )}
      style={{ aspectRatio: "2/3" }}
    >
      {/* Premium mannequin — solid, shaded, warm gray */}
      <MannequinBody />

      {/* Garments layered in correct dressing order */}
      {LAYER_ORDER.map((category) => {
        const item = byCategory[category];
        if (!item) return null;
        const slot = SLOTS[category];
        const isRight = !!slot.right;
        return (
          <div
            key={item.id}
            className="absolute flex items-center justify-center"
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
              className="h-full w-full object-contain"
              style={{
                filter:
                  "drop-shadow(0px 8px 24px rgba(0,0,0,0.22)) drop-shadow(0px 2px 6px rgba(0,0,0,0.14))",
              }}
              draggable={false}
            />
          </div>
        );
      })}

      {/* Category chips */}
      <div className="absolute bottom-2.5 inset-x-2 flex flex-wrap justify-center gap-1">
        {LAYER_ORDER.filter((c) => byCategory[c]).map((category) => (
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
