# OCR Pipeline

Cross-platform document intelligence pipeline built for the PREPARE medical app and Job Portal resume analyzer.

## What it does

Extracts text from images, PDFs, and DOCX files on both Expo (iOS/Android) and web (Next.js/Electron).

## Platform strategy

Platform-specific code is split at the file level using Metro and webpack resolver conventions:

| Suffix | Resolved by |
|---|---|
| `.native.ts(x)` | Metro (Expo) |
| `.web.ts(x)` | webpack / Next.js |
| `.ts(x)` (no suffix) | TypeScript type checker only |

This means `import { OcrEngine } from './ocrEngine'` automatically resolves to the right implementation at build time — no runtime `Platform.OS` checks needed at the import level.

## Folders

```
pipeline/
  ocr/           ← image OCR via Tesseract.js
  pdf/           ← PDF text extraction + image page OCR via pdfjs
  docx/          ← DOCX text + embedded image OCR via mammoth.js
  document/      ← shared types, state, file picker, orchestration
```

## Key design decisions

**WebView / iframe bridge for native and web PDF**
pdfjs-dist uses `import.meta` internally which Metro cannot bundle. Rather than polyfill, pdfjs runs inside a hidden WebView (native) or `<iframe srcdoc>` (web) loaded from CDN. Text is extracted there and posted back to the app via `postMessage`.

**Tesseract runs in the parent context on web**
`srcdoc` iframes have a null origin which blocks Web Workers and WASM loading — Tesseract.js cannot run inside them. Instead, the iframe renders image-based PDF pages to `<canvas>`, sends the JPEG data URL back to the parent, and the parent runs Tesseract in the main browser context where origin is real.

**Confidence scoring**
Every extraction result carries a `confidence` field (`'high' | 'low'`). Low confidence (< 30 average words/page) signals to the AI layer that a Gemini Vision fallback may produce better results.

**Known limitations**
- Scanned PDFs with many pages: OCR is sequential per Tesseract worker. All `pageNeedsOcr` messages are dispatched concurrently from the iframe but processed one-at-a-time. On large files (30+ image pages) later pages may hit the 15s per-page timeout. Text layer PDFs are unaffected.
- Handwritten text: not supported. Tesseract is trained on printed fonts.
- Native PDF OCR (image pages): not yet implemented. The native pdfjs WebView extracts text layers only.