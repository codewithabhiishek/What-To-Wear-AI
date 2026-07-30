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
  color: 0.2, // Color harmony
  recency: 0.15, // Variety / recently-worn deprioritization
  pattern: 0.1, // Pattern clash avoidance
};

export const MIN_SCORE = 40; // Reduced to allow weak outfits to exist naturally
export const MAX_RESULTS = 5;
export const RECENT_DAYS = 7;
export const STALE_BOOST_DAYS = 14;
export const RECENT_PAIR_PENALTY = 50; // Increased heavy penalty for worn pairs
export const STALE_ITEM_BOOST = 12.5; // per stale item

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
function formalityScore(items, targetRange) {
  const fs = items.map((i) => i.formality || 3);
  const min = Math.min(...fs);
  const max = Math.max(...fs);
  const avg = fs.reduce((a, b) => a + b, 0) / fs.length;
  const spread = max - min;

  let score = 50; // Base score
  let reason = "Formality is acceptable";

  // Check internal consistency
  if (spread > 1) {
    score -= (spread - 1) * 45;
    reason = "Formality clash between items";
  }

  // Check occasion match
  const targetMid = (targetRange[0] + targetRange[1]) / 2;

  if (avg < targetRange[0]) {
    score -= (targetRange[0] - avg) * 40;
    reason = "Too casual for the occasion";
  } else if (avg > targetRange[1]) {
    score -= (avg - targetRange[1]) * 40;
    reason = "Too formal for the occasion";
  } else if (Math.abs(avg - targetMid) <= 0.5 && spread <= 1) {
    score = 100; // Perfect match
    reason = "Perfect formality match";
  } else if (Math.abs(avg - targetMid) <= 1 && spread <= 1) {
    score = 80;
    reason = "Good formality match";
  }

  return { score: clamp(score, 0, 100), reason };
}

// ---- Rule 2: Silhouette balance (25%) --------------------------------------
function silhouetteScore(items) {
  const top = items.find((i) => i.category === "top");
  const bottom = items.find((i) => i.category === "bottom");
  if (!top || !bottom) return { score: 65, reason: "Standard fit" };

  const tf = top.fit;
  const bf = bottom.fit;

  if ((tf === "oversized" && bf === "fitted") || (tf === "fitted" && bf === "oversized")) {
    return { score: 100, reason: "Excellent silhouette balance" };
  }

  if ((tf === "oversized" && bf === "regular") || (tf === "regular" && bf === "oversized") ||
      (tf === "fitted" && bf === "regular") || (tf === "regular" && bf === "fitted")) {
    return { score: 80, reason: "Good proportions" };
  }

  if (tf === "oversized" && bf === "oversized") {
    return { score: 20, reason: "Too baggy (both oversized)" };
  }

  if (tf === "fitted" && bf === "fitted") {
    return { score: 35, reason: "Too tight (both fitted)" };
  }

  return { score: 65, reason: "Standard regular fit" };
}

// ---- Rule 3: Color harmony (20%) -------------------------------------------
function colorScore(items) {
  const bold = items.filter((i) => !isNeutralColor(i.color_primary));

  if (bold.length === 0) {
    return { score: 85, reason: "Clean neutral palette" };
  }
  if (bold.length === 1) {
    return { score: 100, reason: "Perfect color pop" };
  }
  if (bold.length === 2) {
    return { score: 40, reason: "Clashing bold colors" };
  }

  return { score: 10, reason: "Too many loud colors" };
}

