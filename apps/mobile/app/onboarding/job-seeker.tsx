
// apps/mobile/app/onboarding/job-seeker.tsx

import { Stack, useRouter } from 'expo-router'
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

  const [userId, setUserId] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [availability, setAvailability] = useState<string | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isProcessingResume, setIsProcessingResume] = useState(false)
  const [hasProcessedResume, setHasProcessedResume] = useState(false)

  async function loadProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        Toast.showError('Session expired. Please login again.')
        router.replace('/auth/login')
        return
      }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const { data: seeker } = await supabase
        .from('job_seekers')
        .select('headline, location, availability, resume_url, ai_summary')
        .eq('id', user.id)
        .maybeSingle()

      setFullName(profile?.full_name ?? '')
      setHeadline(seeker?.headline ?? '')
      setLocation(seeker?.location ?? '')
      setAvailability(seeker?.availability ?? null)
      setResumeUrl(seeker?.resume_url ?? null)

      console.log('[UI LOAD PROFILE seeker]', seeker)

      // ✅ FIX: unlock UI if ANY resume data exists (not just ai_summary)
      if (seeker?.headline || seeker?.location || seeker?.ai_summary) {
        setIsProcessingResume(false)
        setHasProcessedResume(true)
      }
    } catch (err) {
      console.error(err)
      Toast.showError('Failed to load profile')
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  type JobSeekerPayload = {
    id: string
    headline: string | null
    location: string | null
    availability: string
    resume_url: string | null
  }

  async function handleSave(): Promise<void> {
    try {
      if (!fullName.trim()) throw new Error('NAME_REQUIRED')
      if (!headline.trim()) throw new Error('HEADLINE_REQUIRED')
      if (!availability) throw new Error('AVAILABILITY_REQUIRED')

      setLoading(true)

      const { data, error: userError } = await supabase.auth.getUser()
      if (userError || !data.user) throw new Error('AUTH_EXPIRED')

      const user = data.user

      const profileUpdate = supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          onboarded: true,
        })
        .eq('id', user.id)

      const seekerPayload: JobSeekerPayload = {
        id: user.id,
        headline: headline.trim() || null,
        location: location.trim() || null,
        availability,
        resume_url: resumeUrl || null,
      }

      const seekerUpsert = supabase
        .from('job_seekers')
        .upsert(seekerPayload)

      const [profileRes, seekerRes] = await Promise.all([
        profileUpdate,
        seekerUpsert,
      ])

      if (profileRes.error) throw profileRes.error
      if (seekerRes.error) throw seekerRes.error

      Toast.showSuccess('Profile setup complete!')
      router.replace('/seeker/jobs')
    } catch (err: unknown) {
      console.error(err)

      if (err instanceof Error) {
        switch (err.message) {
          case 'NAME_REQUIRED':
            return Toast.showError('Please enter your name')
          case 'HEADLINE_REQUIRED':
            return Toast.showError('Please enter your role')
          case 'AVAILABILITY_REQUIRED':
            return Toast.showError('Select availability')
          case 'AUTH_EXPIRED':
            router.replace('/auth/login')
            return Toast.showError('Session expired')
        }
      }

      Toast.showError('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="px-6 py-12"
    >
      <Stack.Screen options={{ title: 'Onboarding' }} />

      <Text className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">
        Set up your profile
      </Text>

      <Text className="text-base text-gray-500 mb-6 dark:text-gray-400">
        Upload your resume or fill manually.
      </Text>

      {userId && (
        <View className="mb-8">
          <ResumeUploadButton
            userId={userId}
            hasResume={!!resumeUrl}
            showStatus
            onUploadStart={() => {
              setIsProcessingResume(true)
              setHasProcessedResume(false)
            }}
            onCancel={() => {
              setIsProcessingResume(false)
              setHasProcessedResume(false)
            }}
            onError={() => {
              setIsProcessingResume(false)
              setHasProcessedResume(false)
              Toast.showError('Upload failed. Please try again.')
            }}
            onSuccess={async () => {
              Toast.showSuccess('Resume uploaded')

              // ✅ IMMEDIATE UI UPDATE (critical fix)
              await loadProfile()
              setIsProcessingResume(false)
              setHasProcessedResume(true)

              // ✅ optional polling for AI summary only
              let attempts = 0
              const maxAttempts = 6

              const interval = setInterval(async () => {
                attempts++

                const { data: seeker } = await supabase
                  .from('job_seekers')
                  .select('ai_summary')
                  .eq('id', userId)
                  .single()

                if (seeker?.ai_summary || attempts >= maxAttempts) {
                  clearInterval(interval)
                  await loadProfile()
                }
              }, 2000)
            }}
          />

          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            You can skip this and fill details manually
          </Text>
        </View>
      )}

      {isProcessingResume && (
        <Text className="text-xs text-blue-500 mb-4">
          Processing resume and filling your details...
        </Text>
      )}

      {hasProcessedResume && !isProcessingResume && (
        <Text className="text-xs text-green-600 mb-4">
          Details auto-filled from your resume. You can edit them.
        </Text>
      )}

      <View style={{ opacity: isProcessingResume ? 0.5 : 1 }}>
        <View className="gap-4 mb-6">
          <Input
            label="Full name *"
            value={fullName}
            onChangeText={setFullName}
            editable={!isProcessingResume}
          />
          <Input
            label="Headline *"
            value={headline}
            onChangeText={setHeadline}
            editable={!isProcessingResume}
          />
          <Input
            label="Location"
            value={location}
            onChangeText={setLocation}
            editable={!isProcessingResume}
          />
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">
          Availability *
        </Text>

        <View className="gap-2 mb-8">
          {AVAILABILITY_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              disabled={isProcessingResume}
              onPress={() => setAvailability(opt.value)}
              className={`flex-row items-center gap-3 p-4 rounded-xl border-2 ${
                availability === opt.value
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-gray-300'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
              }`}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center  dark:text-gray-300${
                  availability === opt.value
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {availability === opt.value && (
                  <View className="w-2 h-2 rounded-full bg-white dark:text-gray-300" />
                )}
              </View>
              <Text className="text-sm font-medium dark:text-gray-300">
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Button
        label="Complete setup"
        variant="primary"
        onPress={handleSave}
        loading={loading}
        disabled={isProcessingResume && !hasProcessedResume} // ✅ FIX
        fullWidth
      />

      <Text className="text-xs text-gray-400 text-center mt-4 dark:text-gray-500">
        You can edit all of this later from your profile settings.
      </Text>
    </ScrollView>
  )
}
