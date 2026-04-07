# 🤖 AI Package

Handles resume analysis using external AI (Gemini).

---

## 📁 Structure

ai/
 ┣ core/
 ┃ ┣ analyzeClient.ts
 ┃ ┣ types.ts
 ┃ ┣ useAnalysis.ts
 ┃ ┗ useAnalyzeDocument.ts
 ┗ index.ts

---

## 🎯 Purpose

- Send OCR output to AI
- Extract structured data
- Return profile-ready information

---

## 🔌 Usage

```ts
import { useAnalyzeDocument } from '@my-app/ai'

const { analyze } = useAnalyzeDocument()
const result = await analyze(text)

##🧠 Notes
Works after OCR pipeline
Returns structured JSON data
Used to update user profile