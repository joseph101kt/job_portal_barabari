// apps/mobile/app/onboarding/job-poster.tsx

/**
 * Job Poster Onboarding Screen
 * ----------------------------------------
 * Shown after:
 * - Role selection (job_poster)
 *
 * Handles:
 * - Collecting company + recruiter info
 * - Updating profile + job_posters table
 * - Marking onboarding as complete
 *
 * UX Notes:
 * - Uses Toast (no Alert)
 * - Minimal required fields (name, company)
 * - Optional enrichment fields
 * - Clean, scrollable form
 *
 * Dependencies:
 * - expo-router (navigation)
 * - supabase (auth + db)
 * - @my-app/ui (Button, Input, Toast)
 */

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Button, Input, Toast } from '@my-app/ui'
import { supabase } from '@my-app/supabase'

export default function JobPosterOnboarding() {
  const router = useRouter()

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
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

    if (!company.trim()) {
      Toast.showError('Please enter your company name')
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

    // 🏢 Upsert job poster data
    const { error: posterError } = await supabase
      .from('job_posters')
      .upsert({
        id: user.id,
        company: company.trim(),
        industry: industry.trim() || null,
        website: website.trim() || null,
        description: description.trim() || null,
        // 🔥 future-ready
        position: position.trim() || null,
      })

    if (posterError) {
      Toast.showError(posterError.message, 'Company setup failed')
      setLoading(false)
      return
    }

    // ✅ Success
    Toast.showSuccess('Setup complete!')

    // 🚀 Navigate to dashboard
    router.replace('/poster/dashboard')

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
        Set up your company
      </Text>

      <Text className="text-base text-gray-500 mb-8">
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
          label="Your position"
          placeholder="Head of Engineering"
          value={position}
          onChangeText={setPosition}
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
      <Text className="text-xs text-gray-400 text-center mt-4">
        You can edit all of this later from your settings.
      </Text>
    </ScrollView>
  )
}