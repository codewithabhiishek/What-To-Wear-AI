import { useId } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/wardrobeConstants";

// The renderer intentionally composes the user's actual cut-out photos. It is
// a styling preview, not an AI-generated virtual try-on.
const LAYERS = ["bottom", "top", "outerwear", "shoes", "accessory"];

const ANCHORS = {
  outerwear: { top: "13.2%", left: "8.5%", width: "83%", height: "45%", clip: "polygon(16% 0, 84% 0, 100% 19%, 91% 100%, 9% 100%, 0 19%)" },
  top: { top: "16.5%", left: "13%", width: "74%", height: "39%", clip: "polygon(14% 0, 86% 0, 100% 20%, 88% 100%, 12% 100%, 0 20%)" },
  bottom: { top: "49.2%", left: "22%", width: "56%", height: "42.5%", clip: "polygon(4% 0, 96% 0, 89% 100%, 58% 100%, 50% 42%, 42% 100%, 11% 100%)" },
  shoes: { top: "88.5%", left: "20%", width: "60%", height: "9%", clip: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
  accessory: { top: "20%", left: "67%", width: "21%", height: "17%", clip: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
};

function StudioForm({ prefix, covered }) {
  const hiddenTorso = covered.top || covered.outerwear;
  const hiddenLegs = covered.bottom;

  return (
    <svg viewBox="0 0 360 620" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${prefix}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#cfd2d2" />
          <stop offset="0.42" stopColor="#f9f9f7" />
          <stop offset="0.72" stopColor="#e8e9e6" />
          <stop offset="1" stopColor="#c7c9c8" />
        </linearGradient>
        <linearGradient id={`${prefix}-neck`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#f5f5f2" />
          <stop offset="1" stopColor="#c7c9c8" />
        </linearGradient>
        <radialGradient id={`${prefix}-glow`} cx="50%" cy="30%" r="70%">
          <stop stopColor="#fff" stopOpacity="0.93" />
          <stop offset="1" stopColor="#e5e6e3" stopOpacity="0" />
        </radialGradient>
        <filter id={`${prefix}-blur`}><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      <ellipse cx="180" cy="590" rx="86" ry="14" fill="#727772" opacity="0.18" filter={`url(#${prefix}-blur)`} />
      <rect width="360" height="620" fill={`url(#${prefix}-glow)`} />
      <path d="M157 92 L203 92 L207 128 L153 128 Z" fill={`url(#${prefix}-neck)`} />
      <ellipse cx="180" cy="56" rx="38" ry="47" fill={`url(#${prefix}-body)`} />
      <path d="M151 123 C128 126 100 138 86 158 C77 172 75 192 82 210 L100 260 L116 253 L107 201 C105 187 109 173 121 165 L143 151 Z" fill={`url(#${prefix}-body)`} opacity={hiddenTorso ? "0.2" : "0.9"} />
      <path d="M209 123 C232 126 260 138 274 158 C283 172 285 192 278 210 L260 260 L244 253 L253 201 C255 187 251 173 239 165 L217 151 Z" fill={`url(#${prefix}-body)`} opacity={hiddenTorso ? "0.2" : "0.9"} />
      <path d="M140 126 C119 135 112 161 116 216 L126 320 C130 339 145 350 180 350 C215 350 230 339 234 320 L244 216 C248 161 241 135 220 126 C202 134 158 134 140 126 Z" fill={`url(#${prefix}-body)`} opacity={hiddenTorso ? "0.12" : "0.88"} />
      <path d="M134 341 L125 575 L166 575 L176 350 Z M226 341 L235 575 L194 575 L184 350 Z" fill={`url(#${prefix}-body)`} opacity={hiddenLegs ? "0.1" : "0.88"} />
      <path d="M122 574 L169 574 L175 588 L116 588 Z M191 574 L238 574 L244 588 L185 588 Z" fill="#c9ccca" opacity={hiddenLegs ? "0.1" : "0.8"} />
    </svg>
  );
}

function Garment({ item, category }) {
  const anchor = ANCHORS[category];
  if (!anchor) return null;
  const fitScale = item.fit === "oversized" ? 1.06 : item.fit === "fitted" ? 0.95 : 1;

  return (
    <div className="absolute flex items-center justify-center" style={{ ...anchor, zIndex: LAYERS.indexOf(category) + 3 }}>
      <div className="h-full w-full overflow-hidden" style={{ clipPath: anchor.clip }}>
        <img
          src={item.image_url}
          alt={`${item.color_primary || ""} ${CATEGORY_LABELS[category] || category}`.trim()}
          className="h-full w-full object-contain"
          style={{
            transform: `scale(${fitScale})`,
            filter: "drop-shadow(0 12px 12px rgba(36, 40, 37, 0.18)) drop-shadow(0 2px 2px rgba(36, 40, 37, 0.14))",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}

export default function MannequinOutfit({ items, className }) {
  const prefix = useId().replace(/:/g, "");
  const byCategory = Object.fromEntries(items.map((item) => [item.category, item]));
  const covered = { top: Boolean(byCategory.top), outerwear: Boolean(byCategory.outerwear), bottom: Boolean(byCategory.bottom) };

  return (
    <section
      className={cn("relative isolate w-full overflow-hidden bg-[#eff0ed] text-foreground", className)}
      style={{ aspectRatio: "9 / 14" }}
      aria-label="Styled mannequin preview using your uploaded garments"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,.98),rgba(240,241,238,.82)_45%,rgba(215,218,213,.92))]" />
      <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[linear-gradient(180deg,transparent,rgba(194,198,192,.22))]" />
      <StudioForm prefix={prefix} covered={covered} />
      {LAYERS.map((category) => byCategory[category] && <Garment key={byCategory[category].id} item={byCategory[category]} category={category} />)}
      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600/70">
        <span>Styled form</span><span>Preview</span>
      </div>
      <p className="absolute inset-x-4 bottom-3 text-center text-[10px] font-medium text-slate-600/75">Placement preview · uses your original garment photos</p>
    </section>
  );
}
