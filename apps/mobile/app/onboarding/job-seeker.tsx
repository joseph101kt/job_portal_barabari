// apps/mobile/app/onboarding/job-seeker.tsx

import { useRouter } from 'expo-router'
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Button, Input, Toast } from '@my-app/ui'
import { supabase } from '@my-app/supabase'
import { ResumeUploadButton } from '@my-app/features'

const AVAILABILITY_OPTIONS = [
  { label: 'Immediately', value: 'immediately' },
  { label: 'In 2 weeks', value: '2weeks' },
  { label: 'In 1 month', value: '1month' },
  { label: 'Not looking', value: 'not_looking' },
]

export default function JobSeekerOnboarding() {
  const router = useRouter()

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const [userId, setUserId] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [availability, setAvailability] = useState<string | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // ─────────────────────────────────────────────
  // LOAD PROFILE (HYDRATION)
  // ─────────────────────────────────────────────
  async function loadProfile() {
    try {
      console.log('🚀 Loading profile...')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log('👤 User:', user)

      if (!user) {
        Toast.showError('Session expired. Please login again.')
        router.replace('/auth/login')
        return
      }

      setUserId(user.id)

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError)
      }

      // Fetch job seeker
      const { data: seeker, error: seekerError } = await supabase
        .from('job_seekers')
        .select('headline, location, availability, resume_url')
        .eq('id', user.id)
        .single()

      if (seekerError && seekerError.code !== 'PGRST116') {
        console.error('❌ Seeker fetch error:', seekerError)
      }

      console.log('📦 Profile:', profile)
      console.log('📦 Seeker:', seeker)

      // Hydrate state
      setFullName(profile?.full_name ?? '')
      setHeadline(seeker?.headline ?? '')
      setLocation(seeker?.location ?? '')
      setAvailability(seeker?.availability ?? null)
      setResumeUrl(seeker?.resume_url ?? null)
    } catch (err) {
      console.error('❌ Load error:', err)
      Toast.showError('Failed to load profile')
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  // ─────────────────────────────────────────────
  // SAVE HANDLER
  // ─────────────────────────────────────────────
  async function handleSave() {
    try {
      if (!fullName.trim()) {
        Toast.showError('Please enter your name')
        return
      }

      if (!headline.trim()) {
        Toast.showError('Please enter your role / headline')
        return
      }

      if (!availability) {
        Toast.showError('Please select your availability')
        return
      }

      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log('👤 Saving for user:', user)

      if (!user) {
        Toast.showError('Session expired. Please login again.')
        router.replace('/auth/login')
        return
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          onboarded: true,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Upsert job seeker
      const payload = {
        id: user.id,
        headline: headline.trim() || null,
        location: location.trim() || null,
        availability,
        resume_url: resumeUrl || null,
      }

      console.log('📦 Payload:', payload)

      const { error: seekerError } = await supabase
        .from('job_seekers')
        .upsert(payload)

      if (seekerError) throw seekerError

      Toast.showSuccess('Profile setup complete!')
    } catch (err) {
      console.error('❌ Error:', err)
      Toast.showError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────
  if (initialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator />
        <Text className="mt-3 text-gray-500 dark:text-gray-400">
          Loading your profile...
        </Text>
      </View>
    )
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="px-6 py-12"
    >
      {/* Header */}
      <Text className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">
        Set up your profile
      </Text>

      <Text className="text-base text-gray-500 mb-6 dark:text-gray-400">
        Upload your resume or fill manually.
      </Text>

      {/* Resume Upload */}
      {userId && (
        <View className="mb-8">
          <ResumeUploadButton
            userId={userId}
            hasResume={!!resumeUrl}
            showStatus
            onSuccess={() => {
              console.log('🔁 Resume uploaded → refetching...')
              Toast.showSuccess('Resume processed!')
              loadProfile()
            }}
          />

          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            You can skip this and fill details manually
          </Text>
        </View>
      )}

      {/* Basic Info */}
      <View className="gap-4 mb-6">
        <Input
          label="Full name *"
          placeholder="Jane Smith"
          value={fullName}
          onChangeText={setFullName}
        />

        <Input
          label="Headline *"
          placeholder="Senior React Developer · Open to remote"
          value={headline}
          onChangeText={setHeadline}
        />

        <Input
          label="Location"
          placeholder="San Francisco, CA"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* Availability */}
      <Text className="text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">
        Availability *
      </Text>

      <View className="gap-2 mb-8">
        {AVAILABILITY_OPTIONS.map(opt => (
          <Pressable
            key={opt.value}
            onPress={() => setAvailability(opt.value)}
            className={`flex-row items-center gap-3 p-4 rounded-xl border-2 ${
              availability === opt.value
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
            }`}
          >
            {/* Radio */}
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                availability === opt.value
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {availability === opt.value && (
                <View className="w-2 h-2 rounded-full bg-white" />
              )}
            </View>

            {/* Label */}
            <Text
              className={`text-sm font-medium ${
                availability === opt.value
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Submit */}
      <Button
        label="Complete setup"
        variant="primary"
        onPress={handleSave}
        loading={loading}
        fullWidth
      />

      <Text className="text-xs text-gray-400 text-center mt-4 dark:text-gray-500">
        You can edit all of this later from your profile settings.
      </Text>
    </ScrollView>
  )
}