import { cn } from "@/lib/utils";

/**
 * Fashion-editorial flat-lay: clothing items stacked vertically on a clean
 * neutral surface — no individual card borders, no excessive gaps.
 * Items are transparent PNGs (background already removed) so they float
 * naturally against the background and look like a real flat-lay photo.
 */

// Proportional vertical space each category gets (larger = taller slot)
const FLEX = {
  outerwear: 1.5,
  top: 1.3,
  bottom: 1.7,
  shoes: 1.0,
  accessory: 0.8,
};

// Display order from top of frame to bottom
const ORDER = ["outerwear", "top", "bottom", "shoes", "accessory"];

export default function PremiumMoodboard({ items, className }) {
  // Sort items into natural top-to-bottom dressing order
  const knownOrder = ORDER.map((cat) => items.find((i) => i.category === cat)).filter(Boolean);
  const others = items.filter((i) => !ORDER.includes(i.category));
  const all = [...knownOrder, ...others];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border",
        // Warm off-white in light mode, deep charcoal in dark
        "bg-[#f7f6f3] dark:bg-[#171717]",
        className,
      )}
      style={{ aspectRatio: "3/4" }}
    >
      {/* Extremely subtle linen-grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Ccircle cx='1' cy='1' r='0.6' fill='%23000'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Items: stacked vertically, filling their proportional flex slot */}
      <div className="relative flex h-full flex-col items-center justify-center px-8 py-5">
        {all.map((item) => (
          <div
            key={item.id}
            className="relative flex w-full min-h-0 items-center justify-center"
            style={{ flex: FLEX[item.category] ?? 1 }}
          >
            <img
              src={item.image_url}
              alt={item.color_primary || item.category}
              className="max-h-full w-full object-contain"
              style={{
                // Realistic shadow so items look grounded on a physical surface
                filter:
                  "drop-shadow(0px 3px 10px rgba(0,0,0,0.13)) drop-shadow(0px 1px 3px rgba(0,0,0,0.08))",
              }}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Tiny watermark — unobtrusive */}
      <div className="pointer-events-none absolute bottom-2 inset-x-0 flex justify-center">
        <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-foreground/20">
          Flat lay
        </span>
      </div>
    </div>
  );
}
