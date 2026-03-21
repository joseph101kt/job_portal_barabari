// supabase/functions/analyze/prompts.ts
//
// Gemini responds well to explicit JSON structure instructions.
// responseMimeType: 'application/json' in the API call enforces JSON,
// but being explicit in the prompt improves field accuracy.

export const PROMPTS = {

  medical_report: (text: string) => `
You are a medical document analyzer. Extract all information from the medical report text below.

MEDICAL REPORT TEXT:
${text}

Return a JSON object with EXACTLY this structure. Use empty string "" for missing fields, empty array [] for missing lists:
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
  "summary": "2-3 sentence plain English summary of the patient health status",
  "riskLevel": "low",
  "riskFactors": [""]
}

Important rules:
- riskLevel must be exactly one of: "low", "medium", "high"
- Do not invent any data not present in the text
- Do not include any explanation outside the JSON
`,

  resume: (text: string) => `
You are a resume analyzer for a job recruitment portal. Extract all information from the resume text below.

RESUME TEXT:
${text}

Return a JSON object with EXACTLY this structure. Use empty string "" for missing fields, empty array [] for missing lists:
{
  "candidate": {
    "name": "",
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "2-3 sentence candidate overview",
  "skills": [""],
  "experienceLevel": "mid",
  "yearsExperience": 0,
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "highlights": [""]
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "year": ""
    }
  ],
  "strengths": [""],
  "gaps": [""],
  "suggestions": [""]
}

Important rules:
- experienceLevel must be exactly one of: "junior", "mid", "senior", "lead"
- yearsExperience must be a number
- strengths: max 5 items — what makes this candidate strong
- gaps: max 5 items — missing skills or experience worth noting
- suggestions: max 5 items — actionable resume improvements
- Do not invent any data not present in the text
- Do not include any explanation outside the JSON
`,

  summarize: (text: string, context?: string) => `
Summarize the following document text.${context ? ` Context about this document: ${context}.` : ''}

DOCUMENT TEXT:
${text}

Return a JSON object with EXACTLY this structure:
{
  "summary": "2-3 sentence overview of the document",
  "keyPoints": [""],
  "wordCount": 0
}

Important rules:
- keyPoints: 3-7 most important points from the document
- wordCount: the number of words in the original document text
- Do not include any explanation outside the JSON
`,

}