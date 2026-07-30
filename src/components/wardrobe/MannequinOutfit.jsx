import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";

/**
 * Premium Fashion Mannequin View
 * ──────────────────────────────
 * A sleek, minimalist headless mannequin inspired by Zara/COS.
 * Matte light gray finish, realistic tapered arms, natural waist.
 * Garments are layered so they naturally overlap (shirt hides pant waist).
 */

const SLOTS = {
  outerwear: { top: "6%",  height: "55%", width: "95%", zIndex: 5 },
  top:       { top: "8%",  height: "48%", width: "85%", zIndex: 3 },
  // Raised bottom slot significantly so the shirt naturally overlaps the waistband
  bottom:    { top: "37%", height: "57%", width: "66%", zIndex: 2 },
  shoes:     { top: "88%", height: "10%", width: "50%", zIndex: 4 },
  accessory: { top: "7%",  right: "4%", height: "14%", width: "18%", zIndex: 6 },
};

const LAYER_ORDER = ["bottom", "top", "outerwear", "shoes", "accessory"];

/** Minimalist fashion mannequin — sleek proportions, matte shading */
function MannequinBody() {
  return (
    <svg
      viewBox="0 0 240 520"
      className="absolute inset-0 h-full w-full opacity-90"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Soft, matte body gradient */}
        <linearGradient id="mq-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d1d1d1" />
          <stop offset="25%" stopColor="#e8e8e8" />
          <stop offset="75%" stopColor="#e8e8e8" />
          <stop offset="100%" stopColor="#bcbcbc" />
        </linearGradient>

        <linearGradient id="mq-arm-left" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bcbcbc" />
          <stop offset="100%" stopColor="#e2e2e2" />
        </linearGradient>

        <linearGradient id="mq-arm-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e2e2e2" />
          <stop offset="100%" stopColor="#b4b4b4" />
        </linearGradient>

        <radialGradient id="mq-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Floor shadow */}
      <ellipse cx="120" cy="505" rx="50" ry="7" fill="url(#mq-floor)" />

      {/* Main Torso & Legs */}
      <path
        d="
          M 112 15
          C 112 25 105 32 80 40
          C 60 46 50 55 50 65
          C 60 75 66 90 66 110
          C 66 150 78 170 78 210
          C 78 240 70 260 70 280
          L 78 500
          L 114 500
          C 114 350 120 290 120 280
          C 120 290 126 350 126 500
          L 162 500
          L 170 280
          C 170 260 162 240 162 210
          C 162 170 174 150 174 110
          C 174 90 180 75 190 65
          C 190 55 180 46 160 40
          C 135 32 128 25 128 15
          Z
        "
        fill="url(#mq-body)"
      />

      {/* Left Arm */}
      <path
        d="
          M 50 65
          C 30 90 20 150 25 250
          C 26 260 36 260 38 250
          C 34 160 45 110 65 95
          C 60 85 55 75 50 65
          Z
        "
        fill="url(#mq-arm-left)"
      />

      {/* Right Arm */}
      <path
        d="
          M 190 65
          C 210 90 220 150 215 250
          C 214 260 204 260 202 250
          C 206 160 195 110 175 95
          C 180 85 185 75 190 65
          Z
        "
        fill="url(#mq-arm-right)"
      />
    </svg>
  );
}

export default function MannequinOutfit({ items, className }) {
  const byCategory = Object.fromEntries(items.map((i) => [i.category, i]));

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[1.5rem] border",
        "bg-[#fcfcfc] dark:bg-[#121212]",
        className,
      )}
      style={{ aspectRatio: "4/5" }}
    >
      <MannequinBody />

      {/* Garments */}
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
              className="h-full w-full object-contain transition-all duration-200 ease-out hover:scale-105 hover:brightness-105 hover:drop-shadow-xl"
              style={{
                filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.15)) drop-shadow(0px 2px 6px rgba(0,0,0,0.1))",
              }}
              draggable={false}
            />
          </div>
        );
      })}

      {/* Category chips */}
      <div className="absolute bottom-3 inset-x-3 flex flex-wrap justify-center gap-1.5">
        {LAYER_ORDER.filter((c) => byCategory[c]).map((category) => (
          <span
            key={category}
            className="rounded-full bg-background/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur-md border border-border/50"
          >
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </div>
    </div>
  );
}
