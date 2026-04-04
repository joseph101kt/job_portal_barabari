// supabase/functions/analyze/prompts.ts

export const PROMPTS = {

  resume: (text: string, availableSkills: string[] = []) => {
    const skillsContext = availableSkills.length > 0
      ? `KNOWN SKILLS (use exact names when they match): ${availableSkills.join(', ')}\n`
      : ''

    return `You are a resume parser. Extract structured data from the resume text below.
${skillsContext}
RESUME TEXT:
${text}

Return ONLY a valid JSON object matching this schema exactly.
No markdown, no backticks, no explanation. Must parse with JSON.parse().

SCHEMA:
{
  "candidate": { "name": "", "email": "", "phone": "", "location": "" },
  "headline": "",
  "bio": "",
  "experienceLevel": "fresher",
  "yearsExperience": 0,
  "skills": [{ "name": "", "category": "" }],
  "experience": [{
    "company": "", "role": "", "startDate": "", "endDate": "",
    "isCurrent": false, "description": "", "skills": []
  }],
  "education": [{
    "institution": "", "degree": "", "fieldOfStudy": "",
    "startDate": "", "endDate": "", "isCurrent": false
  }],
  "projects": [{ "title": "", "description": "", "skills": [], "url": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }],
  "strengths": [],
  "gaps": [],
  "suggestions": []
}

RULES:

OUTPUT:
- Return ONLY valid JSON. All keys must be present.
- Missing string → ""  |  Missing number → 0  |  Missing array → []  |  Missing boolean → false
- projects and certifications MUST be arrays, NEVER null, NEVER an object

FIELDS:
- headline: max 120 chars
- bio: 2–3 sentences, first person
- experienceLevel: exactly one of "fresher" | "junior" | "mid" | "senior"
  (fresher = student/<1yr, junior = 1-2yr, mid = 2-5yr, senior = 5+yr)
- yearsExperience: total years, internships count as 0.5 per 6 months
- skills[].category: exactly one of "frontend"|"backend"|"mobile"|"devops"|"data"|"design"|"management"|"other"
- Dates: experience → "YYYY-MM" or "", education → "YYYY" or "", certifications → "YYYY-MM" or ""
- isCurrent: true → endDate MUST be ""
- strengths, gaps, suggestions: max 4 items each

PROJECTS — extract anything that was built/created/developed:
- Includes: academic projects, personal projects, freelance, capstone, GitHub work
- Trigger words: built, developed, created, designed, implemented, worked on
- No "Projects" heading required — infer from context

CERTIFICATIONS — extract any course, training, or credential completed:
- Includes: Coursera, Udemy, AWS, Google, Harvard, HubSpot, any online platform
- Trigger words: certified, completed, certificate, course, training, bootcamp
- No "Certifications" heading required — infer from context

IMPORTANT: Over-classify rather than under-classify. Never skip a likely project or certification.`.trim()
  },

  summarize: (text: string, context?: string) => `
Summarize the following document.${context ? ` Context: ${context}.` : ''}

DOCUMENT TEXT:
${text}

Return a JSON object with EXACTLY this structure:
{
  "summary": "",
  "keyPoints": [],
  "wordCount": 0
}

Rules:
- summary: 2–3 sentence overview
- keyPoints: 3–7 most important points
- wordCount: number of words in the original text
- Return ONLY valid JSON, no markdown, must parse with JSON.parse()
`.trim(),
}