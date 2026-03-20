// packages/services/ocr/pipeline/sort.ts
//
// Phase 3 — sort words into reading order (top→bottom, left→right)
//
// Strategy:
//   Primary sort:  y0 ascending  (top of bbox)
//   Tie-break:     x0 ascending  (left of bbox)
//
// We sort by y0 (top edge), not center, because two words on the same
// visual line can have slightly different center-y values due to descenders
// (g, p, y) pulling the center down. Top-edge is more stable.
//
// This sort is a pre-pass only. Actual line grouping happens in lines.ts
// where we cluster by y-proximity rather than exact y equality.

import type { Word } from './types'

export function sortWords(words: Word[]): Word[] {
  return [...words].sort((a, b) => {
    const yDiff = a.bbox.y0 - b.bbox.y0
    if (yDiff !== 0) return yDiff
    return a.bbox.x0 - b.bbox.x0
  })
}