// apps/mobile/app/_layout.tsx
//
// THE single auth gatekeeper. Every navigation decision lives here.
// No screen does its own auth check — they all trust this layout.
//
// Decision tree:
//   no session          → /auth/login
//   session, no role    → /onboarding/role      (OAuth users)
//   session, not onboarded → /onboarding/<role>
//   job_seeker          → /seeker/jobs
//   job_poster          → /poster/dashboard

import '../global.css'
import { Stack, useRouter, useSegments } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Platform, View, Text } from 'react-native'
import { initSupabase, getSupabase, type Profile } from '@my-app/supabase'
import { configureAI } from '@my-app/features'
import type { Session } from '@supabase/supabase-js'
import { ThemeProvider, ToastProvider } from '@my-app/ui'

// ── One-time app init ──────────────────────────────────────────────────────
initSupabase(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
)

configureAI({
  url:     process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
})

if (Platform.OS !== 'web') {
  const { registerGlobals } = require('@livekit/react-native')
  registerGlobals()
}

// ── Auth state ─────────────────────────────────────────────────────────────
type AuthState = 'loading' | 'unauthenticated' | 'onboarding_role' | 'onboarding_details' | 'seeker' | 'poster'

function deriveState(session: Session | null, profile: Profile | null): AuthState {
  if (!session)                         return 'unauthenticated'
  if (!profile || !profile.role)        return 'onboarding_role'
  if (!profile.onboarded)               return 'onboarding_details'
  if (profile.role === 'job_seeker')    return 'seeker'
  if (profile.role === 'job_poster')    return 'poster'
  return 'unauthenticated'
}

export default function RootLayout() {
  const router   = useRouter()
  const segments = useSegments()
  const [authState, setAuthState] = useState<AuthState>('loading')
  const initialized = useRef(false)

  useEffect(() => {
    const supabase = getSupabase()

async function handleSession(session: Session | null) {
  if (!session) {
    console.log('[Auth] no session')
    setAuthState('unauthenticated')
    return
  }

  const { data: profile, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()

  if (error) {
    console.error('[DB] profile error:', error.message)
  }
  if (!profile) {
    console.log('[Auth] profile not ready yet')
    setAuthState('onboarding_role')
    return
  }

  const state = deriveState(session, profile as Profile | null)

  console.log('[Auth] derived state:', state)

  setAuthState(state)
}

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] initial session:', session ? `uid=${session.user.id}` : 'none')
      handleSession(session)
    })

    // Listen for auth changes (login, logout, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] state change:', event, session ? `uid=${session.user.id}` : 'none')
      handleSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])



  // Route based on auth state
  useEffect(() => {
    if (authState === 'loading') return

    const inAuth        = segments[0] === 'auth'
    const inOnboarding  = segments[0] === 'onboarding'
    const inSeeker      = segments[0] === 'seeker'
    const inPoster      = segments[0] === 'poster'

    switch (authState) {
      case 'unauthenticated':
        if (!inAuth) {
          console.log('[Nav] → /auth/login')
          router.replace('/auth/login')
        }
        break

      case 'onboarding_role':
        if (!inOnboarding) {
          console.log('[Nav] → /onboarding/role')
          router.replace('/onboarding/role')
        }
        break

      case 'onboarding_details':
        if (!inOnboarding) {
          // We need the role to route to the right onboarding screen
          // Role is stored in the profile — re-fetch or check segments
          getSupabase().auth.getUser().then(({ data: { user } }) => {
            if (!user) return
            getSupabase().from('profiles').select('role').eq('id', user.id).single()
              .then(({ data }) => {
                const path = data?.role === 'job_poster'
                  ? '/onboarding/job-poster'
                  : '/onboarding/job-seeker'
                console.log('[Nav] →', path)
                router.replace(path as any)
              })
          })
        }
        break

      case 'seeker':
        if (!inSeeker) {
          console.log('[Nav] → /seeker/jobs')
          router.replace('/seeker/jobs')
        }
        break

      case 'poster':
        if (!inPoster) {
          console.log('[Nav] → /poster/dashboard')
          router.replace('/poster/dashboard')
        }
        break
    }
  }, [authState, segments])

  if (authState === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#4F6EF7" />
        <Text className="text-xs text-neutral-400 dark:text-neutral-500 mt-3">Loading...</Text>
      </View>
    )
  }
  console.log('Supabase instance:', getSupabase())

  return (
    <ThemeProvider>
      <ToastProvider>

        <Stack screenOptions={{ headerShown: false }}>
          {/* Auth group */}
          <Stack.Screen name="auth/login"   />
          <Stack.Screen name="auth/signup"  />

          {/* Onboarding group */}
          <Stack.Screen name="onboarding/role"       />
          <Stack.Screen name="onboarding/job-seeker" />
          <Stack.Screen name="onboarding/job-poster" />

          {/* Main app groups — tab navigators live inside these */}
          <Stack.Screen name="seeker" options={{ animation: 'none' }} />
          <Stack.Screen name="poster" options={{ animation: 'none' }} />

        </Stack>
      
      
      </ToastProvider>
    </ThemeProvider>
  )
}