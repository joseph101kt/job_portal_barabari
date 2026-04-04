// supabase/functions/analyze/index.ts

import { PROMPTS } from './prompts.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_URL   = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, text, context } = await req.json()

    if (!type || !text) {
      return errorResponse('Missing required fields: type, text', 400)
    }

    if (!['resume', 'summarize'].includes(type)) {
      return errorResponse(`Unknown analysis type: ${type}`, 400)
    }

    if (text.trim().split(/\s+/).length < 10) {
      return errorResponse('Text too short to analyze (minimum 10 words)', 400)
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return errorResponse('GEMINI_API_KEY secret is not set', 500)
    }

    // For resume analysis, fetch existing skills to guide AI matching
    let prompt: string
    if (type === 'resume') {
      const availableSkills = await fetchAvailableSkillNames(req)
      prompt = PROMPTS.resume(text, availableSkills)
    } else {
      prompt = PROMPTS.summarize(text, context)
    }

    const geminiRes = await fetch(GEMINI_URL(apiKey), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:        0,
          response_mime_type: 'application/json',
        },
      }),
    })

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      return errorResponse(`Gemini error ${geminiRes.status}: ${err}`, 502)
    }

    const geminiData = await geminiRes.json()
    const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    if (!raw) {
      return errorResponse('Gemini returned empty response', 502)
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    } catch {
      return errorResponse(`Failed to parse Gemini response: ${raw}`, 502)
    }

    return new Response(
      JSON.stringify({ success: true, result: { type, data: parsed } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return errorResponse(message, 500)
  }
})

// Fetch skill names from DB to provide context to AI
async function fetchAvailableSkillNames(req: Request): Promise<string[]> {
  try {
    const supabaseUrl     = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseUrl || !supabaseAnonKey) return []

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data } = await supabase.from('skills').select('name').order('name')
    return (data ?? []).map((s: { name: string }) => s.name)
  } catch {
    // Non-fatal — prompt works without this context
    return []
  }
}

function errorResponse(message: string, status: number): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}