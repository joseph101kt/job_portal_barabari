# 🎤 Interview Package

Connects database (Supabase) with LiveKit video calls.

---

## 📁 Structure

interview/
 ┣ call.tsx
 ┣ call.web.tsx
 ┣ scheduleInterview.tsx
 ┣ InterviewCard.tsx
 ┗ index.ts

---

## 🎯 Purpose

- Bridge interviews table with LiveKit rooms
- Handle interview scheduling and joining
- Provide UI for interview actions

---

## 🔑 Core Concept

roomName = app_${applicationId}

Used for:
- Interview DB entry
- LiveKit room connection

---

## 🔄 Flow

1. Schedule interview → create DB entry  
2. Navigate to lobby  
3. Join → connect to LiveKit  
4. End → update interview status  

---

## 🧩 Components

- call / call.web → video call screens  
- scheduleInterview → creates interview  
- InterviewCard → UI for interview actions  

---

## 🧠 Notes

- Uses shared roomName with chat
- Syncs DB state with call lifecycle
- Works with LiveKit + Supabase

---