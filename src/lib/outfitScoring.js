// =============================================================================
// OUTFIT SCORING ENGINE
// -----------------------------------------------------------------------------
// A single, isolated, well-commented module. Every weight, threshold and
// lookup lives here so the scoring logic is easy to tune without touching the
// rest of the app.
//
// Flow:
//   generateOutfits(items, occasion, history)
//     1. Splits the closet into tops / bottoms / shoes / outerwear.
//     2. Builds every valid combination: top + bottom + shoes (+ optional
//        outerwear). If the user owns no shoes, top+bottom combos are still
//        generated so the feature stays usable early on.
//     3. Scores each combo 0–100 across five weighted rules.
//     4. Drops anything below MIN_SCORE, sorts high→low, returns the top few.
//
// Each sub-score is independent and returns 0–100, so the weighted blend is
// also 0–100. Tweak SCORING_WEIGHTS (must sum to 1) and the per-rule internals
// below to retune behavior.
// =============================================================================

import { OCCASION_FORMALITY, NEUTRAL_COLORS } from "./wardrobeConstants";

// ---- Tunable knobs ---------------------------------------------------------
export const SCORING_WEIGHTS = {
  formality: 0.3, // Formality match (occasion + internal consistency)
  silhouette: 0.25, // Silhouette balance (top↔bottom fit)
  color: 0.2, // Color harmony (max one bold color)
  recency: 0.15, // Variety / recently-worn deprioritization
  pattern: 0.1, // Pattern clash avoidance
};

export const MIN_SCORE = 60; // combos scoring below this are discarded
export const MAX_RESULTS = 5; // how many outfits to return at most
export const RECENT_DAYS = 7; // window for "recently worn together" penalty
export const STALE_BOOST_DAYS = 14; // items unworn this long get a small boost
export const RECENT_PAIR_PENALTY = 30; // per recently-worn-together pair
export const STALE_ITEM_BOOST = 5; // per stale item
export const STALE_BOOST_CAP = 15; // max total stale boost

// ---- Small helpers ---------------------------------------------------------
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function isNeutralColor(color) {
  if (!color) return true;
  const c = color.toLowerCase();
  return NEUTRAL_COLORS.some((n) => c.includes(n));
}

// Resolve an occasion (preset key or free text) to a formality range.
export function occasionFormalityRange(occasion) {
  const key = (occasion || "").toLowerCase().trim();
  if (OCCASION_FORMALITY[key]) return OCCASION_FORMALITY[key];
  // Unknown / free-text occasion → flexible mid range.
  return [2, 4];
}

// ---- Recency context (built once per generate call) ------------------------
// From the user's outfit history we derive:
//   - recentPairs: pairs of item ids worn together within RECENT_DAYS
//   - lastWorn:    last worn timestamp (ms) per item id
function buildRecencyContext(history) {
  const now = Date.now();
  const recentMs = RECENT_DAYS * 86400000;
  const recentPairs = new Set();
  const lastWorn = {};

  for (const outfit of history || []) {
    const wornAt = new Date(outfit.created_date).getTime();
    if (Number.isNaN(wornAt)) continue;
    const ids = outfit.item_ids || [];

    for (const id of ids) {
      if (lastWorn[id] === undefined || wornAt > lastWorn[id]) {
        lastWorn[id] = wornAt;
      }
    }

    if (now - wornAt <= recentMs) {
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          recentPairs.add([ids[i], ids[j]].sort().join("|"));
        }
      }
    }
  }

  return { recentPairs, lastWorn, now, staleMs: STALE_BOOST_DAYS * 86400000 };
}

// ---- Rule 1: Formality match (30%) ----------------------------------------
// All items should be within ~1 formality point of each other, and the combo's
// average formality should land inside the occasion's target range.
function formalityScore(items, targetRange) {
  const fs = items.map((i) => i.formality || 3);
  const min = Math.min(...fs);
  const max = Math.max(...fs);
  const avg = fs.reduce((a, b) => a + b, 0) / fs.length;

  let score = 100;
  // Penalize spread beyond 1 point on the formality scale.
  const spread = max - min;
  if (spread > 1) score -= (spread - 1) * 35;
  // Penalize drifting outside the occasion's target formality range.
  if (avg < targetRange[0]) score -= (targetRange[0] - avg) * 25;
  else if (avg > targetRange[1]) score -= (avg - targetRange[1]) * 25;

  return clamp(score, 0, 100);
}

