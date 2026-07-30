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
      {/* Scrollable pill row — no wrapping on small screens */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
        {OCCASIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => {
              onChange(o.key);
              onFreeTextChange(""); // clear free-text when a preset is picked
            }}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              value === o.key && !freeText
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground",
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
