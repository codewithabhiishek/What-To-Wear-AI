# What To Wear AI - Architecture & Logic

This document explains the technical architecture, data flow, and outfit scoring logic for the **What To Wear AI** application. It serves as a comprehensive guide for AI agents and developers working on the codebase.

## 1. Tech Stack
- **Frontend Framework**: React (built with Vite)
- **Styling & UI**: Tailwind CSS, Framer Motion (for animations), Lucide React (icons), and shadcn/ui components
- **Backend / API**: Vercel Serverless Functions (`/api/*`)
- **Database & Auth**: Firebase (Authentication and Firestore database)
- **File Storage**: Vercel Blob (for storing user-uploaded clothing photos)
- **AI Engine**: Hybrid Approach
  - **GitHub Models** (`gpt-4o`): Used for image analysis and automatic clothing tagging because of its superior vision capabilities and free access.
  - **Groq SDK** (`llama-3.3-70b-versatile`): Used for generating natural language explanations of why an outfit works.

## 2. Data Flow & Storage Lifecycle
How a clothing item is processed and saved by the user:

1. **Photo Upload**: The user uploads an image via `UploadItemDialog.jsx`. The file is sent directly to `/api/upload-photo` which stores it in **Vercel Blob** and returns a public URL.
2. **AI Tagging**: The image URL is passed to `/api/tag-clothing-item`. The Groq Vision model analyzes the image and returns a strict JSON object mapping 6 specific attributes:
   - `category` (top, bottom, shoes, outerwear, accessory)
   - `color_primary` and `color_secondary`
   - `pattern` (solid, striped, printed, etc.)
   - `fit` (fitted, regular, oversized)
   - `formality` (scale of 1-5)
   - `season` (summer, winter, all-season)
3. **User Review**: The user is presented with the AI's tags in the UI. They can manually adjust any incorrect tags before saving.
4. **Database Storage**: Upon confirmation, the item data (and image URL) is saved to **Firebase Firestore** under the path: `users/{userId}/clothingItems`.

## 3. Outfit Scoring Engine
The outfit recommendation logic lives in `src/lib/outfitScoring.js`. It runs entirely on the client side (for zero-latency generation) before fetching AI explanations.

### Combination Generation
- The engine splits the user's wardrobe into categories (`tops`, `bottoms`, `shoes`, `outerwear`).
- It builds all possible base combinations (`top + bottom + shoes`). If the user owns no shoes, it gracefully degrades to `top + bottom`.
- It then appends optional `outerwear` combinations.

### Scoring Logic (0-100 scale)
Each generated combination is scored out of 100 based on 5 weighted rules:

1. **Formality Match (30% Weight)**: 
   - Calculates the average formality (1-5 scale) of the outfit.
   - Penalizes if items inherently clash with each other (e.g., a spread > 1 point).
   - Penalizes if the outfit's average formality falls outside the target range for the user's chosen `occasion` (e.g., "wedding" vs "casual").
2. **Silhouette Balance (25% Weight)**: 
   - Ensures visual proportions work. 
   - "Oversized top + Fitted bottom" (or vice versa) scores `100`.
   - "Oversized top + Oversized bottom" clashes and scores `45`.
3. **Color Harmony (20% Weight)**: 
   - Limits bold/saturated colors. 
   - A combo with 0 or 1 bold color (paired with neutrals like black, white, gray, navy) scores `100`. Two bold colors score `50`.
4. **Variety / Recency (15% Weight)**: 
   - Reads the user's `outfitHistory` from Firebase. 
   - Penalizes combinations where pairs of items were worn together in the last 7 days (`RECENT_PAIR_PENALTY`).
   - Gives a small point boost (`STALE_ITEM_BOOST`) to items that haven't been worn in 14+ days.
5. **Pattern Clash (10% Weight)**: 
   - Ensures no more than one patterned item per outfit. Two patterns score `50`, three score `20`.

Combinations scoring below `60/100` (`MIN_SCORE`) are discarded. The top 5 highest-scoring outfits are passed to the next step.

## 4. AI Outfit Explanations
For the top 5 outfits, the app sends a lightweight text prompt to `/api/generate-outfit-explanation` containing the item descriptions (color, fit, pattern, formality) and the requested occasion. 

Groq (Llama 3.3) responds with a concise, one-sentence natural explanation of *why* the outfit works. Example: *"The oversized green top pairs perfectly with the fitted black jeans for a balanced, casual silhouette."*

## 5. History Logging
When a user clicks **"I wore this!"** on an outfit card:
- The outfit's `item_ids`, `occasion`, and `explanation` are logged in Firestore under `users/{userId}/outfitHistory`. 
- This data feeds directly back into the Recency Score to prevent the app from suggesting the exact same outfit the following week.
