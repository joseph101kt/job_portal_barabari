// packages/features/src/ocr/core/pipeline/document/confidence.ts

import type { DocumentPage, DocumentConfidence } from './types'

const MIN_WORDS_PER_PAGE = 30

export function scoreConfidence(pages: DocumentPage[]): DocumentConfidence {
  if (pages.length === 0) return 'low'
  const avg = pages.reduce((s, p) => s + p.wordCount, 0) / pages.length
  return avg >= MIN_WORDS_PER_PAGE ? 'high' : 'low'
}