/// <reference lib="dom" />
// packages/features/src/ocr/core/pipeline/document/pickDocument.web.ts

import type { PickedDocument } from './types'

export function pickDocumentAsBuffer(): Promise<PickedDocument | null> {
  return new Promise((resolve) => {
    const input  = document.createElement('input')
    input.type   = 'file'
    input.accept = [
      '.pdf',
      '.docx',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ].join(',')

    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)

      const reader    = new FileReader()
      reader.onload   = () => resolve({
        filename:  file.name,
        mimeType:  file.type,
        buffer:    reader.result as ArrayBuffer,
        sizeBytes: file.size,
      })
      reader.onerror = () => resolve(null)
      reader.readAsArrayBuffer(file)
    }

    input.addEventListener('cancel', () => resolve(null))
    input.click()
  })
}