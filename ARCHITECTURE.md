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
| Image Pre-Processing | `heic2any` (iPhone HEIC/HEIF conversion), Canvas EXIF orientation & 1400px downscaling |
| Background removal | `@imgly/background-removal` (runs fully in the browser, WASM) |

---

## 2. Project File Structure

```
what-to-wear-ai/
├── api/                          # Vercel serverless functions
│   ├── upload-photo.js           # Streams upload → Vercel Blob, returns public URL
│   ├── tag-clothing-item.js      # NVIDIA Vision → structured JSON tags
│   ├── generate-outfit-explanation.js  # NVIDIA text → short natural outfit rationale
│   └── visualize-outfit.js       # Returns a Pollinations.ai image URL for the outfit
│
├── src/
│   ├── api/
│   │   └── firebaseClient.js     # Firebase app init; exports `auth` and `db`
│   ├── lib/
│   │   ├── AuthContext.jsx       # Auth state (onAuthStateChanged), logout helper
│   │   ├── ThemeProvider.jsx     # Light / dark / system theme via localStorage
│   │   ├── outfitScoring.js      # Client-side outfit combination & additive/subtractive scoring engine
│   │   ├── imageUtils.js         # HEIC conversion, EXIF orientation, downscaling & timing logs
│   │   ├── visualizeOutfit.js    # Outfit image prompt builder + localStorage cache
│   │   ├── wardrobeConstants.js  # Occasions with icons, category/pattern/fit/season/formality enums
│   │   ├── authReturnTo.js       # Safe same-origin ?returnTo= resolution
│   │   ├── query-client.js       # Shared TanStack QueryClient instance
│   │   ├── utils.js              # `cn()` (clsx + tailwind-merge)
│   │   └── PageNotFound.jsx      # 404 fallback page
│   ├── pages/
│   │   ├── Closet.jsx            # Browse, search, category filter, sort, upload, edit, delete items
│   │   ├── WhatToWear.jsx        # Generate & display ranked outfit suggestions with loading checklist
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
│   │       ├── UploadItemDialog.jsx  # Multi-stage upload → pre-resize → bg removal → tag → save
│   │       ├── EditItemDialog.jsx    # Fix AI tags on an existing item
│   │       ├── TagEditor.jsx         # Inline form for all 7 clothing attributes
│   │       ├── OccasionSelector.jsx  # Chip picker with emoji icons + free-text for occasion
│   │       ├── OutfitCard.jsx        # Pixel-perfect standardized outfit card with match badge
│   │       ├── OutfitDetailDialog.jsx# Click-to-expand modal for high-res preview & full breakdown
│   │       ├── OutfitMedia.jsx       # Tab switcher: flat-lay moodboard vs. on-mannequin
│   │       ├── PremiumMoodboard.jsx  # Editorial 4/5 flat-lay grid using real item photos with hover scaling
│   │       ├── MannequinOutfit.jsx   # Minimalist fashion SVG mannequin silhouette (4/5 ratio)
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

## 5. Optimized Clothing Upload Pipeline (`src/lib/imageUtils.js` & `UploadItemDialog.jsx`)

How a clothing item goes from a camera photo (e.g. iPhone HEIC/HEIF or 12MP JPEG) → Firestore:

```
1. User opens UploadItemDialog & selects photo
   └─ PHASE: PREPARING
      ├── HEIC/HEIF Conversion: Dynamic import of heic2any converts camera files to JPEG Blob.
      ├── EXIF Orientation: createImageBitmap({ imageOrientation: "from-image" }) corrects rotation.
      └── Pre-Resize: Downscales 12MP (4032x3024) photo to max 1400px longest side.
          (Reduces pixel count by 88%, accelerating background removal by 10x).

2. Pre-resized Blob → Client-Side Background Removal
   └─ PHASE: PROCESSING_BG
      @imgly/background-removal processes 1400px JPEG in WebAssembly.
      ├── Timeout Protection: 30-second AbortController safeguard.
      └── Fallback: On timeout/failure, automatically falls back to clean pre-resized JPEG.

3. Processed Photo → POST /api/upload-photo
   └─ PHASE: UPLOADING
      Vercel Blob stores the image, returns a public HTTPS URL.

4. Image URL → POST /api/tag-clothing-item
   └─ PHASE: TAGGING
      NVIDIA Vision (llama-3.2-90b) downloads image, returns JSON tags:
      { category, color_primary, color_secondary, pattern, fit, formality, material, season }

