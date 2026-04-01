// apps/mobile/app/onboarding/job-poster.tsx

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Button, Input, Toast } from '@my-app/ui'
import { supabase, upsertJobPoster, updateProfile } from '@my-app/supabase'

export default function JobPosterOnboarding() {
  const router = useRouter()

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  function stopLoading() {
    setLoading(false)
  }

  // ─────────────────────────────────────────────
  // SAVE HANDLER
  // ─────────────────────────────────────────────
  async function handleSave() {
    if (loading) return

    // ✅ Validation
    if (!fullName.trim()) {
      Toast.showError('Please enter your name')
      return
    }

    if (!company.trim()) {
      Toast.showError('Please enter your company name')
      return
    }

    setLoading(true)

    // 👤 Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('🚀 User:', user)

    if (!user) {
      Toast.showError('Session expired. Please login again.')
      router.replace('/auth/login')
      stopLoading()
      return
    }

    // 🧾 Step 1: Update profile (via query layer)
    const profile = await updateProfile(user.id, {
      full_name: fullName.trim(),
    })

    if (!profile) {
      console.error('❌ Profile update failed')
      Toast.showError('Profile update failed')
      stopLoading()
      return
    }

    console.log('✅ Profile updated')

    // 🏢 Step 2: Upsert job poster
    const payload = {
      company: company.trim(),
      industry: industry.trim() || null,
      website: website.trim() || null,
      description: description.trim() || null,
    }

    console.log('📦 Payload:', payload)

    const poster = await upsertJobPoster(user.id, payload)

    if (!poster) {
      console.error('❌ Job poster upsert failed:', payload)
      Toast.showError('Setup failed. Please try again.')
      stopLoading()
      return
    }

    console.log('✅ Job poster upserted:', poster)

    // ✅ Step 3: Mark onboarding complete
    const onboardProfile = await updateProfile(user.id, {
      onboarded: true,
    })

    if (!onboardProfile) {
      console.error('❌ Onboarding update failed')
      Toast.showError('Failed to complete onboarding')
      stopLoading()
      return
    }

    console.log('✅ Onboarding completed')

    // ✅ Success
    Toast.showSuccess('Setup complete!')
setTimeout(() => {
  supabase.auth.refreshSession()
}, 100)
    stopLoading()
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-neutral-900"
      contentContainerClassName="px-6 py-12"
    >
      {/* Header */}
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Set up your company
      </Text>

      <Text className="text-base text-gray-500 dark:text-gray-400 mb-8">
        Candidates will see this when you reach out.
      </Text>

      {/* Form */}
      <View className="gap-4 mb-8">
        <Input
          label="Your full name *"
          placeholder="Alex Johnson"
          value={fullName}
          onChangeText={setFullName}
        />

        <Input
          label="Company name *"
          placeholder="Acme Inc."
          value={company}
          onChangeText={setCompany}
        />

        <Input
          label="Industry"
          placeholder="Software / Fintech / Healthcare..."
          value={industry}
          onChangeText={setIndustry}
        />

        <Input
          label="Company website"
          placeholder="https://acme.com"
          value={website}
          onChangeText={setWebsite}
          keyboardType="url"
          autoCapitalize="none"
        />

        <Input
          label="Company description"
          placeholder="Brief description of what you do..."
          value={description}
          onChangeText={setDescription}
          hint="Optional — appears on your company profile"
        />
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
      <Text className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
        You can edit all of this later from your settings.
      </Text>
    </ScrollView>
  )
}