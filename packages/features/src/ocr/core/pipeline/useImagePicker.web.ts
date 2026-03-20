/// <reference lib="dom" />
// ↑ Tells TypeScript this file runs in a browser environment.
//   Without this, `document`, `FileReader`, `HTMLInputElement` etc. are unknown.
//   We add it here (not in tsconfig) so native files are unaffected.

// packages/features/src/ocr/useImagePicker.web.ts

export type PickedImage = {
  uri:    string   // data URL — usable directly as <img src>
  base64: string   // raw base64 without the data:... prefix
}

export function pickImageAsBase64(): Promise<PickedImage | null> {
  return new Promise((resolve) => {
    const input    = document.createElement('input')
    input.type     = 'file'
    input.accept   = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)

      const reader  = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        const base64  = dataUrl.split(',')[1]
        resolve({ uri: dataUrl, base64 })
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    }
    input.addEventListener('cancel', () => resolve(null))
    input.click()
  })
}

// ── Web-only: run Tesseract directly (no WebView bridge needed) ───────────────

import type { OcrEvent } from './useOcr'

let cachedWorker: import('tesseract.js').Worker | null = null

export async function runTesseractWeb(
  imageBase64: string,
  onEvent: (e: OcrEvent) => void
): Promise<void> {
  try {
    onEvent({ status: 'processing' })

    if (!cachedWorker) {
      const Tesseract = await import('tesseract.js')
      cachedWorker    = await Tesseract.createWorker('eng')
      onEvent({ status: 'ready' })
    }

    const result = await cachedWorker.recognize(
      `data:image/jpeg;base64,${imageBase64}`
    )

    onEvent({
      status:     'success',
      text:       result.data.text,
      confidence: result.data.confidence,
    })
  } catch (err: unknown) {
    onEvent({
      status: 'error',
      error:  err instanceof Error ? err.message : 'Tesseract failed',
    })
  }
}