5. User reviews & corrects tags in TagEditor
   └─ PHASE: EDITING

6. Confirmed → Firestore: users/{userId}/clothingItems/{autoId}
   └─ PHASE: SAVING
```

### 5.1 Performance Timing Audit
Every upload step prints elapsed milliseconds to browser console:
```text
[Upload Audit] Image decode & resize completed in 85ms: 4032x3024 -> 1400x1050
[Upload Audit] Background removal completed in 1180ms
[Upload Audit] Vercel Blob upload completed in 390ms
[Upload Audit] AI Tagging API completed in 720ms
```

---

## 6. Outfit Scoring Engine (`src/lib/outfitScoring.js`)

Runs entirely on the client — no server round-trip — so suggestions appear instantly before AI explanations arrive.

### 6.1 Combination Generation

1. Split wardrobe into: `tops`, `bottoms`, `shoes`, `outerwears`.
2. Build all `top × bottom × shoe` combos. If the user owns no shoes, degrade gracefully to `top × bottom`.
3. For each base combo, also generate versions that include each `outerwear` piece.

### 6.2 Scoring Rules (weights sum to 1.0)

| # | Rule | Weight | How it works |
|---|---|---|---|
| 1 | **Formality match** | 30% | Formality of items must fall inside the occasion's target range. Large spreads (>1 point) incur heavy penalties. |
| 2 | **Silhouette balance** | 25% | Oversized top + fitted bottom (or vice versa) → 100. Double oversized fits incur heavy penalties (`20`). |
| 3 | **Color harmony** | 20% | ≤ 1 bold color → 100. Two bold colors → 40. Three+ → 10. Neutrals (black, white, grey, navy, beige…) never count as bold. |
| 4 | **Variety / recency** | 15% | Pairs worn together in the last 7 days are heavily penalised (`RECENT_PAIR_PENALTY = 50`). Unworn items get a rotation boost. |
| 5 | **Pattern clash** | 10% | ≤ 1 patterned item → 100. Multiple patterns incur heavy penalties (`10`). |

- **`MIN_SCORE = 40`** — combos below this are discarded.
- **`MAX_RESULTS = 5`** — top 5 results are returned. `generateOutfits` attaches `totalCount` to the array so the UI can render *"Found X combinations • Showing top 5 matches"*.

---

## 7. UI Standardization & Modals

### 7.1 Uniform Recommendation Grid
- **Responsive Breakpoints:** 1 column on mobile, 2 on tablet, 3 on desktop (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- **Fixed Section Heights:** Cards enforce a fixed 40px explanation box (`line-clamp-2`), fixed badge row (`h-6`), and pinned button baseline (`h-8`). Cards are 100% pixel-perfect identical.
- **Click-to-Expand Modal (`OutfitDetailDialog.jsx`):** Clicking any recommendation card opens a modal with a high-res preview, untruncated style rationale, and garment attribute badges.

### 7.2 Closet Search & Filtering (`Closet.jsx`)
- **Real-Time Search:** Search wardrobe by color, category, pattern, or material.
- **Category Filter Pills:** Quick toggle between *All*, *Tops*, *Bottoms*, *Shoes*, and *Outerwear*.
- **Sorting:** Sort items by *Newest*, *Formality*, or *Category*.

---

## 8. Recommended Free APIs for Project Enhancement

To take **What To Wear AI** even further without incurring costs:

### 8.1 Weather Integration (OpenWeatherMap or WeatherAPI)
- **Use Case:** Fetch local weather via browser geolocation, feeding temperature into `outfitScoring.js`.
- **Enhancement:** Boost `season: "winter"` items when cold, or mandate `outerwear` if raining.
- **Free Tier:** OpenWeatherMap offers 1,000 free API calls/day.

### 8.2 Precise Color Palette Analysis (TheColorAPI / Cloudinary)
- **Use Case:** Extract exact HEX codes from garment images instead of single color string labels.
- **Enhancement:** Calculate exact complementary or triadic color harmonies mathematically.
- **Free Tier:** TheColorAPI is 100% free.

### 8.3 Style Inspiration (Unsplash API)
- **Use Case:** Search for real-world outfit lookbooks matching the user's item combinations.
- **Enhancement:** Shows a "See it in the wild" moodboard next to outfit suggestions.
- **Free Tier:** 50 requests/hour free.
