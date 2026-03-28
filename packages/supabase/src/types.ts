// packages/supabase/src/types.ts

export type Role = 'job_seeker' | 'job_poster'

// ── Auth / Profiles ───────────────────────────────────────────────────────────

export type Profile = {
  id:         string
  role:       Role | null
  full_name:  string | null
  avatar_url: string | null
  onboarded:  boolean
  created_at: string
}

export type JobSeeker = {
  id:           string
  headline:     string | null
  bio:          string | null
  location:     string | null
  availability: 'immediately' | '2weeks' | '1month' | 'not_looking' | null
  resume_url:   string | null
  ai_summary:   Record<string, unknown> | null
  created_at:   string
  updated_at:   string
}

export type JobPoster = {
  id:          string
  company:     string
  website:     string | null
  industry:    string | null
  description: string | null
  created_at:  string
}

// ── Skills ────────────────────────────────────────────────────────────────────

export type Skill = {
  id:         string
  name:       string
  slug:       string
  category:   string | null
  created_at: string
}

export type JobSeekerSkill = {
  id:                string
  user_id:           string
  skill_id:          string
  proficiency_level: number | null   // 1–5
  years_experience:  number | null
  last_used_at:      string | null
  created_at:        string
  skill?:            Skill
}

// ── Job seeker profile sections ───────────────────────────────────────────────

export type Experience = {
  id:           string
  user_id:      string
  company_name: string
  role:         string
  start_date:   string | null
  end_date:     string | null
  description:  string | null
  created_at:   string
  skills?:      Skill[]
}

export type Education = {
  id:             string
  user_id:        string
  institution:    string
  degree:         string | null
  field_of_study: string | null
  start_date:     string | null
  end_date:       string | null
  created_at:     string
}

export type Project = {
  id:          string
  user_id:     string
  title:       string
  description: string | null
  project_url: string | null
  github_url:  string | null
  created_at:  string
  skills?:     Skill[]
}

export type Certification = {
  id:             string
  user_id:        string
  name:           string
  issuer:         string | null
  issue_date:     string | null
  expiry_date:    string | null
  credential_url: string | null
  created_at:     string
}

// ── Job listings ──────────────────────────────────────────────────────────────

export type EmploymentType = 'internship' | 'full_time' | 'part_time' | 'contract'
export type ExperienceLevel = 'fresher' | 'junior' | 'mid' | 'senior'
export type ListingStatus   = 'open' | 'closed' | 'draft'

export type JobListing = {
  id:                   string
  poster_id:            string
  title:                string
  description:          string | null
  location:             string | null
  is_remote:            boolean
  salary_min:           number | null
  salary_max:           number | null
  employment_type:      EmploymentType | null
  experience_level:     ExperienceLevel | null
  application_deadline: string | null
  status:               ListingStatus
  created_at:           string
  updated_at:           string
  // joined
  poster?:              JobPoster
  skills?:              (Skill & { required: boolean })[]
}

// ── Applications ──────────────────────────────────────────────────────────────

export type ApplicationStatus = 'applied' | 'shortlisted' | 'rejected' | 'hired'

export type Application = {
  id:           string
  job_id:       string
  user_id:      string
  status:       ApplicationStatus
  cover_letter: string | null
  applied_at:   string
  updated_at:   string
  // joined
  job?:         JobListing
  applicant?:   Profile & { job_seeker?: JobSeeker }
}

// ── Job views ─────────────────────────────────────────────────────────────────

export type JobView = {
  user_id:   string | null
  job_id:    string
  clicked:   boolean
  viewed_at: string
}

// ── Interviews ────────────────────────────────────────────────────────────────

export type Interview = {
  id:             string
  listing_id:     string | null
  candidate_id:   string
  interviewer_id: string
  room_name:      string
  status:         'scheduled' | 'active' | 'ended' | 'cancelled'
  scheduled_at:   string | null
  started_at:     string | null
  ended_at:       string | null
  feedback:       string | null
  rating:         number | null
  decision:       'hire' | 'reject' | 'pending' | null
  created_at:     string
  // joined
  candidate?:     Profile
  interviewer?:   Profile
  listing?:       JobListing
}

// ── Messages ──────────────────────────────────────────────────────────────────

export type Message = {
  id:         string
  room_id:    string
  sender_id:  string | null
  content:    string
  created_at: string
  sender?:    Profile
}

// ── Composite ─────────────────────────────────────────────────────────────────

export type JobSeekerFull = JobSeeker & {
  profile:        Profile
  skills:         JobSeekerSkill[]
  experiences:    Experience[]
  education:      Education[]
  projects:       Project[]
  certifications: Certification[]
}