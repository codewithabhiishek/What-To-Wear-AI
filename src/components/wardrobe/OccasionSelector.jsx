import { Input } from "@/components/ui/input";
import { OCCASIONS } from "@/lib/wardrobeConstants";
import { cn } from "@/lib/utils";

export default function OccasionSelector({
  value,
  onChange,
  freeText,
  onFreeTextChange,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {OCCASIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              value === o.key
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <Input
        value={freeText}
        onChange={(e) => onFreeTextChange(e.target.value)}
        placeholder="Or describe your own occasion (e.g. brunch with friends)…"
        className="w-full"
      />
    </div>
  );
}
