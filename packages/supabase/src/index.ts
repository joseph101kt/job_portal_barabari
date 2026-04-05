// packages/supabase/src/index.ts

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
  getListings,
  getOpenListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  addListingSkills,
  recordJobView,
  getJobViewCount,
} from './queries/jobs'

export {
  applyToJob,
  getMyApplications,
  hasApplied,
  withdrawApplication,
  getApplicationsForListing,
  updateApplicationStatus,
  getApplicationStats,
} from './queries/applications'

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


export * from './queries/chat'

export * from './queries/resume'

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
  EmploymentType,
  ExperienceLevel,
  ListingStatus,
  JobListing,
  ApplicationStatus,
  Application,
  JobView,
  Interview,
  Message,
  JobSeekerFull,
  normalizeCreateJobListing,
  validateCreateJobListing,
} from './types'