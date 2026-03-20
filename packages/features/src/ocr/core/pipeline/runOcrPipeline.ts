// packages/services/ocr/runOcrPipeline.ts
//
// Convenience orchestrator — chains all pipeline phases in order.
// This is what screens actually call after getting a TesseractResult.
//
// Screens don't need to know phases exist. They hand off the raw result
// and get back a fully structured OcrPayload ready for the LLM.
//
// Phases run:
//   1. extract   → Word[]
//   2. clean     → Word[]
//   3. sort      → Word[]
//   4. normalize → NormalizedWord[]
//   5–9. lines   → Line[]
//   (10–13 paragraphs/sections will be wired in once those files exist)
//   14. rawText  → string
//   16. meta     → OcrMeta
//   19. payload  → OcrPayload
//
// The paragraphs/sections slots are stubbed below so this file compiles now
// and gets filled in when paragraphs.ts + sections.ts are written.

import { extractWords }   from './extract'
import { cleanWords }     from './clean'
import { sortWords }      from './sort'
import { normalizeWords } from './normalize'
import { groupIntoLines } from './lines'

import type {
  TesseractResult,
  OcrPayload,
  OcrMeta,
  Line,
} from './types'

type RunOptions = {
  imageWidth:    number
  imageHeight:   number
  minConfidence?: number   // default 50 — passed through to cleanWords
}

export function runOcrPipeline(
  result: TesseractResult,
  { imageWidth, imageHeight, minConfidence }: RunOptions
): OcrPayload {

  // ── Phases 1–3 ─────────────────────────────────────────────────────────
  const extracted = extractWords(result)
  const cleaned   = cleanWords(extracted, minConfidence)
  const sorted    = sortWords(cleaned)

  // ── Phase 4 ─────────────────────────────────────────────────────────────
  const normalized = normalizeWords(sorted, imageWidth, imageHeight)

  // ── Phases 5–9 ──────────────────────────────────────────────────────────
  const lines = groupIntoLines(normalized)

  // ── Phase 14: rawText ───────────────────────────────────────────────────
  const rawText = lines.map((l) => l.text).join('\n')

  // ── Phase 15+16: meta ───────────────────────────────────────────────────
  const meta = buildMeta(lines, normalized.map(w => w.norm.height), imageWidth, imageHeight)

  // ── Phases 10–13: paragraphs + sections (stubs until those files exist) ─
  // Replace these with real implementations once paragraphs.ts/sections.ts
  // are written. The payload shape is already correct.
  const paragraphs = [{ lines, lineCount: lines.length }]
  const sections   = [{ paragraphs, startsWithDivider: false }]

  return { rawText, lines, paragraphs, sections, meta }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildMeta(
  lines: Line[],
  wordHeights: number[],
  imageWidth: number,
  imageHeight: number
): OcrMeta {
  const avgLineHeight = lines.length > 0
    ? round4(lines.reduce((s, l) => s + l.height, 0) / lines.length)
    : 0

  const avgWordHeight = wordHeights.length > 0
    ? round4(wordHeights.reduce((s, h) => s + h, 0) / wordHeights.length)
    : 0

  // Flatten all words from all lines to compute average confidence
  const allWords = lines.flatMap((l) => l.words)
  const confidence = allWords.length > 0
    ? Math.round(allWords.reduce((s, w) => s + w.confidence, 0) / allWords.length)
    : 0

  return { avgLineHeight, avgWordHeight, imageWidth, imageHeight, confidence }
}

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000
}