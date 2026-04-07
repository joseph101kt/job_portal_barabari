import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import {
  PageLayout, ProfileHeader, SectionHeader,
  Divider, Button, Input, Toast, ThemeToggle,
} from '@my-app/ui'
import {
  getProfile, updateProfile,
  getJobPoster, upsertJobPoster,
  getSupabase,
  type Profile, type JobPoster,
} from '@my-app/supabase'
import { Stack } from 'expo-router'

// ───────────────── PROFILE VIEW ─────────────────

function PosterProfileView({ profile, poster, onEdit, onSignOut }: any) {
  return (
    <>
      <ProfileHeader
        name={profile?.full_name ?? 'Your Name'}
        avatarUri={profile?.avatar_url ?? undefined}
        headline={poster?.company ?? 'Add your company'}
        location={poster?.website ?? undefined}
        isOwn
        onEdit={onEdit}
      />
      <Stack.Screen options={{ title: 'Profile' }} />

      <Divider />

      <View className="px-5 py-6 gap-8">

        {/* Company */}
        <View className="gap-3">
          <SectionHeader title="Company" />

          <View
            className="p-4 rounded-2xl
            bg-white dark:bg-neutral-900
            border border-neutral-200 dark:border-neutral-700"
          >
            {poster?.description ? (
              <Text className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {poster.description}
              </Text>
            ) : (
              <Text className="text-neutral-500">
                + Add company description to attract candidates
              </Text>
            )}
          </View>
        </View>

        {/* Company Info (NEW — adds structure like seeker sections) */}
        <View className="gap-3">
          <SectionHeader title="Details" />

          <View
            className="p-4 rounded-2xl
            bg-white dark:bg-neutral-900 
            border border-neutral-200 dark:border-neutral-700
            gap-2"
          >
            <View>
              <Text className="text-xs text-neutral-500">Company</Text>
              <Text className="text-base font-semibold dark:text-neutral-200">
                {poster?.company || 'Not set'}
              </Text>
            </View>

            <View>
              <Text className="text-xs text-neutral-500">Website</Text>
              <Text className="text-neutral-700 dark:text-neutral-300">
                {poster?.website || 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View className="gap-3 p-2">
          <SectionHeader title="Appearance" />
            <ThemeToggle />
        </View>

      </View>

      {/* Sign Out */}
      <View className="px-5 pb-6">
        <Button
          className="bg-red-600 border-red-500"
          label="Sign Out"
          onPress={onSignOut}
        />
      </View>
    </>
  )
}
// ───────────────── EDIT VIEW ─────────────────

function PosterProfileEdit({ profile, poster, onCancel, onSave }: any) {
  const [name, setName] = useState(profile?.full_name ?? '')
  const [company, setCompany] = useState(poster?.company ?? '')
  const [website, setWebsite] = useState(poster?.website ?? '')
  const [description, setDescription] = useState(poster?.description ?? '')

  return (
    <ScrollView contentContainerClassName="px-5 py-6 gap-8">

      <SectionHeader title="Edit Profile" />

      {/* Basic Info */}
      <View className="gap-4">
        <Input label="Full name" value={name} onChangeText={setName} />
        <Input label="Company" value={company} onChangeText={setCompany} />
        <Input label="Website" value={website} onChangeText={setWebsite} />
      </View>

      {/* Description */}
      <View className="gap-3">
        <SectionHeader title="Company Description" />

        <Input
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
        />
      </View>

      {/* ACTIONS */}
      <View className="flex-col gap-3 pt-4">

        <Button
          label="Save Profile"
          onPress={() =>
            onSave({ name, company, website, description })
          }
        />
      </View>
      <View className="flex-col gap-3 pt-4">
        <Button
          label="Cancel"
          onPress={onCancel}
        />
      </View>

    </ScrollView>
  )
}
// ───────────────── MAIN SCREEN ─────────────────

export default function PosterProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [poster, setPoster] = useState<JobPoster | null>(null)
  const [loading, setLoading] = useState(true)

  const [mode, setMode] = useState<'profile' | 'edit'>('profile')

  useEffect(() => { load() }, [])

  async function handleSignOut() {
  try {
    await getSupabase().auth.signOut()
    Toast.showSuccess('Signed out')
  } catch (err) {
    console.error(err)
    Toast.showError('Failed to sign out')
  }
}

  async function load() {
    try {
      const { data: { user } } = await getSupabase().auth.getUser()
      if (!user) return

      const [p, po] = await Promise.all([
        getProfile(user.id),
        getJobPoster(user.id),
      ])

      setProfile(p)
      setPoster(po)
    } catch (err) {
      console.error('❌ load profile error:', err)
      Toast.showError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(data: any) {
    try {
      const { data: { user } } = await getSupabase().auth.getUser()
      if (!user) return

      console.log('📦 Saving profile:', data)

      // update profile
      const updatedProfile = await updateProfile(user.id, {
        full_name: data.name,
      })

      // update poster
      const updatedPoster = await upsertJobPoster(user.id, {
        company: data.company,
        website: data.website,
        description: data.description,
      })

      if (!updatedPoster) throw new Error('Poster update failed')

      setProfile(updatedProfile ?? profile)
      setPoster(updatedPoster)

      Toast.showSuccess('Profile updated')
      setMode('profile')

    } catch (err) {
      console.error('❌ save failed:', err)
      Toast.showError('Failed to update profile')
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <View className="flex-1" />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      header={{
        title: mode === 'profile' ? 'Profile' : 'Edit Profile',
      }}
      noPad
      noScroll={mode !== 'edit'}
    >

      {mode === 'profile' && (
        <ScrollView>
<PosterProfileView
  profile={profile}
  poster={poster}
  onEdit={() => setMode('edit')}
  onSignOut={handleSignOut}   // 👈 add this
/>
        </ScrollView>
      )}

      {mode === 'edit' && (
        <PosterProfileEdit
          profile={profile}
          poster={poster}
          onCancel={() => setMode('profile')}
          onSave={handleSave}
        />
      )}

    </PageLayout>
  )
}