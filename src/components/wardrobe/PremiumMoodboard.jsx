import { cn } from "@/lib/utils";

/**
 * Fashion-editorial flat-lay.
 *
 * Key layout trick: items within each flex slot are justified so they
 * "meet" at the boundary between slots:
 *   - Top/outerwear → justify-end  (image sticks to the BOTTOM of its slot)
 *   - Bottom/shoes  → justify-start (image sticks to the TOP of its slot)
 *
 * Result: shirt bottom and jeans top are visually adjacent, giving a real
 * "clothes laid together" feel instead of two separate floating images.
 */

// Proportional vertical space each category slot gets
const FLEX = {
  outerwear: 1.3,
  top: 1.1,
  bottom: 1.6,
  shoes: 0.85,
  accessory: 0.7,
};

// Which end of their slot images anchor to, so adjacent items touch
const JUSTIFY = {
  outerwear: "justify-end",
  top: "justify-end",
  bottom: "justify-start",
  shoes: "justify-start",
  accessory: "justify-center",
};

// Natural horizontal width for each category (clothes have real proportions)
const WIDTH = {
  outerwear: "88%",
  top: "80%",
  bottom: "68%",
  shoes: "58%",
  accessory: "44%",
};

const ORDER = ["outerwear", "top", "bottom", "shoes", "accessory"];

export default function PremiumMoodboard({ items, className }) {
  const knownOrder = ORDER.map((cat) => items.find((i) => i.category === cat)).filter(Boolean);
  const others = items.filter((i) => !ORDER.includes(i.category));
  const all = [...knownOrder, ...others];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border",
        "bg-[#f7f6f3] dark:bg-[#171717]",
        className,
      )}
      style={{ aspectRatio: "3/4" }}
    >
      {/* Subtle linen grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Ccircle cx='1' cy='1' r='0.6' fill='%23000'/%3E%3C/svg%3E\")",
        }}
      />

      {/*
        Each item div stretches to its flex share of the card height.
        justify-end / justify-start pulls the image to the boundary
        between items so the outfit looks packed together.
      */}
      <div className="relative flex h-full flex-col items-center px-6 py-3">
        {all.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex min-h-0 w-full flex-col items-center",
              JUSTIFY[item.category] ?? "justify-center",
            )}
            style={{ flex: FLEX[item.category] ?? 1 }}
          >
            <img
              src={item.image_url}
              alt={item.color_primary || item.category}
              className="max-h-full object-contain"
              style={{
                width: WIDTH[item.category] ?? "75%",
                filter:
                  "drop-shadow(0px 3px 12px rgba(0,0,0,0.13)) drop-shadow(0px 1px 3px rgba(0,0,0,0.08))",
              }}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Unobtrusive watermark */}
      <div className="pointer-events-none absolute bottom-2 inset-x-0 flex justify-center">
        <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-foreground/20">
          Flat lay
        </span>
      </div>
    </div>
  );
}
