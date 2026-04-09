'use client'

import { Stack, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Button, Toast } from '@my-app/ui'
import { supabase } from '@my-app/supabase'

type Role = 'job_seeker' | 'job_poster'

export default function RolePickerScreen() {
  const router = useRouter()

  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (!role) {
      Toast.showError('Please select a role to continue')
      return
    }

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      Toast.showError('Session expired. Please login again.')
      router.replace('/auth/login')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id)

    if (error) {
      Toast.showError(error.message, 'Failed to save role')
      setLoading(false)
      return
    }

    Toast.showSuccess('Role saved successfully')

    if (role === 'job_seeker') {
      router.replace('/onboarding/job-seeker')
    } else {
      router.replace('/onboarding/job-poster')
    }

    setLoading(false)
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white dark:bg-neutral-900">
      <Stack.Screen options={{ title: 'Onboarding' }} />

      {/* Header */}
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        One quick thing
      </Text>

      <Text className="text-base text-gray-500 dark:text-gray-400 mb-10">
        Tell us how you'll be using the app so we can personalise your experience.
      </Text>

      {/* Role Options */}
      <View className="gap-4 mb-8">
        <RoleCard
          label="Job Seeker"
          description="I'm looking for opportunities and want to showcase my skills"
          icon="🔍"
          selected={role === 'job_seeker'}
          onPress={() => setRole('job_seeker')}
        />

        <RoleCard
          label="Job Poster"
          description="I'm hiring and want to find great candidates"
          icon="🏢"
          selected={role === 'job_poster'}
          onPress={() => setRole('job_poster')}
        />
      </View>

      {/* Continue Button */}
      <Button
        label="Continue"
        variant="primary"
        onPress={handleContinue}
        loading={loading}
        disabled={!role}
        fullWidth
      />
    </View>
  )
}

function RoleCard({
  label,
  description,
  icon,
  selected,
  onPress,
}: {
  label: string
  description: string
  icon: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`p-5 rounded-2xl border-2 flex-row items-center gap-4 ${
        selected
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
          : 'border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
      }`}
    >
      {/* Icon */}
      <Text className="text-3xl">{icon}</Text>

      {/* Text Content */}
      <View className="flex-1">
        <Text
          className={`text-base font-semibold mb-1 ${
            selected
              ? 'text-blue-700 dark:text-blue-400'
              : 'text-gray-800 dark:text-white'
          }`}
        >
          {label}
        </Text>

        <Text
          className={`text-sm ${
            selected
              ? 'text-blue-500 dark:text-blue-300'
              : 'text-gray-400 dark:text-gray-400'
          }`}
        >
          {description}
        </Text>
      </View>

      {/* Selection Indicator */}
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
          selected
            ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500'
            : 'border-gray-300 dark:border-neutral-600'
        }`}
      >
        {selected && <View className="w-2 h-2 rounded-full bg-white" />}
      </View>
    </Pressable>
  )
}