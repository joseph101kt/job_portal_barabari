// packages/services/ocr/pipeline/extract.ts
//
// Phase 1 — Tesseract raw output → Word[]
//
// Responsibility: translate Tesseract's shape into our internal Word type.
// Nothing is filtered or modified here — that's clean.ts's job.
// One responsibility, one file.

import type { TesseractResult, Word } from './types'

export function extractWords(result: TesseractResult): Word[] {
  return result.data.words.map((w) => ({
    text: w.text,
    confidence: w.confidence,
    bbox: {
      x0: w.bbox.x0,
      y0: w.bbox.y0,
      x1: w.bbox.x1,
      y1: w.bbox.y1,
    },
  }))
}