// packages/features/src/ai/core/useAnalysis.ts

import { useState, useCallback } from 'react'
import type { AnalysisResult, AnalysisType } from './types'

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'

export function useAnalysis() {
  const [status, setStatus]   = useState<AnalysisStatus>('idle')
  const [result, setResult]   = useState<AnalysisResult | null>(null)
  const [error,  setError]    = useState<string | null>(null)

  const onStart = useCallback(() => {
    setStatus('loading')
    setResult(null)
    setError(null)
  }, [])

  const onSuccess = useCallback((r: AnalysisResult) => {
    setStatus('success')
    setResult(r)
  }, [])

  const onError = useCallback((msg: string) => {
    setStatus('error')
    setError(msg)
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, onStart, onSuccess, onError, reset }
}