// ---- Rule 4: Variety / recently worn (15%) ---------------------------------
function recencyScore(items, ctx) {
  const ids = items.map((i) => i.id);
  let score = 65; // Base score
  let reasons = [];

  let recentPairHits = 0;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (ctx.recentPairs.has([ids[i], ids[j]].sort().join("|"))) recentPairHits++;
    }
  }

  if (recentPairHits > 0) {
    score -= recentPairHits * RECENT_PAIR_PENALTY; // Heavy penalty
    reasons.push("Worn together recently");
  }

  let staleCount = 0;
  for (const id of ids) {
    const lw = ctx.lastWorn[id];
    if (lw === undefined || ctx.now - lw >= ctx.staleMs) staleCount++;
  }

  if (staleCount > 0 && recentPairHits === 0) {
    score += Math.min(staleCount * STALE_ITEM_BOOST, 35);
    reasons.push("Includes unworn pieces");
  }

  if (reasons.length === 0) reasons.push("Good rotation");

  return { score: clamp(score, 0, 100), reason: reasons.join(" & ") };
}

// ---- Rule 5: Pattern clash (10%) -------------------------------------------
function patternScore(items) {
  const patterned = items.filter((i) => i.pattern && i.pattern !== "solid");

  if (patterned.length === 0) {
    return { score: 85, reason: "Clean solid patterns" };
  }
  if (patterned.length === 1) {
    return { score: 100, reason: "Good pattern pop" };
  }

  return { score: 10, reason: "Clashing patterns" };
}

// ---- Blend + combo generation ----------------------------------------------
function scoreCombo(items, targetRange, ctx) {
  const f = formalityScore(items, targetRange);
  const s = silhouetteScore(items);
  const c = colorScore(items);
  const r = recencyScore(items, ctx);
  const p = patternScore(items);

  const score = Math.round(
    f.score * SCORING_WEIGHTS.formality +
    s.score * SCORING_WEIGHTS.silhouette +
    c.score * SCORING_WEIGHTS.color +
    r.score * SCORING_WEIGHTS.recency +
    p.score * SCORING_WEIGHTS.pattern
  );

  // DEBUG OUTPUT (As requested)
  console.log(`
--- OUTFIT SCORE DEBUGGING ---
Items: ${items.map(i => `${i.category}(${i.color_primary} ${i.fit})`).join(" + ")}
Occasion: ${JSON.stringify(targetRange)}
------------------------------
Formality:  ${f.score.toFixed(1)} (${f.reason})
Silhouette: ${s.score.toFixed(1)} (${s.reason})
Color:      ${c.score.toFixed(1)} (${c.reason})
Pattern:    ${p.score.toFixed(1)} (${p.reason})
Variety:    ${r.score.toFixed(1)} (${r.reason})
Weather:    N/A
------------------------------
FINAL SCORE: ${score}
==============================
`);

  return {
    items,
    score,
    breakdowns: [
      { category: "Formality", points: Math.round(f.score * SCORING_WEIGHTS.formality), max: Math.round(SCORING_WEIGHTS.formality * 100), raw: f.score, reason: f.reason },
      { category: "Silhouette", points: Math.round(s.score * SCORING_WEIGHTS.silhouette), max: Math.round(SCORING_WEIGHTS.silhouette * 100), raw: s.score, reason: s.reason },
      { category: "Color", points: Math.round(c.score * SCORING_WEIGHTS.color), max: Math.round(SCORING_WEIGHTS.color * 100), raw: c.score, reason: c.reason },
      { category: "Variety", points: Math.round(r.score * SCORING_WEIGHTS.recency), max: Math.round(SCORING_WEIGHTS.recency * 100), raw: r.score, reason: r.reason },
      { category: "Pattern", points: Math.round(p.score * SCORING_WEIGHTS.pattern), max: Math.round(SCORING_WEIGHTS.pattern * 100), raw: p.score, reason: p.reason },
    ],
  };
}

/**
 * Generate ranked outfit combinations from the user's closet.
 *
 * @param {Array} items     - the user's ClothingItem records
 * @param {string} occasion - a preset key or free-text occasion
 * @param {Array} history   - the user's OutfitHistory records (for recency)
 * @returns {Array<{items, score, breakdowns}>} ranked outfits above MIN_SCORE
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

  const validCombos = combos
    .filter((c) => c.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);

  const topOutfits = validCombos.slice(0, MAX_RESULTS);
  topOutfits.totalCount = validCombos.length;
  return topOutfits;
}