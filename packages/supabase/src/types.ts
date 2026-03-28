// packages/supabase/src/types.ts
// All database types in one place.
// Update these as your schema evolves.

export type Role = 'job_seeker' | 'job_poster'

export type Profile = {
  id:         string
  role:       Role | null
  full_name:  string | null
  email:      string | null
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
  // joined
  skill?:            Skill
}

export type Experience = {
  id:           string
  user_id:      string
  company_name: string
  role:         string
  start_date:   string | null
  end_date:     string | null        // null = current
  description:  string | null
  created_at:   string
  // joined
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
  // joined
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

export type JobListing = {
  id:          string
  poster_id:   string
  title:       string
  description: string | null
  location:    string | null
  is_remote:   boolean
  salary_min:  number | null
  salary_max:  number | null
  status:      'open' | 'closed' | 'draft'
  created_at:  string
  updated_at:  string
  // joined
  poster?:     JobPoster
  skills?:     (Skill & { required: boolean })[]
}

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
  rating:         number | null        // 1–5
  decision:       'hire' | 'reject' | 'pending' | null
  created_at:     string
  // joined
  candidate?:     Profile
  interviewer?:   Profile
  listing?:       JobListing
}

export type Message = {
  id:         string
  room_id:    string
  sender_id:  string | null
  content:    string
  created_at: string
  // joined
  sender?:    Profile
}

// Full job seeker profile with all relations
export type JobSeekerFull = JobSeeker & {
  profile:        Profile
  skills:         JobSeekerSkill[]
  experiences:    Experience[]
  education:      Education[]
  projects:       Project[]
  certifications: Certification[]
}