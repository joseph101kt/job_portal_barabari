// apps/mobile/app/onboarding/role.tsx
// Only shown to OAuth users who signed in without a role

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { Button } from '@my-app/ui'
import { supabase } from '@my-app/supabase'

type Role = 'job_seeker' | 'job_poster'

export default function RolePickerScreen() {
  const router = useRouter()
  const [role,    setRole]    = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (!role) {
      Alert.alert('Please select a role to continue')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/auth/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id)

    if (error) {
      Alert.alert('Error', error.message)
      setLoading(false)
      return
    }

    // Route to role-specific details screen
    if (role === 'job_seeker') {
      router.replace('/onboarding/job-seeker')
    } else {
      router.replace('/onboarding/job-poster')
    }
    setLoading(false)
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-gray-900 mb-2">One quick thing</Text>
      <Text className="text-base text-gray-500 mb-10">
        Tell us how you'll be using the app so we can personalise your experience.
      </Text>

      <View className="gap-4 mb-8">
        <RoleCard
          label="Job Seeker"
          description="I'm looking for new opportunities and want to showcase my skills"
          icon="🔍"
          selected={role === 'job_seeker'}
          onPress={() => setRole('job_seeker')}
        />
        <RoleCard
          label="Job Poster"
          description="I'm hiring and want to find and interview great candidates"
          icon="🏢"
          selected={role === 'job_poster'}
          onPress={() => setRole('job_poster')}
        />
      </View>

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
  label, description, icon, selected, onPress,
}: {
  label: string; description: string; icon: string
  selected: boolean; onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`p-5 rounded-2xl border-2 flex-row items-center gap-4 ${
        selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <Text className="text-3xl">{icon}</Text>
      <View className="flex-1">
        <Text className={`text-base font-semibold mb-1 ${selected ? 'text-blue-700' : 'text-gray-800'}`}>
          {label}
        </Text>
        <Text className={`text-sm ${selected ? 'text-blue-500' : 'text-gray-400'}`}>
          {description}
        </Text>
      </View>
      <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
        selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
      }`}>
        {selected && <View className="w-2 h-2 rounded-full bg-white" />}
      </View>
    </Pressable>
  )
}