# Karigar AI - Hackathon Prototype

**Karigar AI** is an AI-driven market linkage and smart cataloging mobile application built for marginalized artisans, empowering them to transition into digital commerce with zero technical literacy required.

## Problem Addressed

Marginalized artisans struggle with entering digital commerce due to low digital literacy, language barriers, poor product photography skills, and difficulty writing product descriptions.

## Solution

Karigar AI acts as a **"Virtual Business Manager"**, allowing an artisan to:
1. Photograph a product (AI cleans up the image).
2. Describe it using voice in their own language.
3. Automatically generate a professional catalog listing (Title, Description, Pricing).
4. Connect with B2B buyers via a simple discovery interface.

## Tech Stack
- **Frontend**: React Native, Expo, Nativewind (TailwindCSS), Zustand.
- **Backend**: Node.js, Express, Prisma, SQLite (easy hackathon setup, translatable to Postgres).
- **AI Integration**: Designed with `MockProvider` fallback to ensure deterministic hackathon demos without rate limit risks.

## Demo Instructions

1. Start backend:
```bash
cd apps/api
npm install
npm run dev
```

2. Start mobile frontend:
```bash
cd apps/mobile
npm install
npm run web
```

3. **Hackathon Demo Flow**:
- Select language preference in Onboarding.
- Click **"Start Judge Demo"** on the Login screen to autofill dummy data.
- Enter OTP `1234` when prompted.
- View Dashboard (Karigar Saathi tips).
- Navigate to "Add Product".
- Click "Add Photo", simulate taking a photo.
- Simulate AI Enhancement (Mock processing).
- Click the microphone for Voice Input (Mock STT).
- View the AI Generated Listing with pricing and descriptions.
- Publish (or save as Offline Draft).
- Switch to "Buyers" tab to see interested businesses.
- Navigate to Karigar Saathi for a chat assistant.
