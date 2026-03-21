// packages/features/src/ai/core/index.ts

export { configureAI, analyze }  from './analyzeClient'
export { useAnalysis }           from './useAnalysis'
export { useAnalyzeDocument }    from './useAnalyzeDocument'

export type {
  AnalysisType,
  AnalysisRequest,
  AnalysisResult,
  MedicalReportResult,
  ResumeResult,
  SummaryResult,
  EdgeRequest,
  EdgeResponse,
} from './types'