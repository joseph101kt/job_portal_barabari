TODO LIST:

PHASE 1 — Foundation (do today)
  1.1  Create new Supabase project for job portal
  1.2  Run job_portal_001.sql schema
  
  1.3  Test auth signup → auto profile creation trigger works
  1.4  Create new Edge Function (resume analyzer only, no medical)
  1.5  Test resume analysis end to end via PowerShell

PHASE 2 — Core features (next session)
  2.1  Auth screens (signup with role picker, login)
  2.2  Candidate: resume upload screen → OCR/DOCX extract → AI analyze → save to attributes
  2.3  Interviewer: candidate list screen (reads profiles + attributes)
  2.4  Interview scheduling (create interviews row, generate LiveKit room name)
  2.5  LiveKit call screen (join by room_name from interviews table)
  2.6  Post-call: interviewer fills feedback + rating + decision

PHASE 3 — Next.js (timebox 3 hours)
  3.1  Create apps/web/ with Next.js
  3.2  Wire same Supabase client (different env vars)
  3.3  Web-only pages: landing, candidate dashboard, interviewer dashboard
  3.4  Reuse packages/features for AI + document logic
  3.5  If it breaks badly after 2hrs → ship mobile only, move on

PHASE 4 — Polish + Electron (if time allows)
  4.1  Electron: copy apps/web/, add electron wrapper, client-only build
  4.2  No SSR pages needed — Electron is always client-side
  4.3  Try supabase O-AUTH

PHASE 5 — Submit
  5.1  Clean up, README, demo recording
  5.2  Git tag v1.0
  5.3  Clone → strip → template branch