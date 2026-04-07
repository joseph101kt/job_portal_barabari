# 📄 Resume Package

Combines OCR + AI to process resumes and update user profiles.

---

## 📁 Structure

resume/
 ┣ core/
 ┃ ┗ uploadResumeBtn.tsx
 ┗ index.ts

---

## 🎯 Purpose

- Upload resume
- Run OCR pipeline
- Send data to AI for analysis
- Update profile in database

---

## 🔄 Flow

1. Upload file  
2. OCR extracts text  
3. AI analyzes content  
4. Profile gets updated  

---

## 🧩 Components

- uploadResumeBtn → handles full pipeline trigger  

---

## 🧠 Notes

- Entry point for resume processing
- Connects OCR → AI → DB
- Used in profile and onboarding

---