# 🚀 Job Portal + Interview Platform

A full-stack job portal with real-time chat, video interviews, and AI-powered resume analysis.

---

## ✨ Features

### 👨‍💼 Job Seeker
- Browse jobs
- Apply to jobs
- Track applications
- Chat with recruiters
- Join video interviews
- Upload resume → OCR → AI analysis

### 🏢 Job Poster
- Create job listings
- View applicants
- Start chat with candidates
- Schedule & conduct interviews

### 💬 Communication
- Real-time chat (Supabase Realtime)
- One conversation per application

### 🎥 Interviews
- LiveKit-powered video calls
- Interview lobby + status tracking

### 🤖 AI Resume
- OCR pipeline (PDF, image, docx)
- Gemini API integration
- Auto-fill profile data

---

## 🏗️ Architecture

- Monorepo setup
- apps/mobile → main app (Expo web)
- packages/supabase → DB queries + types
- packages/features → OCR, AI, LiveKit logic
- packages/ui → design system

---

## 🔑 Core Concept

Everything is tied to:

applicationId

Used for:
- Chat → room_id = app_${applicationId}
- Interview → room_name = app_${applicationId}

---

## 🔐 Auth & Routing

- Centralized in _layout.tsx
- Handles:
  - auth
  - onboarding
  - role-based routing

---

## ⚙️ Tech Stack

- React Native (Expo + Web)
- Supabase (Auth, DB, Realtime)
- LiveKit (video)
- Gemini API (AI)
- Tailwind / NativeWind

---

## 🧪 Run Locally

yarn install  
cd apps/mobile 
npx expo start
---

## 🔐 Environment Variables

EXPO_PUBLIC_SUPABASE_URL=  
EXPO_PUBLIC_SUPABASE_ANON_KEY=  
LIVEKIT_API_KEY=  
LIVEKIT_API_SECRET=  

---

## 🧪 Core Flow

- Signup → onboarding  
- Poster creates job  
- Seeker applies  
- Poster views applicants  
- Chat starts  
- Interview starts  
- Video call  
- End interview  

---

## 📦 Status

### Completed
- Jobs + applications
- Chat system
- Interview system
- OCR + AI pipeline
- Realtime updates

### In Progress
- Full flow testing
- Metadata + production setup

### Planned
- Loading skeletons
- UI system cleanup
- Design polish

---

## 💥 Note

This project combines:
- realtime systems
- video communication
- AI processing

→ making it a strong full-stack system foundation