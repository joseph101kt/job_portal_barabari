// packages/services/ocr/pipeline/types.ts

// ─── Raw Tesseract output ───────────────────────────────────────────────────
// This is what Tesseract.js actually gives us — we own nothing here.
export type TesseractWord = {
  text: string
  confidence: number
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

export type TesseractResult = {
  data: {
    words: TesseractWord[]
    text: string
  }
}

// ─── Phase 1 output ─────────────────────────────────────────────────────────
// Our internal Word after extraction. bbox stays in pixel space here.
export type Word = {
  text: string
  confidence: number
  bbox: { x0: number; y0: number; x1: number; y1: number }
}

// ─── Phase 4 output ─────────────────────────────────────────────────────────
// Word with normalized coordinates added (0–1 range).
export type NormalizedWord = Word & {
  norm: {
    x: number      // center x
    y: number      // center y
    width: number
    height: number
  }
}

// ─── Phase 5–9 output ───────────────────────────────────────────────────────
export type Line = {
  order: number                            // phase 7 — 1-based reading index
  text: string                             // phase 6 — words joined by space
  words: NormalizedWord[]
  indent: number                           // phase 9 — normalized x of leftmost word
  width: number                            // phase 8 — normalized line width
  height: number                           // phase 8 — normalized line height
  typeHint: 'header' | 'label' | 'body'   // phase 17 (derived here, low effort)
}

// ─── Phase 10–11 output ──────────────────────────────────────────────────────
export type Paragraph = {
  lines: Line[]
  lineCount: number
}

// ─── Phase 12–13 output ──────────────────────────────────────────────────────
export type Section = {
  paragraphs: Paragraph[]
  startsWithDivider: boolean
}

// ─── Phase 16 ────────────────────────────────────────────────────────────────
export type OcrMeta = {
  avgLineHeight: number
  avgWordHeight: number
  imageWidth: number
  imageHeight: number
  confidence: number    // phase 15 — average confidence across all words
}

// ─── Phase 19 — final LLM payload ────────────────────────────────────────────
export type OcrPayload = {
  rawText: string
  lines: Line[]
  paragraphs: Paragraph[]
  sections: Section[]
  meta: OcrMeta
}