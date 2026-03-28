// apps/mobile/app/onboarding/job-seeker.tsx

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Alert, Pressable, ScrollView } from 'react-native'
import { Button, Input } from '@my-app/ui'
import { supabase } from '@my-app/supabase'

const AVAILABILITY_OPTIONS = [
  { label: 'Immediately',   value: 'immediately' },
  { label: 'In 2 weeks',    value: '2weeks'       },
  { label: 'In 1 month',    value: '1month'       },
  { label: 'Not looking',   value: 'not_looking'  },
]

export default function JobSeekerOnboarding() {
  const router = useRouter()
  const [fullName,     setFullName]     = useState('')
  const [headline,     setHeadline]     = useState('')
  const [location,     setLocation]     = useState('')
  const [availability, setAvailability] = useState<string | null>(null)
  const [loading,      setLoading]      = useState(false)

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name')
      return
    }
    if (!availability) {
      Alert.alert('Error', 'Please select your availability')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/login'); return }

    // Update profile name
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), onboarded: true })
      .eq('id', user.id)

    if (profileError) {
      Alert.alert('Error', profileError.message)
      setLoading(false)
      return
    }

    // Create job_seekers row
    const { error: seekerError } = await supabase
      .from('job_seekers')
      .upsert({
        id:           user.id,
        headline:     headline.trim() || null,
        location:     location.trim() || null,
        availability,
      })

    if (seekerError) {
      Alert.alert('Error', seekerError.message)
      setLoading(false)
      return
    }

    router.replace('/dashboard/seeker')
    setLoading(false)
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-12">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Set up your profile</Text>
      <Text className="text-base text-gray-500 mb-8">
        This helps employers understand who you are at a glance.
      </Text>

      <View className="gap-4 mb-6">
        <Input
          label="Full name *"
          placeholder="Jane Smith"
          value={fullName}
          onChangeText={setFullName}
        />
        <Input
          label="Headline"
          placeholder="Senior React Developer · Open to remote"
          value={headline}
          onChangeText={setHeadline}
          hint="A short tagline that appears on your profile"
        />
        <Input
          label="Location"
          placeholder="San Francisco, CA"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <Text className="text-sm font-medium text-gray-700 mb-3">Availability *</Text>
      <View className="gap-2 mb-8">
        {AVAILABILITY_OPTIONS.map(opt => (
          <Pressable
            key={opt.value}
            onPress={() => setAvailability(opt.value)}
            className={`flex-row items-center gap-3 p-4 rounded-xl border-2 ${
              availability === opt.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              availability === opt.value ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
            }`}>
              {availability === opt.value && (
                <View className="w-2 h-2 rounded-full bg-white" />
              )}
            </View>
            <Text className={`text-sm font-medium ${
              availability === opt.value ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button
        label="Complete setup"
        variant="primary"
        onPress={handleSave}
        loading={loading}
        fullWidth
      />

      <Text className="text-xs text-gray-400 text-center mt-4">
        You can edit all of this later from your profile settings.
      </Text>
    </ScrollView>
  )
}