// packages/features/src/ocr/core/pipeline/document/index.ts

export { useDocument }          from './useDocument'
export { useDocumentExtractor } from './useDocumentExtractor'
export { pickDocumentAsBuffer } from './pickDocument'
export { extractDocumentWeb, extractDocumentNative } from './extractDocument'
export { scoreConfidence }      from './confidence'

export type {
  DocumentSource,
  DocumentConfidence,
  DocumentPage,
  DocumentResult,
  PickedDocument,
} from './types'

export type { DocumentStatus, DocumentEvent } from './useDocument'