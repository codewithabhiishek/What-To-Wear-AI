import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";

const SLOT_LAYOUT = {
  top: { area: "top", span: "col-span-1 row-span-1" },
  outerwear: { area: "outer", span: "col-span-1 row-span-1" },
  bottom: { area: "bottom", span: "col-span-2 row-span-1" },
  shoes: { area: "shoes", span: "col-span-1 row-span-1" },
  accessory: { area: "acc", span: "col-span-1 row-span-1" },
};

function MoodboardTile({ item }) {
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-950"
    >
      <div className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-white to-muted/20 p-3 dark:from-zinc-900 dark:to-zinc-950 min-h-[88px]">
        <img
          src={item.image_url}
          alt={item.color_primary || item.category}
          className="max-h-[100px] w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
      </div>
      <div className="border-t border-border/50 px-2.5 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {CATEGORY_LABELS[item.category] || item.category}
        </p>
        <p className="mt-0.5 truncate text-xs capitalize text-foreground">
          {item.color_primary}
          {item.pattern && item.pattern !== "solid" ? ` · ${item.pattern}` : ""}
        </p>
      </div>
    </div>
  );
}

export default function PremiumMoodboard({ items, className }) {
  const top = items.find((i) => i.category === "top");
  const outerwear = items.find((i) => i.category === "outerwear");
  const bottom = items.find((i) => i.category === "bottom");
  const shoes = items.find((i) => i.category === "shoes");
  const accessory = items.find((i) => i.category === "accessory");

  const upperRow = [top, outerwear].filter(Boolean);
  const lowerExtras = [shoes, accessory].filter(Boolean);

  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-stone-50 via-white to-stone-100 p-4 shadow-inner dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900",
        className,
      )}
    >
      {/* Subtle linen texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative flex h-full flex-col gap-3">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Your outfit · flat lay
        </p>

        {/* Upper row: top + outerwear side by side */}
        {upperRow.length > 0 && (
          <div
            className={cn(
              "grid flex-1 gap-3",
              upperRow.length === 2 ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {upperRow.map((item) => (
              <MoodboardTile key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Bottom: full width */}
        {bottom && (
          <div className="flex-[1.2]">
            <MoodboardTile item={bottom} />
          </div>
        )}

        {/* Shoes + accessory */}
        {lowerExtras.length > 0 && (
          <div
            className={cn(
              "grid gap-3",
              lowerExtras.length === 2 ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {lowerExtras.map((item) => (
              <MoodboardTile key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Fallback for unexpected categories */}
        {items
          .filter((i) => !SLOT_LAYOUT[i.category])
          .map((item) => (
            <MoodboardTile key={item.id} item={item} />
          ))}
      </div>
    </div>
  );
}
