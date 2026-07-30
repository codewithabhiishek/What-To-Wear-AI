# What To Wear AI — Architecture & Logic

This document is the single source of truth for the technical design, data flow, and core logic of **What To Wear AI**. Keep it up to date whenever a major module changes.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite |
| Styling & UI | Tailwind CSS v3, shadcn/ui, Framer Motion, Lucide React |
| Routing | React Router DOM v6 |
| Server state | TanStack React Query |
| Auth & Database | Firebase (Authentication + Firestore) |
| File storage | Vercel Blob |
| Serverless API | Vercel Serverless Functions (`/api/*`) |
| AI — Vision tagging | NVIDIA NIM · `meta/llama-3.2-90b-vision-instruct` |
| AI — Text explanations | NVIDIA NIM · `meta/llama-3.1-8b-instruct` |
| AI — Outfit image gen | Pollinations.ai (`flux` model, free, no auth) |
| Background removal | `@imgly/background-removal` (runs fully in the browser, WASM) |

---

## 2. Project File Structure

```
what-to-wear-ai/
├── api/                          # Vercel serverless functions
│   ├── upload-photo.js           # Streams upload → Vercel Blob, returns public URL
│   ├── tag-clothing-item.js      # NVIDIA Vision → structured JSON tags
│   ├── generate-outfit-explanation.js  # NVIDIA text → one-sentence outfit rationale
│   └── visualize-outfit.js       # Returns a Pollinations.ai image URL for the outfit
│
├── src/
│   ├── api/
│   │   └── firebaseClient.js     # Firebase app init; exports `auth` and `db`
│   ├── lib/
│   │   ├── AuthContext.jsx       # Auth state (onAuthStateChanged), logout helper
│   │   ├── ThemeProvider.jsx     # Light / dark / system theme via localStorage
│   │   ├── outfitScoring.js      # Client-side outfit combination & scoring engine
│   │   ├── visualizeOutfit.js    # Outfit image prompt builder + localStorage cache
│   │   ├── wardrobeConstants.js  # Occasions, category/pattern/fit/season/formality enums
│   │   ├── authReturnTo.js       # Safe same-origin ?returnTo= resolution
│   │   ├── query-client.js       # Shared TanStack QueryClient instance
│   │   ├── utils.js              # `cn()` (clsx + tailwind-merge)
│   │   └── PageNotFound.jsx      # 404 fallback page
│   ├── pages/
│   │   ├── Closet.jsx            # Browse, upload, edit, delete clothing items
│   │   ├── WhatToWear.jsx        # Generate & display ranked outfit suggestions
│   │   ├── History.jsx           # View previously logged outfits
│   │   ├── Settings.jsx          # Update display name, sign out
│   │   ├── Login.jsx             # Email/password + Google sign-in
│   │   ├── Register.jsx          # Email/password + Google register
│   │   ├── ForgotPassword.jsx    # Send Firebase password reset email
│   │   └── ResetPassword.jsx     # Confirm password reset via oobCode
│   ├── components/
│   │   ├── Layout.jsx            # App shell: top nav, bottom mobile nav, page transitions
│   │   ├── ProtectedRoute.jsx    # Redirects unauthenticated users to /login
│   │   ├── AuthLayout.jsx        # Shared card wrapper for auth pages
│   │   ├── ModeToggle.jsx        # Light/dark toggle button
│   │   ├── ScrollToTop.jsx       # Resets scroll position on route change
│   │   ├── GoogleIcon.jsx        # Google branded SVG icon
│   │   ├── UserNotRegisteredError.jsx
│   │   ├── ui/                   # shadcn/ui primitives (generated, do not hand-edit)
│   │   └── wardrobe/
│   │       ├── ClosetItemCard.jsx    # Single clothing item tile (edit/delete)
│   │       ├── UploadItemDialog.jsx  # Multi-phase upload → background removal → tag → save
│   │       ├── EditItemDialog.jsx    # Fix AI tags on an existing item
│   │       ├── TagEditor.jsx         # Inline form for all 7 clothing attributes
│   │       ├── OccasionSelector.jsx  # Chip picker + free-text for occasion
│   │       ├── OutfitCard.jsx        # Ranked outfit card with score + "I wore this"
│   │       ├── OutfitMedia.jsx       # Tab switcher: flat-lay moodboard vs. on-mannequin
│   │       ├── PremiumMoodboard.jsx  # Editorial flat-lay grid using real item photos
│   │       ├── MannequinOutfit.jsx   # Composite item images onto SVG mannequin silhouette
│   │       ├── OutfitThumbnails.jsx  # Small row of item thumbnails (History page)
│   │       ├── EmptyState.jsx        # Dashed-border empty state with icon + CTA
│   │       └── Skeletons.jsx         # Shimmer loading skeletons for closet & outfit lists
```

