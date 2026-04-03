// apps/mobile/app/onboarding/job-seeker.tsx

/**
 * Job Seeker Onboarding Screen
 * ----------------------------------------
 * Shown after:
 * - Role selection (job_seeker)
 *
 * Handles:
 * - Basic candidate profile setup
 * - Availability selection
 * - Creating job_seekers record
 * - Marking onboarding complete
 *
 * UX Notes:
 * - Uses Toast (no Alert)
 * - Minimal required fields (name, availability)
 * - Clean selectable UI for availability
 *
 * Future Enhancements:
 * - Resume upload + OCR parsing
 * - Skills auto-fill
 * - Experience extraction
 *
 * Dependencies:
 * - expo-router (navigation)
 * - supabase (auth + db)
 * - @my-app/ui (Button, Input, Toast)
 */

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Button, Input, Toast } from '@my-app/ui'
import { supabase } from '@my-app/supabase'

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
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [availability, setAvailability] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ─────────────────────────────────────────────
  // SAVE HANDLER
  // ─────────────────────────────────────────────
  async function handleSave() {
    // ✅ Validation
    if (!fullName.trim()) {
      Toast.showError('Please enter your name')
      return
    }

    if (!availability) {
      Toast.showError('Please select your availability')
      return
    }

    setLoading(true)

    // 👤 Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      Toast.showError('Session expired. Please login again.')
      router.replace('/auth/login')
      setLoading(false)
      return
    }

    // 🧾 Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        onboarded: true,
      })
      .eq('id', user.id)

    if (profileError) {
      Toast.showError(profileError.message, 'Profile update failed')
      setLoading(false)
      return
    }

    // 👤 Create / update job seeker record
    const { error: seekerError } = await supabase
      .from('job_seekers')
      .upsert({
        id: user.id,
        headline: headline.trim() || null,
        location: location.trim() || null,
        availability,
      })

    if (seekerError) {
      Toast.showError(seekerError.message, 'Profile setup failed')
      setLoading(false)
      return
    }

    // ✅ Success
    Toast.showSuccess('Profile setup complete!')

    // 🚀 Navigate to dashboard
    router.replace('/seeker/jobs')

    setLoading(false)
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="px-6 py-12"
    >
      {/* Header */}
      <Text className="text-3xl font-bold text-gray-900 mb-2">
        Set up your profile
      </Text>

      <Text className="text-base text-gray-500 mb-8">
        This helps employers understand who you are at a glance.
      </Text>

      {/* Basic Info */}
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

      {/* Availability */}
      <Text className="text-sm font-medium text-gray-700 mb-3">
        Availability *
      </Text>

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
            {/* Radio */}
            <View
              className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                availability === opt.value
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
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
                  ? 'text-blue-700'
                  : 'text-gray-700'
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

      {/* Footer */}
      <Text className="text-xs text-gray-400 text-center mt-4">
        You can edit all of this later from your profile settings.
      </Text>
    </ScrollView>
  )
}