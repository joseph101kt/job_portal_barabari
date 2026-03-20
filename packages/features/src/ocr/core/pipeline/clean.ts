// packages/services/ocr/pipeline/clean.ts
//
// Phase 2 — filter noise from raw Word[]
//
// Rules (in order):
//   1. trim whitespace from text
//   2. drop empty strings
//   3. drop words below confidence threshold
//   4. drop words with zero-area bboxes (Tesseract sometimes emits these)
//
// Tradeoff: threshold=50 is conservative — it lets through some noise but
// avoids silently dropping real words in low-quality scans. The LLM handles
// remaining noise better than missing words.

import type { Word } from './types'

const DEFAULT_MIN_CONFIDENCE = 50

export function cleanWords(
  words: Word[],
  minConfidence = DEFAULT_MIN_CONFIDENCE
): Word[] {
  return words
    .map((w) => ({ ...w, text: w.text.trim() }))
    .filter((w) => w.text.length > 0)
    .filter((w) => w.confidence >= minConfidence)
    .filter((w) => {
      const hasWidth  = w.bbox.x1 > w.bbox.x0
      const hasHeight = w.bbox.y1 > w.bbox.y0
      return hasWidth && hasHeight
    })
}