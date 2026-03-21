// packages/features/src/ai/core/analyzeClient.ts
//
// Client-side caller for the Supabase Edge Function.
// Screens call analyze() and get back a typed AnalysisResult.
//
// SUPABASE_URL and SUPABASE_ANON_KEY should live in your app's env config:
//   apps/mobile/.env    → EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
//   apps/web/.env.local → NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
//
// We read them via a config object so this file stays platform-agnostic.

import type { AnalysisRequest, AnalysisResult, EdgeResponse } from './types'

type SupabaseConfig = {
  url:     string
  anonKey: string
}

// Call once at app startup, e.g. in your root layout / app entry
let _config: SupabaseConfig | null = null

export function configureAI(config: SupabaseConfig) {
  _config = config
}

function getConfig(): SupabaseConfig {
  if (!_config) {
    throw new Error(
      'AI not configured. Call configureAI({ url, anonKey }) before using analyze().'
    )
  }
  return _config
}

export async function analyze(request: AnalysisRequest): Promise<AnalysisResult> {
  const { url, anonKey } = getConfig()

  const endpoint = `${url}/functions/v1/analyze`

  const res = await fetch(endpoint, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      type:    request.type,
      text:    request.text,
      context: 'context' in request ? request.context : undefined,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`Edge Function error ${res.status}: ${text}`)
  }

  const body: EdgeResponse = await res.json()

  if (!body.success) {
    throw new Error(body.error)
  }

  return body.result
}