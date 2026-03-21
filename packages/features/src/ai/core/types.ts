// packages/features/src/ai/core/types.ts

// ── Request ───────────────────────────────────────────────────────────────────

export type AnalysisType =
  | 'medical_report'
  | 'resume'
  | 'summarize'

export type AnalysisRequest =
  | { type: 'medical_report'; text: string }
  | { type: 'resume';         text: string }
  | { type: 'summarize';      text: string; context?: string }

// ── Response shapes ───────────────────────────────────────────────────────────

export type MedicalReportResult = {
  patientInfo: {
    name:    string
    dob:     string
    age:     string
    gender:  string
    height:  string
    weight:  string
    bmi:     string
  }
  vitals: {
    bloodPressure: string
    cholesterol:   string
    a1c:           string
    glucose:       string
    hdl:           string
    lastVisit:     string
  }
  conditions:    { name: string; date: string; notes: string }[]
  familyHistory: { relation: string; age: string; status: string; cause: string }[]
  medications:   { name: string; dose: string; frequency: string }[]
  summary:       string
  riskLevel:     'low' | 'medium' | 'high'
  riskFactors:   string[]
}

export type ResumeResult = {
  candidate: {
    name:     string
    email:    string
    phone:    string
    location: string
  }
  summary:         string
  skills:          string[]
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead'
  yearsExperience: number
  experience: {
    company:   string
    role:      string
    duration:  string
    highlights: string[]
  }[]
  education: {
    institution: string
    degree:      string
    year:        string
  }[]
  strengths:       string[]
  gaps:            string[]
  suggestions:     string[]
}

export type SummaryResult = {
  summary:    string      // 2-3 sentence overview
  keyPoints:  string[]   // bullet points
  wordCount:  number     // of original text
}

// ── Union result ──────────────────────────────────────────────────────────────

export type AnalysisResult =
  | { type: 'medical_report'; data: MedicalReportResult }
  | { type: 'resume';         data: ResumeResult }
  | { type: 'summarize';      data: SummaryResult }

// ── Edge Function envelope ───────────────────────────────────────────────────

export type EdgeRequest = {
  type: AnalysisType
  text: string
  context?: string
}

export type EdgeResponse =
  | { success: true;  result: AnalysisResult }
  | { success: false; error: string }