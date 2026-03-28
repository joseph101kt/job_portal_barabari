// packages/supabase/src/index.ts
// Public API — import everything from '@my-app/supabase'

// ── Client ────────────────────────────────────────────────────────────────────
export { initSupabase, getSupabase, supabase } from './client'

// ── Queries ───────────────────────────────────────────────────────────────────
export {
  getProfile,
  updateProfile,
  getJobSeeker,
  upsertJobSeeker,
  getJobPoster,
  upsertJobPoster,
} from './queries/profiles'

export {
  getOpenListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
} from './queries/jobs'

export {
  getMyInterviews,
  getInterviewByRoom,
  createInterview,
  updateInterview,
  startInterview,
  endInterview,
} from './queries/interviews'

export {
  getMessages,
  sendMessage,
  subscribeToMessages,
} from './queries/messages'

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  Role,
  Profile,
  JobSeeker,
  JobPoster,
  Skill,
  JobSeekerSkill,
  Experience,
  Education,
  Project,
  Certification,
  JobListing,
  Interview,
  Message,
  JobSeekerFull,
} from './types'