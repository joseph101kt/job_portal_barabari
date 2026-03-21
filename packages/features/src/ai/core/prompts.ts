// packages/features/src/ai/core/prompts.ts
//
// All prompts live here so they're easy to tune without touching logic files.
// Each prompt instructs OpenAI to return ONLY valid JSON — no markdown, no preamble.

export const PROMPTS = {

  medical_report: (text: string) => `
You are a medical document analyzer. Extract all information from the following medical report text.

MEDICAL REPORT TEXT:
${text}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "patientInfo": {
    "name": "",
    "dob": "",
    "age": "",
    "gender": "",
    "height": "",
    "weight": "",
    "bmi": ""
  },
  "vitals": {
    "bloodPressure": "",
    "cholesterol": "",
    "a1c": "",
    "glucose": "",
    "hdl": "",
    "lastVisit": ""
  },
  "conditions": [
    { "name": "", "date": "", "notes": "" }
  ],
  "familyHistory": [
    { "relation": "", "age": "", "status": "", "cause": "" }
  ],
  "medications": [
    { "name": "", "dose": "", "frequency": "" }
  ],
  "summary": "2-3 sentence plain English summary of the patient's health status",
  "riskLevel": "low",
  "riskFactors": []
}

Rules:
- riskLevel must be exactly "low", "medium", or "high"
- Use empty string "" for any field not found in the text
- Use empty array [] for any list not found in the text
- Do not invent information not present in the text
`,

  resume: (text: string) => `
You are a resume analyzer for a job portal. Extract all information from the following resume text.

RESUME TEXT:
${text}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "candidate": {
    "name": "",
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "2-3 sentence candidate overview",
  "skills": [],
  "experienceLevel": "mid",
  "yearsExperience": 0,
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "highlights": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "year": ""
    }
  ],
  "strengths": [],
  "gaps": [],
  "suggestions": []
}

Rules:
- experienceLevel must be exactly "junior", "mid", "senior", or "lead"
- yearsExperience must be a number (estimate if not explicit)
- strengths: what makes this candidate strong (max 5)
- gaps: missing skills or experience worth noting (max 5)
- suggestions: actionable resume improvements (max 5)
- Do not invent information not present in the text
`,

  summarize: (text: string, context?: string) => `
Summarize the following document text concisely.
${context ? `Context: ${context}` : ''}

DOCUMENT TEXT:
${text}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "summary": "2-3 sentence overview of the document",
  "keyPoints": [],
  "wordCount": 0
}

Rules:
- keyPoints: 3-7 most important points from the document
- wordCount: count of words in the original document text
`,

} as const