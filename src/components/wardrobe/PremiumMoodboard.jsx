import { cn } from "@/lib/utils";

/**
 * Premium Fashion Flat Lay
 * ─────────────────────────
 * Items are absolutely positioned for a tight, editorial composition.
 * Shirt OVERLAPS pants at the waist (like a real flat lay on a white surface).
 * Z-index: outerwear > top > bottom, shoes at foot of frame.
 */

// Absolute positions as % of card height/width.
// Top + bottom intentionally overlap so the shirt "tucks" over the pants.
const LAYOUT = {
  outerwear: { top: "2%",  height: "48%", width: "90%", zIndex: 4 },
  top:       { top: "4%",  height: "40%", width: "75%", zIndex: 3 },
  bottom:    { top: "33%", height: "52%", width: "58%", zIndex: 2 },
  shoes:     { top: "78%", height: "18%", width: "44%", zIndex: 1 },
  accessory: { top: "4%",  height: "16%", width: "28%", right: "5%", left: "auto", zIndex: 5 },
};

const ORDER = ["outerwear", "top", "bottom", "shoes", "accessory"];

export default function PremiumMoodboard({ items, className }) {
  const ordered = ORDER.map((cat) => items.find((i) => i.category === cat)).filter(Boolean);
  const others  = items.filter((i) => !ORDER.includes(i.category));
  const all = [...ordered, ...others];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border",
        "bg-[#f5f4f2] dark:bg-[#1c1c1c]",
        className,
      )}
      style={{ aspectRatio: "3/4" }}
    >
      {/* Very light paper texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='1' cy='1' r='0.7' fill='%23000'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Garments — absolutely positioned, tight composition with overlap */}
      {all.map((item) => {
        const L = LAYOUT[item.category];
        if (!L) return null;
        const isRight = !!L.right;
        return (
          <div
            key={item.id}
            className="absolute flex items-center justify-center"
            style={{
              top:       L.top,
              height:    L.height,
              width:     L.width,
              zIndex:    L.zIndex,
              left:      isRight ? "auto" : "50%",
              right:     isRight ? L.right : "auto",
              transform: isRight ? "none" : "translateX(-50%)",
            }}
          >
            <img
              src={item.image_url}
              alt={item.color_primary || item.category}
              className="h-full w-full object-contain"
              style={{
                filter:
                  "drop-shadow(0px 4px 18px rgba(0,0,0,0.13)) drop-shadow(0px 1px 4px rgba(0,0,0,0.07))",
              }}
              draggable={false}
            />
          </div>
        );
      })}

      {/* Minimal label */}
      <div className="pointer-events-none absolute bottom-2 inset-x-0 flex justify-center">
        <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-foreground/20">
          Flat lay
        </span>
      </div>
    </div>
  );
}
