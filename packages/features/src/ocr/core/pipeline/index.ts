// packages/features/src/ocr/core/pipeline/index.ts

// ── Pipeline phase functions ──────────────────────────────────────────────────
export { extractWords }   from './extract'
export { cleanWords }     from './clean'
export { sortWords }      from './sort'
export { normalizeWords } from './normalize'
export { groupIntoLines } from './lines'
export { runOcrPipeline } from './runOcrPipeline'

// ── Platform-split ────────────────────────────────────────────────────────────
// No .ts / .tsx extension — TS resolves the stub, bundler resolves .native/.web
export { useOcr }            from './useOcr'
export { OcrEngine }         from './ocrEngine'
export { pickImageAsBase64 } from './useImagePicker'
export { runTesseractWeb }   from './useImagePicker'

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  TesseractWord,
  TesseractResult,
  Word,
  NormalizedWord,
  Line,
  Paragraph,
  Section,
  OcrMeta,
  OcrPayload,
} from './types'

export type { OcrStatus, OcrResult, OcrEvent } from './useOcr'
export type { PickedImage }                     from './useImagePicker'




// ── Document (PDF + DOCX) ─────────────────────────────────────────────────────
export { PdfEngine }            from './pdf'
export { extractPdfWeb }        from './pdf'
export { extractDocxWeb }       from './docx'
export { extractDocxNative }    from './docx'
export {
  useDocument,
  useDocumentExtractor,
  pickDocumentAsBuffer,
  extractDocumentWeb,
  extractDocumentNative,
  scoreConfidence,
} from './document'
 
// ── Document types ────────────────────────────────────────────────────────────
export type {
  DocumentSource, DocumentConfidence,
  DocumentPage, DocumentResult, PickedDocument,
  DocumentStatus, DocumentEvent,
} from './document'

export type {
  PdfEngineProps,
} from './pdf'
