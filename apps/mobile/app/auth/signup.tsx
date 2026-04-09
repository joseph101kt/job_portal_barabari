// apps/mobile/app/auth/signup.tsx

/**
 * Signup Screen
 * ----------------------------------------
 * Handles:
 * - Email/password registration
 * - Profile creation in DB
 * - Validation + error handling using Toast
 *
 * UX Notes:
 * - Uses Toast for all feedback (no Alert)
 * - Validates password length
 * - Prevents empty submissions
 * - Automatically creates user profile
 *
 * Dependencies:
 * - expo-router (navigation)
 * - supabase (auth + db)
 * - @my-app/ui (Button, Input, Toast)
 */

import { Stack, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Button, Input, Toast } from '@my-app/ui'
import { supabase } from '@my-app/supabase'

type Role = 'job_seeker' | 'job_poster'

export default function SignupScreen() {
  const router = useRouter()

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // ─────────────────────────────────────────────
  // SIGNUP HANDLER
  // ─────────────────────────────────────────────
  async function handleSignup() {
    // ✅ Validation
    if (!email || !password) {
      Toast.showError('Please fill in all fields', 'Missing details')
      return
    }

    if (password.length < 6) {
      Toast.showError('Password must be at least 6 characters', 'Weak password')
      return
    }

    setLoading(true)

    // 🔐 Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    // ❌ Auth error
    if (error) {
      if (error.message.includes('already registered')) {
        Toast.showError('This email is already registered', 'Signup failed')
      } else {
        Toast.showError(error.message, 'Signup failed')
      }

      setLoading(false)
      return
    }

    const user = data.user

    // ❌ Edge case
    if (!user) {
      Toast.showError('User not returned after signup', 'Error')
      setLoading(false)
      return
    }

    // 🧾 Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
      })

    if (profileError) {
      Toast.showError(profileError.message, 'Profile error')
      setLoading(false)
      return
    }

    // ✅ Success
    Toast.showSuccess('Account created successfully', 'Welcome!')

    // 🚀 Navigate to app
    router.replace('/onboarding/role')

    setLoading(false)
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
return (
  <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
    <Stack.Screen options={{ title: 'SignUp' }} />

    {/* Header */}
    <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      Create account
    </Text>
    <Text className="text-base text-gray-500 dark:text-gray-400 mb-8">
      Get started on your journey
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
        placeholder="At least 6 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Signup Button */}
      <Button
        label="Create account"
        variant="primary"
        onPress={handleSignup}
        loading={loading}
        fullWidth
      />

      {/* Login Redirect */}
      <Pressable
        onPress={() => router.push('/auth/login')}
        className="items-center"
      >
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Text className="text-blue-600 dark:text-blue-400 font-medium">
            Sign in
          </Text>
        </Text>
      </Pressable>
    </View>
  </View>
)
}
