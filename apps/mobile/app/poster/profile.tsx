import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import {
  PageLayout, ProfileHeader, SectionHeader,
  Divider, Button, Input, Toast,
} from '@my-app/ui'
import {
  getProfile, updateProfile,
  getJobPoster, upsertJobPoster,
  getSupabase,
  type Profile, type JobPoster,
} from '@my-app/supabase'

// ───────────────── PROFILE VIEW ─────────────────

function PosterProfileView({ profile, poster, onEdit }: any) {
  return (
    <>
      <ProfileHeader
        name={profile?.full_name ?? 'Your Name'}
        avatarUri={profile?.avatar_url ?? undefined}
        headline={poster?.company ?? 'Your Company'}
        location={poster?.website ?? undefined}
        isOwn
        onEdit={onEdit}
      />

      <Divider />

      <View className="px-5 py-5 gap-5">

        <View className="gap-3">
          <SectionHeader title="Company" action={{ label: 'Edit', onPress: onEdit }} />

          {poster?.description ? (
            <Text className="text-sm text-neutral-600 dark:text-neutral-300">
              {poster.description}
            </Text>
          ) : (
            <Text className="text-neutral-400">+ Add company description</Text>
          )}
        </View>

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
    <ScrollView contentContainerClassName="px-5 py-5 gap-5">

      <SectionHeader title="Edit Profile" />

      <Input label="Full name" value={name} onChangeText={setName} />
      <Input label="Company" value={company} onChangeText={setCompany} />
      <Input label="Website" value={website} onChangeText={setWebsite} />

      <Input
        label="Company Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
      />

      <View className="flex-row gap-3 pt-4">
        <Button label="Cancel" variant="ghost" fullWidth onPress={onCancel} />
        <Button
          label="Save"
          fullWidth
          onPress={() =>
            onSave({ name, company, website, description })
          }
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

  async function load() {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return

    const [p, po] = await Promise.all([
      getProfile(user.id),
      getJobPoster(user.id),
    ])

    setProfile(p)
    setPoster(po)
    setLoading(false)
  }

  async function handleSave(data: any) {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return

    console.log('📦 Saving profile:', data)

    // update profile
    await updateProfile(user.id, {
      full_name: data.name,
    })

    // update poster
    const updatedPoster = await upsertJobPoster(user.id, {
      company: data.company,
      website: data.website,
      description: data.description,
    })

    setProfile(prev => prev ? { ...prev, full_name: data.name } : prev)
    setPoster(updatedPoster)

    Toast.showSuccess('Profile updated')
    setMode('profile')
  }

  if (loading) {
    return <PageLayout><View className="flex-1" /></PageLayout>
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