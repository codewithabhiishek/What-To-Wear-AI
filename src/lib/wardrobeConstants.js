// =============================================================================
// Wardrobe constants — tunable lookup tables for the outfit engine.
// =============================================================================

// Occasion → target formality range [min, max] on the 1–5 scale.
// Used by the formality scoring rule. Add or adjust occasions freely.
export const OCCASION_FORMALITY = {
  gym: [1, 2],
  casual: [1, 3],
  college: [2, 3],
  office: [3, 4],
  date: [3, 4],
  party: [3, 5],
  wedding: [4, 5],
};

// The chips shown on the "What to wear?" screen.
export const OCCASIONS = [
  { key: "college", label: "College", icon: "🏫" },
  { key: "office", label: "Office", icon: "💼" },
  { key: "date", label: "Date", icon: "🥂" },
  { key: "party", label: "Party", icon: "🎉" },
  { key: "gym", label: "Gym", icon: "🏋️" },
  { key: "casual", label: "Casual", icon: "☕" },
  { key: "wedding", label: "Wedding", icon: "💍" },
];

// Neutral colors pair with anything. Anything NOT listed here is treated as a
// "bold"/saturated color for the color-harmony rule. Matching is substring-based
// and case-insensitive so "off-white", "charcoal grey", etc. all resolve.
export const NEUTRAL_COLORS = [
  "white",
  "black",
  "grey",
  "gray",
  "beige",
  "navy",
  "cream",
  "brown",
  "tan",
  "khaki",
  "charcoal",
  "ivory",
  "off-white",
  "sand",
  "taupe",
];

// Friendly labels for enums (used across the UI).
export const CATEGORY_LABELS = {
  top: "Top",
  bottom: "Bottom",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessory: "Accessory",
};

export const PATTERN_LABELS = {
  solid: "Solid",
  striped: "Striped",
  printed: "Printed",
  checked: "Checked",
  other: "Other",
};

export const FIT_LABELS = {
  fitted: "Fitted",
  regular: "Regular",
  oversized: "Oversized",
};

export const SEASON_LABELS = {
  summer: "Summer",
  winter: "Winter",
  "all-season": "All-season",
};

export const FORMALITY_LABELS = {
  1: "1 · Loungewear",
  2: "2 · Casual",
  3: "3 · Smart casual",
  4: "4 · Business",
  5: "5 · Formal",
};