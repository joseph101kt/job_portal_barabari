// packages/features/src/ocr/core/pipeline/docx/extractDocx.native.ts
//
// Imports directly from types.ts and confidence.ts — NOT from '../document' index.
// Importing from the barrel would create a require cycle:
//   extractDocx.native → document/index → useDocumentExtractor → extractDocx.native

import type { DocumentResult } from '../document/types'
import { scoreConfidence }     from '../document/confidence'

export async function extractDocxNative(
  buffer:   ArrayBuffer,
  filename: string,
): Promise<DocumentResult> {
  const mammoth = await import('mammoth')
  const { value: text } = await mammoth.extractRawText({ arrayBuffer: buffer })

  const wordCount = text.split(/\s+/).filter(Boolean).length
  const pages     = [{ pageNumber: 1, text, wordCount }]

  return {
    text:       text.trim(),
    pages,
    pageCount:  1,
    source:     'docx',
    confidence: scoreConfidence(pages),
    meta: {
      filename,
      fileSizeBytes: buffer.byteLength,
      extractedAt:   new Date().toISOString(),
    },
  }
}