// packages/services/ocr/pipeline/lines.ts
//
// Phases 5–9 — NormalizedWord[] → Line[]
//
// Phase 5: group words whose vertical centers are within a tolerance band
// Phase 6: sort words in each group by x, join with space → line.text
// Phase 7: assign reading order index (1-based)
// Phase 8: compute line width + height from word bboxes
// Phase 9: compute indentation (leftmost word's normalized x)
// Phase 17: derive typeHint from height/width heuristics
//
// ─── Grouping strategy ───────────────────────────────────────────────────────
//
// We use a "sliding band" approach:
//   1. Sort words by norm.y (already done by sort.ts on pixel coords, but we
//      re-sort here on norm.y to be safe after normalization).
//   2. Start a new line group whenever a word's center-y is more than
//      BAND_FACTOR × the word's own height away from the current group's
//      average center-y.
//
// BAND_FACTOR=0.6 means: if a word is more than 60% of its own height below
// the running average, it belongs to the next line. This adapts to font size
// automatically — large headers have large height, so the band is wider.
//
// Tradeoff: single-column text only. Multi-column layouts will interleave.
// That's acceptable here — we document it rather than silently get it wrong.

import type { NormalizedWord, Line } from './types'

const BAND_FACTOR = 0.6

export function groupIntoLines(words: NormalizedWord[]): Line[] {
  if (words.length === 0) return []

  // Re-sort by normalized y center for safety
  const sorted = [...words].sort((a, b) => a.norm.y - b.norm.y)

  // ── Phase 5: cluster by vertical proximity ───────────────────────────────
  const groups: NormalizedWord[][] = []
  let currentGroup: NormalizedWord[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const word        = sorted[i]
    const groupAvgY   = avgY(currentGroup)
    const bandRadius  = word.norm.height * BAND_FACTOR

    if (Math.abs(word.norm.y - groupAvgY) <= bandRadius) {
      currentGroup.push(word)
    } else {
      groups.push(currentGroup)
      currentGroup = [word]
    }
  }
  groups.push(currentGroup)

  // ── Phases 6–9 + typeHint: build Line from each group ───────────────────
  return groups.map((group, index) => {
    // Phase 6: sort by x, join → text
    const sorted = [...group].sort((a, b) => a.norm.x - b.norm.x)
    const text   = sorted.map((w) => w.text).join(' ')

    // Phase 7: reading order (1-based)
    const order = index + 1

    // Phase 8: line dimensions from bounding box union
    const minX = Math.min(...sorted.map((w) => w.norm.x - w.norm.width  / 2))
    const maxX = Math.max(...sorted.map((w) => w.norm.x + w.norm.width  / 2))
    const minY = Math.min(...sorted.map((w) => w.norm.y - w.norm.height / 2))
    const maxY = Math.max(...sorted.map((w) => w.norm.y + w.norm.height / 2))

    const width  = round4(maxX - minX)
    const height = round4(maxY - minY)

    // Phase 9: indentation = x of leftmost word
    const indent = round4(minX)

    // Phase 17: typeHint — keep it loose, LLM does the real reasoning
    const typeHint = deriveTypeHint(height, width)

    return { order, text, words: sorted, indent, width, height, typeHint }
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avgY(words: NormalizedWord[]): number {
  return words.reduce((sum, w) => sum + w.norm.y, 0) / words.length
}

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000
}

// Heuristic thresholds — these are starting points, not strict rules.
// The LLM is told these are hints, not classifications.
//
// header: tall relative to typical body text (height > 0.04 = ~4% of image)
// label:  short width (less than 30% of image wide) — single words, field names
// body:   everything else
function deriveTypeHint(height: number, width: number): Line['typeHint'] {
  if (height > 0.04)  return 'header'
  if (width  < 0.30)  return 'label'
  return 'body'
}