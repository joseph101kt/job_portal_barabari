// packages/supabase/src/client.ts
//
// Factory pattern — each app calls initSupabase() once at startup
// with its own env vars. After that, getSupabase() works everywhere.
//
// Expo:    initSupabase(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!)
// Next.js: initSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error('@my-app/supabase: url and anonKey are required')
  }

  _client = createClient(url, anonKey, {
    auth: {
      persistSession:   true,
      autoRefreshToken: true,
    },
  })

  return _client
}

export function getSupabase(): SupabaseClient {
  if (!_client) {
    throw new Error(
      '@my-app/supabase: call initSupabase() before using getSupabase(). ' +
      'Add initSupabase() to your app entry point (_layout.tsx or _app.tsx).'
    )
  }
  return _client
}

// Convenience re-export so callers can do:
//   import { supabase } from '@my-app/supabase'
// after initSupabase() has been called in the app entry
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  },
})