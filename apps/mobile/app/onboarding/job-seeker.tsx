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

      const { data: seeker, error: seekerError } = await supabase
        .from('job_seekers')
        .select('headline, location, availability, resume_url, ai_summary')
        .eq('id', user.id)
        .single()

      if (seekerError && seekerError.code !== 'PGRST116') {
        console.error(seekerError)
      }

      setFullName(profile?.full_name ?? '')
      setHeadline(seeker?.headline ?? '')
      setLocation(seeker?.location ?? '')
      setAvailability(seeker?.availability ?? null)
      setResumeUrl(seeker?.resume_url ?? null)

      // unlock fields only once ai_summary is populated
      if (seeker?.ai_summary) {
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

      if (!user) {
        Toast.showError('Session expired. Please login again.')
        router.replace('/auth/login')
        return
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), onboarded: true })
        .eq('id', user.id)

      if (profileError) throw profileError

      const { error: seekerError } = await supabase
        .from('job_seekers')
        .upsert({
          id: user.id,
          headline: headline.trim() || null,
          location: location.trim() || null,
          availability,
          resume_url: resumeUrl || null,
        })

      if (seekerError) throw seekerError

      Toast.showSuccess('Profile setup complete!')
    } catch (err) {
      console.error(err)
      Toast.showError('Something went wrong')
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
            // ✅ file confirmed in picker → disable fields immediately
            onUploadStart={() => {
              setIsProcessingResume(true)
              setHasProcessedResume(false)
            }}
            // ✅ picker dismissed without picking → unlock immediately
            onCancel={() => {
              setIsProcessingResume(false)
              setHasProcessedResume(false)
            }}
            // ✅ extraction/AI/save failed → unlock + inform
            onError={() => {
              setIsProcessingResume(false)
              setHasProcessedResume(false) // ✅ add this
              Toast.showError('Upload failed. Please try again.')
            }}
            // ✅ DB saved → poll for ai_summary, then reload fields
            onSuccess={async () => {
              // isProcessingResume is already true from onUploadStart
              Toast.showSuccess('Resume uploaded. Processing...')

              let attempts = 0
              const maxAttempts = 8
              let isActive = true

              const interval = setInterval(async () => {
                if (!isActive) return

                attempts++

                const { data: seeker } = await supabase
                  .from('job_seekers')
                  .select('ai_summary')
                  .eq('id', userId)
                  .single()

                if (seeker?.ai_summary || attempts >= maxAttempts) {
                  isActive = false
                  clearInterval(interval)
                  await loadProfile()
                  // loadProfile sets isProcessingResume(false) when ai_summary exists;
                  // if we timed out without it, force-unlock here
                  if (!seeker?.ai_summary) {
                    setIsProcessingResume(false)
                    setHasProcessedResume(false)
                    Toast.showError('Processing timed out. Fill details manually.')
                  }
                  if (seeker?.ai_summary) {
                    setIsProcessingResume(false)
                    setHasProcessedResume(true)
                  }
                }
              }, 1500)

              // hard safety net — 15 s total
              setTimeout(() => {
                if (!isActive) return
                isActive = false
                clearInterval(interval)
                setIsProcessingResume(false)
                setHasProcessedResume(false)
              }, 15000)
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
            placeholder="Jane Smith"
            value={fullName}
            onChangeText={setFullName}
            editable={!isProcessingResume}
          />
          <Input
            label="Headline *"
            placeholder="Senior React Developer · Open to remote"
            value={headline}
            onChangeText={setHeadline}
            editable={!isProcessingResume}
          />
          <Input
            label="Location"
            placeholder="San Francisco, CA"
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
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
              }`}
            >
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
      </View>

      <Button
        label="Complete setup"
        variant="primary"
        onPress={handleSave}
        loading={loading}
        disabled={isProcessingResume}
        fullWidth
      />

      <Text className="text-xs text-gray-400 text-center mt-4 dark:text-gray-500">
        You can edit all of this later from your profile settings.
      </Text>
    </ScrollView>
  )
}