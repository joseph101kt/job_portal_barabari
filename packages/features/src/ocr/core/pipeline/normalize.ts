// packages/services/ocr/pipeline/normalize.ts
//
// Phase 4 — pixel coordinates → normalized 0–1 range
//
// Why normalize:
//   - Resolution independent: a word at x=400 means nothing without knowing
//     the image width. At x=0.52 it means "just right of center" on any image.
//   - LLM reasoning: the model can compare positions across different scans
//     without needing to know image dimensions.
//   - Design win: shows the system is built to handle variable input.
//
// Output added as `.norm` on each word — original pixel bbox is preserved
// so downstream code can still access raw coords for debug visualizations.
//
// Formula:
//   x      = center_x / imageWidth
//   y      = center_y / imageHeight
//   width  = (x1 - x0) / imageWidth
//   height = (y1 - y0) / imageHeight

import type { Word, NormalizedWord } from './types'

export function normalizeWords(
  words: Word[],
  imageWidth: number,
  imageHeight: number
): NormalizedWord[] {
  if (imageWidth <= 0 || imageHeight <= 0) {
    throw new Error(
      `normalizeWords: invalid image dimensions ${imageWidth}×${imageHeight}`
    )
  }

  return words.map((w) => {
    const centerX = (w.bbox.x0 + w.bbox.x1) / 2
    const centerY = (w.bbox.y0 + w.bbox.y1) / 2

    return {
      ...w,
      norm: {
        x:      round4(centerX             / imageWidth),
        y:      round4(centerY             / imageHeight),
        width:  round4((w.bbox.x1 - w.bbox.x0) / imageWidth),
        height: round4((w.bbox.y1 - w.bbox.y0) / imageHeight),
      },
    }
  })
}

// 4 decimal places is enough precision for LLM consumption
// and keeps the JSON payload compact.
function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000
}