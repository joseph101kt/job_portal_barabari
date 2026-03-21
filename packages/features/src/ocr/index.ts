// packages/features/src/ocr/index.ts

export {
  useOcr,
  OcrEngine,
  pickImageAsBase64,
  runTesseractWeb,    // no-op on native, real impl on web
  runOcrPipeline,
  extractWords,
  cleanWords,
  sortWords,
  normalizeWords,
  groupIntoLines,
} from './core/pipeline'

export type {
  OcrStatus,
  OcrResult,
  OcrEvent,
  PickedImage,
  OcrPayload,
  OcrMeta,
  Line,
  Paragraph,
  Section,
  TesseractWord,
  TesseractResult,
  Word,
  NormalizedWord,
} from './core/pipeline'

export {
  PdfEngine,
  useDocument,
  useDocumentExtractor,
  pickDocumentAsBuffer,
  extractDocumentWeb,
  extractDocumentNative,
} from './core/pipeline'

export type {
  DocumentResult,
  DocumentStatus,
  DocumentEvent,
  PickedDocument,
  DocumentConfidence,
} from './core/pipeline'

export * from './core/pipeline'