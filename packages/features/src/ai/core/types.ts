// packages/features/src/ai/core/types.ts

// ── Request ───────────────────────────────────────────────────────────────────

export type AnalysisType =
  | 'resume'
  | 'summarize'

export type AnalysisRequest =
  | { type: 'resume'; text: string }
  | { type: 'summarize'; text: string; context?: string }

// ── Resume Result (AI RAW OUTPUT) ─────────────────────────────────────────────

export type ResumeResult = {
  candidate: {
    name: string
    email: string
    phone: string
    location: string
  }

  headline: string
  bio: string

  experienceLevel: 'fresher' | 'junior' | 'mid' | 'senior'
  yearsExperience: number

  skills: {
    name: string
    category:
      | 'frontend'
      | 'backend'
      | 'mobile'
      | 'devops'
      | 'data'
      | 'design'
      | 'management'
      | 'other'
  }[]

  experience: {
    company: string
    role: string
    startDate: string
    endDate: string
    isCurrent: boolean
    description: string
    skills: string[]
  }[]

  education: {
    institution: string
    degree: string
    fieldOfStudy: string
    startDate: string
    endDate: string
    isCurrent: boolean
  }[]

  projects: {
    title: string
    description: string
    skills: string[]
    url: string
  }[]

  certifications: {
    name: string
    issuer: string
    date: string
  }[]

  strengths: string[]
  gaps: string[]
  suggestions: string[]
}

// ── Resume DB Payload (NORMALIZED FOR SUPABASE) ───────────────────────────────

export type ResumeDBPayload = {
  jobSeeker: {
    headline: string | null
    bio: string | null
    location: string | null
    ai_summary: Record<string, unknown> | null
  }

  skills: {
    name: string
    category?: string
  }[]

  experiences: {
    company_name: string
    role: string
    start_date: string | null
    end_date: string | null
    description: string | null
  }[]

  education: {
    institution: string
    degree: string | null
    field_of_study: string | null
    start_date: string | null
    end_date: string | null
  }[]

  projects: {
    title: string
    description: string | null
    project_url: string | null
  }[]

  certifications: {
    name: string
    issuer: string | null
    issue_date: string | null
  }[]
}

// ── Summary Result ────────────────────────────────────────────────────────────

export type SummaryResult = {
  summary: string
  keyPoints: string[]
  wordCount: number
}

// ── Union Result ──────────────────────────────────────────────────────────────

export type AnalysisResult =
  | { type: 'resume'; data: ResumeResult }
  | { type: 'summarize'; data: SummaryResult }

// ── Edge Function Envelope ───────────────────────────────────────────────────

export type EdgeRequest = {
  type: AnalysisType
  text: string
  context?: string
}

export type EdgeResponse =
  | { success: true; result: AnalysisResult }
  | { success: false; error: string }