// apps/mobile/app/auth/signup.tsx

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { Button, Input } from '@my-app/ui'
import { supabase } from '@my-app/supabase'
    
type Role = 'job_seeker' | 'job_poster'

export default function SignupScreen() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState<Role>('job_seeker')
  const [loading,  setLoading]  = useState(false)

  async function handleSignup() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },   // passed to handle_new_user trigger
      },
    })

    if (error) {
      Alert.alert('Signup failed', error.message)
    } else {
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Click it to activate your account.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      )
    }
    setLoading(false)
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Create account</Text>
      <Text className="text-base text-gray-500 mb-8">Get started on your journey</Text>

      {/* Role picker */}
      <Text className="text-sm font-medium text-gray-700 mb-3">I am a...</Text>
      <View className="flex-row gap-3 mb-6">
        <RoleCard
          label="Job Seeker"
          description="Looking for opportunities"
          icon="🔍"
          selected={role === 'job_seeker'}
          onPress={() => setRole('job_seeker')}
        />
        <RoleCard
          label="Job Poster"
          description="Hiring talent"
          icon="🏢"
          selected={role === 'job_poster'}
          onPress={() => setRole('job_poster')}
        />
      </View>

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
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          label="Create account"
          variant="primary"
          onPress={handleSignup}
          loading={loading}
          fullWidth
        />

        <Pressable onPress={() => router.push('/auth/login')} className="items-center">
          <Text className="text-sm text-gray-500">
            Already have an account?{' '}
            <Text className="text-blue-600 font-medium">Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

function RoleCard({
  label, description, icon, selected, onPress,
}: {
  label: string; description: string; icon: string
  selected: boolean; onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 p-4 rounded-2xl border-2 items-center gap-2 ${
        selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <Text className="text-2xl">{icon}</Text>
      <Text className={`text-sm font-semibold ${selected ? 'text-blue-700' : 'text-gray-800'}`}>
        {label}
      </Text>
      <Text className={`text-xs text-center ${selected ? 'text-blue-500' : 'text-gray-400'}`}>
        {description}
      </Text>
    </Pressable>
  )
}