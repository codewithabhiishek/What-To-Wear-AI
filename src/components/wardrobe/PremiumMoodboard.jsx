import { cn } from "@/lib/utils";

/**
 * Fashion-editorial flat-lay.
 *
 * Layout strategy:
 * - Each item gets a fixed percentage height (based on category) — no stretchy flex.
 * - Items are packed together with a tiny gap and the group is centered in the card.
 * - This guarantees the shirt and jeans are visually adjacent regardless of
 *   the image's actual aspect ratio (which varies per photo).
 */

// Fixed height each category item occupies as % of the card height
const ITEM_HEIGHT = {
  outerwear: "34%",
  top:       "30%",
  bottom:    "42%",
  shoes:     "18%",
  accessory: "14%",
};

// Horizontal width of each item — clothes have natural real-world proportions
const ITEM_WIDTH = {
  outerwear: "86%",
  top:       "78%",
  bottom:    "66%",
  shoes:     "54%",
  accessory: "42%",
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
      {/* Very subtle linen grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Ccircle cx='1' cy='1' r='0.6' fill='%23000'/%3E%3C/svg%3E\")",
        }}
      />

      {/*
        Items are fixed-height divs (no stretching) stacked with a 4px gap.
        The group is centered vertically in the card.
        Fixed heights mean shirt + jeans always sit close together,
        independent of each image's actual aspect ratio.
      */}
      <div className="relative flex h-full flex-col items-center justify-center gap-1 px-5 py-3">
        {all.map((item) => (
          <div
            key={item.id}
            className="flex shrink-0 items-center justify-center"
            style={{
              height: ITEM_HEIGHT[item.category] ?? "24%",
              width: ITEM_WIDTH[item.category] ?? "72%",
            }}
          >
            <img
              src={item.image_url}
              alt={item.color_primary || item.category}
              className="max-h-full max-w-full object-contain"
              style={{
                filter:
                  "drop-shadow(0px 3px 12px rgba(0,0,0,0.14)) drop-shadow(0px 1px 3px rgba(0,0,0,0.08))",
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
