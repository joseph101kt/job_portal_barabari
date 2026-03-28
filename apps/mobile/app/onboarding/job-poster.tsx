// apps/mobile/app/onboarding/job-poster.tsx

import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, Alert, ScrollView } from 'react-native'
import { Button, Input } from '@my-app/ui'
import { supabase } from '@my-app/supabase'

export default function JobPosterOnboarding() {
  const router = useRouter()
  const [fullName,    setFullName]    = useState('')
  const [company,     setCompany]     = useState('')
  const [position,    setPosition]    = useState('')
  const [industry,    setIndustry]    = useState('')
  const [website,     setWebsite]     = useState('')
  const [description, setDescription] = useState('')
  const [loading,     setLoading]     = useState(false)

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name')
      return
    }
    if (!company.trim()) {
      Alert.alert('Error', 'Please enter your company name')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/login'); return }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), onboarded: true })
      .eq('id', user.id)

    if (profileError) {
      Alert.alert('Error', profileError.message)
      setLoading(false)
      return
    }

    const { error: posterError } = await supabase
      .from('job_posters')
      .upsert({
        id:          user.id,
        company:     company.trim(),
        industry:    industry.trim() || null,
        website:     website.trim()  || null,
        description: description.trim() || null,
      })

    if (posterError) {
      Alert.alert('Error', posterError.message)
      setLoading(false)
      return
    }

    router.replace('/dashboard/poster')
    setLoading(false)
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-12">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Set up your company</Text>
      <Text className="text-base text-gray-500 mb-8">
        Candidates will see this when you reach out.
      </Text>

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

      <Button
        label="Complete setup"
        variant="primary"
        onPress={handleSave}
        loading={loading}
        fullWidth
      />

      <Text className="text-xs text-gray-400 text-center mt-4">
        You can edit all of this later from your settings.
      </Text>
    </ScrollView>
  )
}