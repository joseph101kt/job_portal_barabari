# 🎥 LiveKit Package

Video interview system built on LiveKit.

Handles:
- Room connection
- Token generation
- Participant management
- Cross-platform video calls (web + native)

---

## 📁 Structure

livekit/
 ┣ core/
 ┃ ┣ config.ts
 ┃ ┣ tokenService.ts
 ┃ ┣ types.ts
 ┃ ┗ index.ts
 ┣ native/
 ┃ ┣ useRoom.ts
 ┃ ┣ permissions.ts
 ┃ ┗ index.ts
 ┣ web/
 ┃ ┣ useRoom.ts
 ┃ ┗ index.ts
 ┣ ui/
 ┃ ┣ CallControls.tsx
 ┃ ┣ ParticipantTile.tsx
 ┃ ┣ ParticipantTile.web.tsx
 ┃ ┣ Icon.tsx
 ┃ ┗ index.ts
 ┗ index.ts

---

## 🎯 Purpose

- Enable real-time video interviews
- Manage room lifecycle
- Provide reusable call UI components

---

## 🔑 Core Concept

Room name is standardized:

roomName = app_${applicationId}

Used for:
- Interview sessions
- Chat + call consistency

---

## ⚙️ Core Modules

### core/
- config → LiveKit configuration
- tokenService → generates access tokens
- types → shared types

---

### native/
- useRoom → manages room connection (mobile)
- permissions → camera/mic permissions

---

### web/
- useRoom → manages room connection (web)

---

### ui/
- CallControls → mute, video, leave buttons
- ParticipantTile → video/audio rendering
- Icon → shared icons

---

## 🔌 Usage

```ts
import { useRoom } from '@my-app/livekit'

const { connect, disconnect, participants } = useRoom()
🔐 Token Flow
Client requests token
tokenService generates token using roomName
Client connects to LiveKit room
🎥 Call Flow
Enter interview lobby
Join → connect to room
Participants join
Call controls (mute/video/leave)
End call → disconnect
🧠 Notes
Cross-platform (web + native)
Uses same roomName across system
Integrated with interview lifecycle
Handles reconnect and edge cases