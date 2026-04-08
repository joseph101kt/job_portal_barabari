// apps/mobile/app/auth/login.tsx

/**
 * Login Screen
 * ----------------------------------------
 * Handles:
 * - Email/password authentication
 * - Google OAuth login
 * - Validation + error handling using Toast
 *
 * UX Notes:
 * - Uses Toast for all feedback (errors + success)
 * - Prevents empty submissions
 * - Shows loading state on button
 *
 * Dependencies:
 * - expo-router (navigation)
 * - supabase (auth)
 * - @my-app/ui (Button, Input, Toast)
 */

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Button, Input, Toast } from '@my-app/ui'
import { supabase } from '@my-app/supabase'
import { Stack } from 'expo-router'
import { userInfo } from 'node:os'


export default function LoginScreen() {
  const router = useRouter()

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // ─────────────────────────────────────────────
  // LOGGING (dev/debug)
  // ─────────────────────────────────────────────
  function logEvent(scope: string, message: string) {
    console.log(`[${scope}] ${message}`)
  }

  // ─────────────────────────────────────────────
  // EMAIL/PASSWORD LOGIN
  // ─────────────────────────────────────────────
  async function handleLogin() {
    // ✅ Validation
    if (!email || !password) {
      Toast.showError('Please enter your email and password!', 'Missing details')
      return
    }

    setLoading(true)
    logEvent('Auth', 'Attempting login...')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // ❌ Error handling
    if (error) {
      logEvent('Auth', `Login error: ${error.message}`)

      if (error.message.includes('Invalid login credentials')) {
        Toast.showError(
          'Incorrect email or password. Please try again',
          'Login failed'
        )
      } else if (error.message.includes('Email not confirmed')) {
        Toast.showError(
          'Please verify your email before logging in.',
          'Email not verified'
        )
      } else {
        Toast.showError(
          'Something went wrong. Please try again.',
          'Login Failed'
        )
      }

      setLoading(false)
      return
    }

    // ❌ Edge case: no user
    if (!data.user) {
      await supabase.auth.signOut()
      Toast.showError(
        'User not found. Please sign up again.',
        'Session error'
      )
      setLoading(false)
      return
    }

    // ✅ Success
    logEvent('Auth', `Login success: ${data.user.email}`)
    Toast.showSuccess('Login successful', 'Welcome back!')

    setLoading(false)

    router.replace('/')
  }



  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Stack.Screen options={{ title: 'Login' }} />
      {/* Header */}
      <Text className="text-3xl font-bold text-gray-900 mb-2">
        Welcome back
      </Text>
      <Text className="text-base text-gray-500 mb-8">
        Sign in to your account
      </Text>

      <View className="gap-4">
        {/* Email */}
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password */}
        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Login Button */}
        <Button
          label="Sign in"
          variant="primary"
          onPress={handleLogin}
          loading={loading}
          fullWidth
        />

        {/* Divider */}
        <View className="flex-row items-center gap-3 my-2">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-sm text-gray-400">or</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>


        {/* Signup Redirect */}
        <Pressable
          onPress={() => router.push('/auth/signup')}
          className="items-center mt-2"
        >
          <Text className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Text className="text-blue-600 font-medium">Sign up</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  )
}