---

## 3. Environment Variables

Create a `.env.local` file (never commit it). All `VITE_` variables are exposed to the browser; the rest are server-only.

```env
# Firebase (client-side)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=

# NVIDIA NIM — vision tagging + text explanations (server-side only)
NVIDIA_API_KEY=

# Vercel Blob — auto-provided when you link a Blob store in the Vercel dashboard
BLOB_READ_WRITE_TOKEN=
```

> **Note:** `GEMINI_API_KEY` is **not** used by this project. The AI layer is entirely NVIDIA NIM.

---

## 4. Authentication Flow

Firebase Authentication handles all auth. There is no custom auth server.

```
/login    → Email/password  ──┐
          → Google popup      ├─→ Firebase Auth ──→ onAuthStateChanged ──→ AuthContext
/register → Email/password  ──┘
          → Google popup

/forgot-password  →  sendPasswordResetEmail()  →  Firebase sends email
/reset-password?oobCode=...  →  confirmPasswordReset()  →  redirect /login
```

- **`AuthContext.jsx`** wraps the app and subscribes to `onAuthStateChanged`. It exposes `user`, `isAuthenticated`, `isLoadingAuth`, and `logout()`.
- **`ProtectedRoute.jsx`** reads `isAuthenticated` / `isLoadingAuth`. While loading it shows a spinner; if unauthenticated it renders the `unauthenticatedElement` prop (a `<Navigate to="/login" />` in `App.jsx`).
- **`safeReturnTo()`** (`authReturnTo.js`) validates the `?returnTo=` query parameter to prevent open-redirect attacks before using it as the post-login destination.

---

## 5. Clothing Item Data Flow

How a clothing item goes from phone camera → Firestore:

```
1. User opens UploadItemDialog
   └─ PHASE: SELECT

2. User picks a photo (camera or file picker)
   └─ PHASE: PROCESSING_BG
      @imgly/background-removal runs WASM in the browser
      → transparent PNG blob

3. Transparent PNG → POST /api/upload-photo
   └─ PHASE: UPLOADING
      Vercel Blob stores it, returns a public HTTPS URL

4. Image URL → POST /api/tag-clothing-item
   └─ PHASE: TAGGING
      NVIDIA Vision (llama-3.2-90b) downloads the image, returns JSON:
      { category, color_primary, color_secondary, pattern, fit, formality, material, season }

5. User reviews & corrects tags in TagEditor
   └─ PHASE: EDITING

6. Confirmed → Firestore: users/{userId}/clothingItems/{autoId}
   └─ PHASE: SAVING
```

**Firestore schema — `clothingItems` document:**

```js
{
  image_url:       string,   // Vercel Blob public URL
  category:        "top" | "bottom" | "outerwear" | "shoes" | "accessory",
  color_primary:   string,   // e.g. "navy"
  color_secondary: string | null,
  pattern:         "solid" | "striped" | "printed" | "checked" | "other",
  fit:             "fitted" | "regular" | "oversized",
  formality:       1 | 2 | 3 | 4 | 5,
  material:        string | null,  // e.g. "cotton"
  season:          "summer" | "winter" | "all-season",
  laundry_status:  "clean",        // always "clean" on create; reserved for future use
  created_date:    ISO 8601 string
}
```

---

## 6. Outfit Scoring Engine (`src/lib/outfitScoring.js`)

Runs entirely on the client — no server round-trip — so suggestions appear instantly before AI explanations arrive.

### 6.1 Combination Generation