// ---- Rule 2: Silhouette balance (25%) --------------------------------------
// Oversized top pairs best with fitted/regular bottom (and vice versa). Two
// oversized or two fitted pieces together score lower.
function silhouetteScore(items) {
  const top = items.find((i) => i.category === "top");
  const bottom = items.find((i) => i.category === "bottom");
  if (!top || !bottom) return 80;

  const tf = top.fit;
  const bf = bottom.fit;

  if ((tf === "oversized" && bf === "fitted") || (tf === "fitted" && bf === "oversized"))
    return 100;
  if (
    (tf === "oversized" && bf === "regular") ||
    (tf === "regular" && bf === "oversized") ||
    (tf === "fitted" && bf === "regular") ||
    (tf === "regular" && bf === "fitted")
  )
    return 85;
  if (tf === "oversized" && bf === "oversized") return 45;
  if (tf === "fitted" && bf === "fitted") return 65;
  return 80; // regular + regular
}

// ---- Rule 3: Color harmony (20%) -------------------------------------------
// No more than one bold/saturated color per outfit; neutrals pair with anything.
function colorScore(items) {
  const bold = items.filter((i) => !isNeutralColor(i.color_primary));
  if (bold.length <= 1) return 100;
  if (bold.length === 2) return 50; // two competing bold colors
  return 25;
}

// ---- Rule 4: Variety / recently worn (15%) ---------------------------------
// Deprioritize combos whose item pairs were worn together in the last 7 days;
// give a small boost to items unworn for 14+ days.
function recencyScore(items, ctx) {
  const ids = items.map((i) => i.id);
  let score = 100;

  let recentPairHits = 0;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (ctx.recentPairs.has([ids[i], ids[j]].sort().join("|"))) recentPairHits++;
    }
  }
  score -= recentPairHits * RECENT_PAIR_PENALTY;

  let staleCount = 0;
  for (const id of ids) {
    const lw = ctx.lastWorn[id];
    if (lw === undefined || ctx.now - lw >= ctx.staleMs) staleCount++;
  }
  score += Math.min(staleCount * STALE_ITEM_BOOST, STALE_BOOST_CAP);

  return clamp(score, 0, 100);
}

// ---- Rule 5: Pattern clash (10%) -------------------------------------------
// No more than one patterned item per outfit (scale compatibility isn't
// modeled in the MVP, so any second patterned piece is treated as a clash).
function patternScore(items) {
  const patterned = items.filter((i) => i.pattern && i.pattern !== "solid");
  if (patterned.length <= 1) return 100;
  if (patterned.length === 2) return 50;
  return 20;
}

// ---- Blend + combo generation ----------------------------------------------
function scoreCombo(items, targetRange, ctx) {
  const f = formalityScore(items, targetRange);
  const s = silhouetteScore(items);
  const c = colorScore(items);
  const r = recencyScore(items, ctx);
  const p = patternScore(items);

  const score = Math.round(
    f * SCORING_WEIGHTS.formality +
      s * SCORING_WEIGHTS.silhouette +
      c * SCORING_WEIGHTS.color +
      r * SCORING_WEIGHTS.recency +
      p * SCORING_WEIGHTS.pattern
  );

  return {
    items,
    score,
    breakdown: { formality: f, silhouette: s, color: c, recency: r, pattern: p },
  };
}

/**
 * Generate ranked outfit combinations from the user's closet.
 *
 * @param {Array} items     - the user's ClothingItem records
 * @param {string} occasion - a preset key or free-text occasion
 * @param {Array} history   - the user's OutfitHistory records (for recency)
 * @returns {Array<{items, score, breakdown}>} ranked outfits above MIN_SCORE
 */
export function generateOutfits(items, occasion, history) {
  const tops = items.filter((i) => i.category === "top");
  const bottoms = items.filter((i) => i.category === "bottom");
  const shoes = items.filter((i) => i.category === "shoes");
  const outerwears = items.filter((i) => i.category === "outerwear");

  // Need at least a top and a bottom to form an outfit.
  if (!tops.length || !bottoms.length) return [];

  const targetRange = occasionFormalityRange(occasion);
  const ctx = buildRecencyContext(history);

  const combos = [];
  for (const top of tops) {
    for (const bottom of bottoms) {
      // Base combos: with each shoe, or just top+bottom when no shoes exist.
      const baseCombos = shoes.length
        ? shoes.map((shoe) => [top, bottom, shoe])
        : [[top, bottom]];

      for (const base of baseCombos) {
        combos.push(scoreCombo(base, targetRange, ctx));
        for (const ow of outerwears) {
          combos.push(scoreCombo([...base, ow], targetRange, ctx));
        }
      }
    }
  }

  return combos
    .filter((c) => c.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}