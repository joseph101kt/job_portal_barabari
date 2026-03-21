// packages/features/src/ocr/core/pipeline/document/useDocument.ts

import { useState, useCallback } from 'react'
import type { DocumentResult } from './types'

export type DocumentStatus = 'idle' | 'picking' | 'extracting' | 'success' | 'error'

export type DocumentEvent =
  | { status: 'picking' }
  | { status: 'extracting'; message?: string }
  | { status: 'success'; result: DocumentResult }
  | { status: 'error';   error: string }

export function useDocument() {
  const [status,   setStatus]   = useState<DocumentStatus>('idle')
  const [result,   setResult]   = useState<DocumentResult | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)

  const onDocumentEvent = useCallback((event: DocumentEvent) => {
    switch (event.status) {
      case 'picking':
        setStatus('picking')
        setResult(null)
        setError(null)
        setProgress(null)
        break
      case 'extracting':
        setStatus('extracting')
        setProgress(event.message ?? null)
        break
      case 'success':
        setStatus('success')
        setResult(event.result)
        setProgress(null)
        break
      case 'error':
        if (event.error === 'cancelled') {
          setStatus('idle')
        } else {
          setStatus('error')
          setError(event.error)
        }
        setProgress(null)
        break
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
    setProgress(null)
  }, [])

  return { status, result, error, progress, onDocumentEvent, reset }
}