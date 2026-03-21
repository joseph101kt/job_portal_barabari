// packages/features/src/ai/core/useAnalyzeDocument.ts
//
// Convenience hook that wires useAnalysis + analyze() together.
// Screens call analyzeDocument() and read status/result/error.
//
// Usage:
//   const { status, result, error, analyzeDocument, reset } = useAnalyzeDocument()
//   await analyzeDocument({ type: 'medical_report', text: ocrText })

import { useCallback } from 'react'
import { analyze }     from './analyzeClient'
import type { AnalysisRequest } from './types'
import { useAnalysis } from './useAnalysis'

export function useAnalyzeDocument() {
  const { status, result, error, onStart, onSuccess, onError, reset } = useAnalysis()

  const analyzeDocument = useCallback(async (request: AnalysisRequest) => {
    onStart()
    try {
      const res = await analyze(request)
      onSuccess(res)
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Analysis failed')
    }
  }, [onStart, onSuccess, onError])

  return { status, result, error, analyzeDocument, reset }
}