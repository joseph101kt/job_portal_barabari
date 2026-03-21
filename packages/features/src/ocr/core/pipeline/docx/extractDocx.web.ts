/// <reference lib="dom" />
// packages/features/src/ocr/core/pipeline/docx/extractDocx.web.ts
//
// Imports directly from types.ts and confidence.ts — not from '../document' barrel.

import type { DocumentResult } from '../document/types'
import { scoreConfidence }     from '../document/confidence'

export async function extractDocxWeb(
  buffer:    ArrayBuffer,
  filename:  string,
  onProgress?: (msg: string) => void,
): Promise<DocumentResult> {
  const mammoth = await import('mammoth')

  onProgress?.('Extracting text…')
  const { value: rawText } = await mammoth.extractRawText({ arrayBuffer: buffer })

  onProgress?.('Checking for embedded images…')
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer })

  const imageSrcs = extractImageSrcs(html)
  let finalText   = rawText.trim()

  if (imageSrcs.length > 0) {
    onProgress?.(`Found ${imageSrcs.length} embedded image(s) — running OCR…`)
    const imageTexts = await ocrImages(imageSrcs, onProgress)
    finalText = [finalText, ...imageTexts].filter(Boolean).join('\n\n')
  }

  const wordCount = finalText.split(/\s+/).filter(Boolean).length
  const pages     = [{ pageNumber: 1, text: finalText, wordCount }]

  return {
    text:       finalText,
    pages,
    pageCount:  1,
    source:     'docx',
    confidence: imageSrcs.length > 0 ? 'high' : scoreConfidence(pages),
    meta: {
      filename,
      fileSizeBytes: buffer.byteLength,
      extractedAt:   new Date().toISOString(),
    },
  }
}

function extractImageSrcs(html: string): string[] {
  const parser = new DOMParser()
  const doc    = parser.parseFromString(html, 'text/html')
  return Array.from(doc.querySelectorAll('img'))
    .map(img => img.getAttribute('src') ?? '')
    .filter(src => src.startsWith('data:image'))
}

async function ocrImages(
  srcs:        string[],
  onProgress?: (msg: string) => void,
): Promise<string[]> {
  const Tesseract = await import('tesseract.js')
  const worker    = await Tesseract.createWorker('eng')
  const results: string[] = []

  for (let i = 0; i < srcs.length; i++) {
    onProgress?.(`OCR image ${i + 1} of ${srcs.length}…`)
    const { data } = await worker.recognize(srcs[i])
    const text     = data.text.trim()
    // Prefix so the UI can visually distinguish image-derived text
    if (text.length > 0) results.push(`IMAGE_OCR:${text}`)
  }

  await worker.terminate()
  return results
}