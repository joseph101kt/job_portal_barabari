// apps/mobile/app/auth/login.tsx

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Button, Input, useFeedback } from '@my-app/ui'
import { supabase } from '@my-app/supabase'

export default function LoginScreen() {
  const router = useRouter()
  const { showError, showSuccess, logEvent } = useFeedback()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      showError('Missing details', 'Please enter your email and password')
      return
    }

    setLoading(true)
    logEvent('Auth', 'Attempting login...')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      logEvent('Auth', `Login error: ${error.message}`)

      // 🔥 Friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        showError(
          'Login failed',
          'Incorrect email or password. Please try again.'
        )
      } else if (error.message.includes('Email not confirmed')) {
        showError(
          'Email not verified',
          'Please verify your email before logging in.'
        )
      } else {
        showError(
          'Login failed',
          'Something went wrong. Please try again.'
        )
      }

      setLoading(false)
      return
    }

    // ✅ Safety check (handles deleted users / broken sessions)
    if (!data.user) {
      await supabase.auth.signOut()
      showError('Session error', 'User not found. Please sign up again.')
      setLoading(false)
      return
    }

    logEvent('Auth', `Login success: ${data.user.email}`)
    showSuccess('Welcome back!', 'Login successful')

    // Redirect handled by _layout, but you can force:
    // router.replace('/')

    setLoading(false)
  }

  async function handleGoogleLogin() {
    logEvent('Auth', 'Google login started')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'myapp://auth/callback' },
    })

    if (error) {
      logEvent('Auth', `Google login error: ${error.message}`)
      showError('Google login failed', 'Please try again.')
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-gray-900 mb-2">
        Welcome back
      </Text>
      <Text className="text-base text-gray-500 mb-8">
        Sign in to your account
      </Text>

      <View className="gap-4">
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          label="Sign in"
          variant="primary"
          onPress={handleLogin}
          loading={loading}
          fullWidth
        />

        <View className="flex-row items-center gap-3 my-2">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-sm text-gray-400">or</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        <Button
          label="Continue with Google"
          variant="outline"
          onPress={handleGoogleLogin}
          fullWidth
        />

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