# 🤖 OCR Package

OCR pipeline for extracting and processing resume data from images, PDFs, and DOCX files.

---

## 📁 Structure

ocr/
 ┣ core/
 ┃ ┗ pipeline/
 ┃ ┃ ┣ document/
 ┃ ┃ ┣ docx/
 ┃ ┃ ┣ pdf/
 ┃ ┃ ┣ clean.ts
 ┃ ┃ ┣ extract.ts
 ┃ ┃ ┣ normalize.ts
 ┃ ┃ ┣ sort.ts
 ┃ ┃ ┣ lines.ts
 ┃ ┃ ┣ runOcrPipeline.ts
 ┃ ┃ ┣ ocrEngine.*
 ┃ ┃ ┣ useOcr.ts
 ┃ ┃ ┗ types.ts
 ┗ index.ts

---

## 🎯 Purpose

- Extract text from resumes (image, PDF, DOCX)
- Normalize and clean extracted data
- Provide structured output for AI processing

---

## ⚙️ Supported Inputs

- Images (camera / upload)
- PDF files
- DOCX files

---

## 🔄 Pipeline Flow

1. Pick file (image / pdf / docx)
2. Extract raw text
3. Clean + normalize text
4. Sort + structure content
5. Return processed output

---

## 🧠 Core Modules

### document/
- File picking (web + native)
- Document extraction helpers
- Confidence scoring

---

### pdf/
- PDF parsing
- Platform-specific engines
- pdf.js integration (web)

---

### docx/
- DOCX parsing (web + native)

---

### ocrEngine
- Tesseract-based OCR
- Platform-specific implementations

---

## 🧩 Hooks

- useOcr → runs full OCR pipeline
- useImagePicker → select images
- useDocument → handle document input
- useDocumentExtractor → extract structured data

---

## 📌 Usage

```ts
import { useOcr } from '@my-app/ocr'

const { runOcr } = useOcr()

const result = await runOcr(file)
🧾 Output

Returns:

extracted text
structured lines
cleaned content
metadata (confidence, type)
🧠 Notes
Cross-platform (web + native)
Modular pipeline design
Designed for resume → AI parsing flow
Used before sending data to Gemini API