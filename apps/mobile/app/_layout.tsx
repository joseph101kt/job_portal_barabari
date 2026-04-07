// apps/mobile/app/_layout.tsx

import '../global.css'
import { Stack, useRouter, useSegments } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Platform, View, Text } from 'react-native'
import { initSupabase, getSupabase, type Profile } from '@my-app/supabase'
import { configureAI } from '@my-app/features'
import type { Session } from '@supabase/supabase-js'
import { ThemeProvider, ToastProvider } from '@my-app/ui'

// init
initSupabase(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
)

configureAI({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
})

if (Platform.OS !== 'web') {
  const { registerGlobals } = require('@livekit/react-native')
  registerGlobals()
}

type AuthState =
  | 'loading'
  | 'unauthenticated'
  | 'onboarding_role'
  | 'onboarding_details'
  | 'seeker'
  | 'poster'

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()

  const [authState, setAuthState] = useState<AuthState>('loading')
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const supabase = getSupabase()

    async function handleSession(session: Session | null) {
      if (!session) {
        setAuthState('unauthenticated')
        return
      }

      // 🔥 ONLY DB CALL (needed)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('[DB error]', error.message)
      }

      setProfile(data ?? null)

      if (!data || !data.role) {
        setAuthState('onboarding_role')
        return
      }

      if (!data.onboarded) {
        setAuthState('onboarding_details')
        return
      }

      if (data.role === 'job_seeker') {
        setAuthState('seeker')
        return
      }

      if (data.role === 'job_poster') {
        setAuthState('poster')
        return
      }
    }

    // initial
    supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session)
    })

    // listener (CRITICAL)
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session)
      })

    return () => subscription.unsubscribe()
  }, [])

  // 🚀 ROUTING (NO ASYNC HERE)
  useEffect(() => {
    if (authState === 'loading') return

    const inAuth = segments[0] === 'auth'
    const inOnboarding = segments[0] === 'onboarding'
    const inSeeker = segments[0] === 'seeker'
    const inPoster = segments[0] === 'poster'

    switch (authState) {
      case 'unauthenticated':
        if (!inAuth) router.replace('/auth/login')
        break

      case 'onboarding_role':
        if (!inOnboarding) router.replace('/onboarding/role')
        break

      case 'onboarding_details':
        if (!inOnboarding) {
          const path =
            profile?.role === 'job_poster'
              ? '/onboarding/job-poster'
              : '/onboarding/job-seeker'

          router.replace(path as any)
        }
        break

      case 'seeker':
        if (!inSeeker) router.replace('/seeker/jobs')
        break

      case 'poster':
        if (!inPoster) router.replace('/poster/dashboard')
        break
    }
  }, [authState])

  if (authState === 'loading') {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-500">Loading...</Text>
      </View>
    )
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />

          <Stack.Screen name="onboarding/role" />
          <Stack.Screen name="onboarding/job-seeker" />
          <Stack.Screen name="onboarding/job-poster" />

          <Stack.Screen name="seeker" options={{ animation: 'none' }} />
          <Stack.Screen name="poster" options={{ animation: 'none' }} />
        </Stack>
      </ToastProvider>
    </ThemeProvider>
  )
}