1. Split wardrobe into: `tops`, `bottoms`, `shoes`, `outerwears`.
2. Build all `top × bottom × shoe` combos. If the user owns no shoes, degrade gracefully to `top × bottom`.
3. For each base combo, also generate versions that include each `outerwear` piece.

### 6.2 Scoring Rules (weights must sum to 1.0)

| # | Rule | Weight | How it works |
|---|---|---|---|
| 1 | **Formality match** | 30% | Average formality of all items must fall inside the occasion's target range. A spread > 1 point between items is also penalised. |
| 2 | **Silhouette balance** | 25% | Oversized top + fitted bottom (or vice versa) → 100. Same fit × same fit → lower scores. Oversized + oversized → 45. |
| 3 | **Color harmony** | 20% | ≤ 1 bold color → 100. Two bold colors → 50. Three+ → 25. Neutrals (black, white, grey, navy, beige…) never count as bold. |
| 4 | **Variety / recency** | 15% | Pairs worn together in the last 7 days are penalised (`RECENT_PAIR_PENALTY = 30`). Items unworn for 14+ days get a small boost (`STALE_ITEM_BOOST = 5`, capped at 15). |
| 5 | **Pattern clash** | 10% | ≤ 1 patterned item → 100. Two patterns → 50. Three+ → 20. |

- **`MIN_SCORE = 60`** — combos below this are discarded.
- **`MAX_RESULTS = 5`** — top 5 results are returned, sorted descending.

### 6.3 Occasion → Formality Target Range

```js
gym:     [1, 2]   casual:  [1, 3]   college: [2, 3]
office:  [3, 4]   date:    [3, 4]   party:   [3, 5]   wedding: [4, 5]
// Free-text occasion → flexible mid-range [2, 4]
```

---

## 7. AI Outfit Explanations

For each of the top 5 outfits, the app fires a parallel `fetch` to `/api/generate-outfit-explanation` with a structured text prompt describing the items (color, fit, formality, pattern) and the occasion.

- **Model:** `meta/llama-3.1-8b-instruct` via NVIDIA NIM
- **Timeout:** 6 seconds per request (AbortController). On timeout or API failure, the explanation gracefully falls back to an empty string — the UI shows a generic placeholder.
- The explanation is stored alongside `item_ids` and `occasion` when the user logs an outfit.

---

## 8. Outfit Visualization (`src/lib/visualizeOutfit.js`)

The `OutfitMedia` component offers two viewing modes toggled by the user:

### Flat-lay Moodboard (default)
`PremiumMoodboard.jsx` renders the user's actual clothing photos in an editorial grid layout (top + outerwear in the upper row, bottom full-width, shoes + accessories below). No external API call.

### On-Mannequin View
`MannequinOutfit.jsx` composites the user's real item photos over an inline SVG mannequin silhouette using absolute positioning and z-index layering. Also no external API call — this is a pure CSS/SVG composite.

### AI-Generated Image (via `visualizeOutfit.js`)
A third path exists (`/api/visualize-outfit`) for generating a photorealistic image of the outfit via **Pollinations.ai** (free, no authentication required). It uses the `flux` model at 768×1024.

- Results are cached in **localStorage** keyed by sorted item IDs + occasion (`wardrobe_viz_v2_` prefix) to avoid redundant generation.
- This path is not currently wired into the default UI flow but the infrastructure is in place.

---

## 9. History & Recency Loop

When a user taps **"I wore this"** on an outfit card:

```
OutfitCard → handleWoreThis()
  → Firestore: users/{userId}/outfitHistory/{autoId}
    { item_ids, occasion, explanation, created_date }
  → load() re-fetches history
  → Next generateOutfits() call reads updated history
    → Recency rule deprioritises recently worn pairs
```

This closes the feedback loop: the more you log, the better the next suggestions avoid repetition.

---

## 10. Firestore Data Model (Summary)

```
users/
  {userId}/
    clothingItems/
      {itemId} → see Section 5 schema
    outfitHistory/
      {entryId}:
        item_ids:     string[]   // IDs of ClothingItems in the outfit
        occasion:     string
        explanation:  string
        created_date: ISO 8601 string
```

All reads are `getDocs` (one-shot fetches on mount). There are no real-time listeners (`onSnapshot`) in the current implementation — the app re-fetches after every mutation via the `load()` callback pattern.
