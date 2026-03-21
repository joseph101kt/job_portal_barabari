// packages/features/src/ocr/core/pipeline/document/types.ts

export type DocumentSource = 'pdf' | 'docx'

export type DocumentConfidence =
  | 'high'  // clean selectable text — send straight to AI
  | 'low'   // sparse text — likely scanned, flag for Gemini Vision fallback

export type DocumentPage = {
  pageNumber: number
  text:       string
  wordCount:  number
}

export type DocumentResult = {
  text:       string             // full concatenated text, ready for AI
  pages:      DocumentPage[]
  pageCount:  number
  source:     DocumentSource
  confidence: DocumentConfidence
  meta: {
    filename:      string
    fileSizeBytes: number
    extractedAt:   string        // ISO timestamp
  }
}

export type PickedDocument = {
  filename:  string
  mimeType:  string
  buffer:    ArrayBuffer
  sizeBytes: number
}