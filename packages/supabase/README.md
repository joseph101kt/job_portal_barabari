# 🧠 Supabase Package

Centralized database layer for the Job Portal app.

Handles:
- Supabase client setup
- Typed queries
- Database types

---

## 📁 Structure

supabase/
 ┣ src/
 ┃ ┣ queries/
 ┃ ┃ ┣ applications.ts
 ┃ ┃ ┣ chat.ts
 ┃ ┃ ┣ interviews.ts
 ┃ ┃ ┣ jobs.ts
 ┃ ┃ ┣ messages.ts
 ┃ ┃ ┣ profiles.ts
 ┃ ┃ ┗ resume.ts
 ┃ ┣ client.ts
 ┃ ┣ index.ts
 ┃ ┗ types.ts

---

## 🔑 Responsibilities

- Provide a single Supabase client
- Encapsulate all database queries
- Enforce type safety
- Keep API logic out of UI

---

## ⚙️ Client Setup

client.ts initializes Supabase using env variables.

Usage:

```ts
import { getSupabase } from '@my-app/supabase'

const supabase = getSupabase()
📦 Queries

All DB operations are grouped by domain:

applications → apply, fetch applications
chat → chat-related helpers
interviews → create/update interviews
jobs → job CRUD
messages → send/fetch messages
profiles → user profiles
resume → resume + OCR updates
🧾 Types

types.ts contains:

DB types
Table definitions
Shared interfaces
📌 Usage Pattern
import { getSupabase } from '@my-app/supabase'

const supabase = getSupabase()

const { data, error } = await supabase
  .from('jobs')
  .select('*')
🧠 Rules
Do not call Supabase directly from UI
Always go through query functions
Keep queries small and focused
Handle errors properly
🔐 Notes
Respects DB constraints (unique, foreign keys)
Designed for application-based chat system
Used across mobile + web
