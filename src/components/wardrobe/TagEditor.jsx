import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  CATEGORY_LABELS,
  PATTERN_LABELS,
  FIT_LABELS,
  SEASON_LABELS,
  FORMALITY_LABELS,
} from "@/lib/wardrobeConstants";

const CATEGORIES = Object.entries(CATEGORY_LABELS);
const PATTERNS = Object.entries(PATTERN_LABELS);
const FITS = Object.entries(FIT_LABELS);
const SEASONS = Object.entries(SEASON_LABELS);

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

/**
 * Inline, tap-to-edit editor for the AI-extracted tags.
 * `tags` is the full attribute object; `onChange` receives a new copy.
 */
export default function TagEditor({ tags, onChange }) {
  const set = (patch) => onChange({ ...tags, ...patch });

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Category">
        <Select
          value={tags.category}
          onValueChange={(v) => set({ category: v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Fit">
        <Select value={tags.fit} onValueChange={(v) => set({ fit: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FITS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Primary color">
        <Input
          value={tags.color_primary || ""}
          onChange={(e) => set({ color_primary: e.target.value })}
          placeholder="e.g. navy"
        />
      </Field>

      <Field label="Secondary color">
        <Input
          value={tags.color_secondary || ""}
          onChange={(e) => set({ color_secondary: e.target.value || null })}
          placeholder="optional"
        />
      </Field>

      <Field label="Pattern">
        <Select value={tags.pattern} onValueChange={(v) => set({ pattern: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PATTERNS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Season">
        <Select value={tags.season} onValueChange={(v) => set({ season: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEASONS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Formality">
        <Select
          value={String(tags.formality)}
          onValueChange={(v) => set({ formality: Number(v) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FORMALITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Material">
        <Input
          value={tags.material || ""}
          onChange={(e) => set({ material: e.target.value || null })}
          placeholder="e.g. cotton"
        />
      </Field>
    </div>
  );
}
