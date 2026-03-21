/// <reference lib="dom" />
// packages/features/src/ocr/core/pipeline/pdf/extractPdf.web.ts
//
// PDF extraction on web is handled entirely by PdfEngine.web.tsx (iframe bridge).
// This file exists only so extractDocument.ts can import it without errors.
// Calling it directly will throw — always go through useDocumentExtractor
// which routes PDFs through the PdfEngine ref.

import type { DocumentResult } from '../document/types'

export async function extractPdfWeb(
  _buffer:   ArrayBuffer,
  _filename: string,
): Promise<DocumentResult> {
  throw new Error(
    'extractPdfWeb should not be called directly. ' +
    'PDF extraction on web goes through PdfEngine (iframe bridge). ' +
    'Use useDocumentExtractor instead.'
  )
}