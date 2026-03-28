// apps/mobile/app/auth/login.tsx

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { Button, Input, Card } from '@my-app/ui'
import { supabase } from '@my-app/supabase'

export default function LoginScreen() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert('Login failed', error.message)
    // _layout.tsx onAuthStateChange handles redirect on success
    setLoading(false)
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'myapp://auth/callback' },
    })
    if (error) Alert.alert('Google login failed', error.message)
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome back</Text>
      <Text className="text-base text-gray-500 mb-8">Sign in to your account</Text>

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

        <Pressable onPress={() => router.push('/auth/signup')} className="items-center mt-2">
          <Text className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Text className="text-blue-600 font-medium">Sign up</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  )
}