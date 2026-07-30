# AI Wardrobe Assistant

This is an AI-powered wardrobe assistant that helps you organize your clothes, get outfit suggestions based on the occasion, and visualize those outfits on a mannequin.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, shadcn/ui
- Backend: Firebase (Auth, Firestore, Storage) for data and auth.
- AI APIs: Vercel Serverless Functions using the `@google/genai` SDK for Gemini API calls.

## Setup

1. Copy `.env.example` to `.env` and fill in your Firebase and Gemini API keys.
2. Run `npm install`
3. Run `npm run dev` to start the local development server.

## Deployment

Deploy this project on Vercel:
1. Connect your GitHub repository to Vercel.
2. Add your environment variables (Firebase + Gemini API key).
3. Vercel will automatically build the frontend and deploy the `api/` directory as serverless functions.
