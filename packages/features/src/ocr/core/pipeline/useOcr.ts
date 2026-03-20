// packages/features/src/ocr/useOcr.ts
//
// Platform-agnostic OCR state hook.
// No WebView ref here — that lives in OcrEngine.native.tsx.
// This hook only owns: status, result, error, and the event handler
// that both platforms call when Tesseract emits a message.

import { useState, useCallback } from 'react'

export type OcrStatus = 'idle' | 'ready' | 'processing' | 'success' | 'error'

export type OcrResult = {
  text: string
  confidence: number
}

export type OcrEvent = {
  status: string
  text?: string
  confidence?: number
  error?: string
}

export function useOcr() {
  const [status, setStatus]   = useState<OcrStatus>('idle')
  const [result, setResult]   = useState<OcrResult | null>(null)
  const [error,  setError]    = useState<string | null>(null)

  const onOcrEvent = useCallback((payload: OcrEvent) => {
    switch (payload.status) {
      case 'ready':
        setStatus('ready')
        break
      case 'processing':
        setStatus('processing')
        setResult(null)
        setError(null)
        break
      case 'success':
        setStatus('success')
        setResult({
          text:       payload.text       ?? '',
          confidence: payload.confidence ?? 0,
        })
        break
      case 'error':
        setStatus('error')
        setError(payload.error ?? 'Unknown OCR error')
        break
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, onOcrEvent, reset }
}