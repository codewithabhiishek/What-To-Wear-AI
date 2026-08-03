# What To Wear AI
Personal styling from clothes you already own.

## Overview
What To Wear AI solves the daily struggle of deciding what to wear by acting as a digital, AI-powered personal stylist. Simply upload photos of your clothing, and the AI will automatically tag them with attributes like color, fit, formality, and season. When you need an outfit, just ask for a specific occasion, and the app will generate and rank outfit suggestions built entirely from the items you already own in your closet.

## Features
- **AI-Powered Clothing Tagging**: Automatically extracts category, color, pattern, fit, formality, material, and season from your uploaded clothing photos.
- **Occasion-Based Outfit Generation**: A scoring engine builds and ranks outfits based on formality match, silhouette balance, color harmony, variety, and pattern coordination.
- **AI Outfit Explanations**: Generates a natural-language explanation for why each outfit works well together.
- **Outfit Visualization**: Creates an anchored styled-form preview from your uploaded garment photos, alongside an editorial flat lay.
- **Outfit History Tracking**: Tracks outfits you've worn to deprioritize them in future suggestions for better rotation.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Authentication, Firestore) and Vercel Blob (File Storage)
- **AI**: NVIDIA NIM API, called via Vercel Serverless Functions (keeps the API key server-side, never exposed to the browser)
- **Deployment**: Vercel

## Getting Started

### 1. Clone and Install
```bash
git clone https://github.com/codewithabhiishek/What-To-Wear-AI.git
cd What-To-Wear-AI
npm install
cp .env.example .env
```

### 2. Environment Variables
You will need to fill in your `.env` file with credentials from Firebase and NVIDIA NIM. 
*Note: Because we use Vercel Serverless Functions for the AI endpoints, `NVIDIA_API_KEY` stays safely on the backend.*

| Variable | Description | Where to get it |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase API Key | [Firebase Console](https://console.firebase.google.com/) -> Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Firebase Console -> Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Firebase Console -> Project Settings |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | Firebase Console -> Project Settings |
| `NVIDIA_API_KEY` | NVIDIA NIM API Key | [NVIDIA Build](https://build.nvidia.com/) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Token | Vercel Dashboard -> Storage -> Blob |

### 3. Run Locally
To run the full stack locally (including the `/api` serverless functions for AI generation), use the Vercel CLI:
```bash
npx vercel dev
```
*Note: If you only run `npm run dev`, Vite will serve the frontend but the AI features will return 404s because the `/api` routes won't be processed. Always use `vercel dev` for full local testing.*

## Deployment
Deploying to Vercel is seamless:
1. Push your code to your GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import your GitHub repository.
3. Add all the environment variables from your `.env` file into the Vercel project settings.
4. Deploy! Vercel will automatically build the React frontend and serve the `api/` directory as serverless functions.

## Project Structure
- `api/` - Vercel serverless functions proxying Gemini API calls
- `src/api/` - Firebase client initialization and configuration
- `src/components/` - Reusable UI components (shadcn/ui and custom wardrobe components)
- `src/lib/` - Utility functions, outfit scoring engine, and auth context
- `src/pages/` - Core application views (Closet, WhatToWear, History, Settings, Auth)
