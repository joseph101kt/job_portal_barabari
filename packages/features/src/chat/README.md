# 💬 Chat Package

Realtime chat system using Supabase.

---

## 📁 Structure

chat/
 ┣ chat.tsx
 ┣ ChatSection.tsx
 ┣ sidebar.tsx
 ┗ index.tsx

---

## 🎯 Purpose

- Enable real-time messaging
- Connect users per application
- Sync chat with interview flow

---

## 🔑 Core Concept

roomId = app_${applicationId}

---

## 🔄 Flow

1. Open chat with applicationId  
2. Load messages (roomId)  
3. Send message  
4. Realtime updates via Supabase  

---

## 🧩 Components

- chat → main chat screen  
- ChatSection → message list + input  
- sidebar → conversation list  

---

## 🧠 Notes

- Uses Supabase Realtime
- One room per application
- Supports optimistic UI

---