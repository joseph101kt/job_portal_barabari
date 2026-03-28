import { Stack } from 'expo-router';
import '../global.css';
import { Platform } from 'react-native';
import { configureAI } from '@my-app/features'

import { initSupabase } from '@my-app/supabase'

if (Platform.OS !== 'web') {
  const { registerGlobals } = require('@livekit/react-native');
  registerGlobals();
}


initSupabase(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

// apps/mobile/app/_layout.tsx
//
// Call configureAI once here — before any screen renders.
// This wires the Supabase URL + anon key into the AI client.

// Your actual values — hardcoded for now, move to .env before production
configureAI({
  url:     process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
})

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  )
} 