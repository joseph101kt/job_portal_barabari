import { Stack } from 'expo-router';
import '../global.css';
import { Platform } from 'react-native';
import { configureAI } from '@my-app/features'

if (Platform.OS !== 'web') {
  const { registerGlobals } = require('@livekit/react-native');
  registerGlobals();
}


// apps/mobile/app/_layout.tsx
//
// Call configureAI once here — before any screen renders.
// This wires the Supabase URL + anon key into the AI client.

// Your actual values — hardcoded for now, move to .env before production
configureAI({
  url:     'https://ssstfxetlemoqrhwggej.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzc3RmeGV0bGVtb3FyaHdnZ2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzQ1ODEsImV4cCI6MjA4Nzk1MDU4MX0.cQyop8BxHwcHEVnqYn7tVkWTrdp2i3ad4KBLj-1VnlA',
})

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="test"  options={{ title: 'Component Test' }} />
    </Stack>
  )
}