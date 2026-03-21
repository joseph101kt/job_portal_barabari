// packages/features/src/ocr/core/pipeline/document/extractDocument.ts

import type { DocumentResult, PickedDocument } from './types'

type ProgressCallback = (msg: string) => void

function isPdf(doc: PickedDocument): boolean {
  return doc.mimeType === 'application/pdf' ||
    doc.filename.toLowerCase().endsWith('.pdf')
}

function isDocx(doc: PickedDocument): boolean {
  return doc.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    doc.filename.toLowerCase().endsWith('.docx')
}

export async function extractDocumentWeb(
  doc:         PickedDocument,
  onProgress?: ProgressCallback,
): Promise<DocumentResult> {
  // PDF on web is handled by PdfEngine (iframe bridge) — never call this for PDF
  if (isPdf(doc)) {
    throw new Error(
      'PDF on web goes through PdfEngine iframe bridge. ' +
      'useDocumentExtractor handles this automatically.'
    )
  }
  if (isDocx(doc)) {
    const { extractDocxWeb } = await import('../docx/extractDocx.web')
    return extractDocxWeb(doc.buffer, doc.filename, onProgress)
  }
  throw new Error(`Unsupported file type: ${doc.mimeType || doc.filename}`)
}

export async function extractDocumentNative(
  doc: PickedDocument,
): Promise<DocumentResult> {
  if (isDocx(doc)) {
    const { extractDocxNative } = await import('../docx/extractDocx.native')
    return extractDocxNative(doc.buffer, doc.filename)
  }
  if (isPdf(doc)) {
    throw new Error(
      'PDF on native goes through PdfEngine WebView bridge. ' +
      'useDocumentExtractor handles this automatically.'
    )
  }
  throw new Error(`Unsupported file type: ${doc.mimeType || doc.filename}`)
}