import { Image } from "@/components/ui/image";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";

export default function OutfitThumbnails({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div key={item.id} className="w-20 shrink-0">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={item.image_url}
              alt={item.color_primary || "item"}
              className="h-full w-full object-contain p-1"
            />
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABELS[item.category] || item.category}
          </p>
        </div>
      ))}
    </div>
  );
}
