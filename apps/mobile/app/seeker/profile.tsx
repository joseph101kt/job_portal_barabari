// apps/mobile/app/seeker/profile.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import {
  PageLayout, ProfileHeader, Card, Badge, Tag,
  SectionHeader, Divider, Button, ProfileCompletion,
} from '@my-app/ui'
import {
  getProfile, getJobSeeker, getSupabase,
  type Profile, type JobSeeker,
} from '@my-app/supabase'

type Section = {
  title:    string
  emoji:    string
  editPath: string
  empty:    string
  content:  React.ReactNode
}

export default function SeekerProfileScreen() {
  const router = useRouter()
  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [seeker,   setSeeker]   = useState<JobSeeker | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return
    const [p, s] = await Promise.all([
      getProfile(user.id),
      getJobSeeker(user.id),
    ])
    setProfile(p)
    setSeeker(s)
    setLoading(false)
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await getSupabase().auth.signOut()
          router.replace('/auth/login')
        },
      },
    ])
  }

  const completionTasks = [
    { label: 'Add your headline',    done: !!seeker?.headline,     onPress: () => router.push('/seeker/edit/basics') },
    { label: 'Add your location',    done: !!seeker?.location,     onPress: () => router.push('/seeker/edit/basics') },
    { label: 'Upload your resume',   done: !!seeker?.resume_url,   onPress: () => router.push('/seeker/edit/resume') },
    { label: 'Add work experience',  done: false,                  onPress: () => router.push('/seeker/edit/experience') },
    { label: 'Add your skills',      done: false,                  onPress: () => router.push('/seeker/edit/skills') },
  ]

  if (loading) return <PageLayout><View className="flex-1" /></PageLayout>

  return (
    <PageLayout noScroll noPad>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-24">
        {/* Profile header */}
        <ProfileHeader
          name={profile?.full_name ?? 'Your Name'}
          avatarUri={profile?.avatar_url ?? undefined}
          headline={seeker?.headline ?? undefined}
          location={seeker?.location ?? undefined}
          availability={seeker?.availability ?? undefined}
          isOwn
          onEdit={() => router.push('/seeker/edit/basics')}
        />

        <Divider />

        <View className="px-5 py-5 gap-5">
          {/* Completion card */}
          <ProfileCompletion
            tasks={completionTasks}
          />

          {/* AI Summary */}
          {seeker?.ai_summary && (
            <View className="gap-3">
              <SectionHeader
                title="AI Profile Summary"
                action={{ label: 'Refresh', onPress: () => {} }}
              />
              <Card elevation="flat" className="bg-primary-50 border-primary-100">
                <Text className="text-sm text-primary-800 leading-relaxed">
                  {(seeker.ai_summary as { summary?: string }).summary ?? JSON.stringify(seeker.ai_summary)}
                </Text>
              </Card>
            </View>
          )}

          {/* Bio */}
          <View className="gap-3">
            <SectionHeader
              title="About"
              action={{ label: 'Edit', onPress: () => router.push('/seeker/edit/basics') }}
            />
            {seeker?.bio ? (
              <Text className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {seeker.bio}
              </Text>
            ) : (
              <Pressable
                onPress={() => router.push('/seeker/edit/basics')}
                className="border-2 border-dashed border-neutral-200 rounded-2xl py-4 items-center"
              >
                <Text className="text-sm text-neutral-400">+ Add a bio</Text>
              </Pressable>
            )}
          </View>

          <Divider />

          {/* Sections with add prompts */}
          {[
            {
              title: 'Skills',
              emoji: '⚡',
              editPath: '/seeker/edit/skills',
              empty: '+ Add skills',
            },
            {
              title: 'Experience',
              emoji: '💼',
              editPath: '/seeker/edit/experience',
              empty: '+ Add work experience',
            },
            {
              title: 'Education',
              emoji: '🎓',
              editPath: '/seeker/edit/education',
              empty: '+ Add education',
            },
            {
              title: 'Projects',
              emoji: '🚀',
              editPath: '/seeker/edit/projects',
              empty: '+ Add projects',
            },
            {
              title: 'Certifications',
              emoji: '🏆',
              editPath: '/seeker/edit/certifications',
              empty: '+ Add certifications',
            },
          ].map(section => (
            <View key={section.title} className="gap-3">
              <SectionHeader
                title={section.emoji + ' ' + section.title}
                action={{ label: 'Add', onPress: () => router.push(section.editPath as any) }}
              />
              <Pressable
                onPress={() => router.push(section.editPath as any)}
                className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl py-4 items-center active:opacity-70"
              >
                <Text className="text-sm text-neutral-400">{section.empty}</Text>
              </Pressable>
            </View>
          ))}

          <Divider />

          {/* Sign out */}
          <Button
            label="Sign out"
            variant="danger"
            size="md"
            fullWidth
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>
    </PageLayout>
  )
}