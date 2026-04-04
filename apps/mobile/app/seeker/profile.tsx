import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import {
  PageLayout, ProfileHeader, Card,
  SectionHeader, Divider, Button, Input,
  Toast,
  ApplicationCard,
} from '@my-app/ui'
import {
  getProfile, getJobSeeker, getSupabase,
  type Profile, type JobSeeker,
  getMyApplications,
} from '@my-app/supabase'
import { useWindowDimensions } from 'react-native'

import { ResumeUploadButton } from '../uploadResumeBtn'
// ───────────────── PROFILE VIEW ─────────────────

function ProfileView({ profile, seeker, onEdit, userId, onRefresh }: any) {
  return (
    <>
      <ProfileHeader
        name={profile?.full_name ?? 'Your Name'}
        avatarUri={profile?.avatar_url ?? undefined}
        headline={seeker?.headline ?? undefined}
        location={seeker?.location ?? undefined}
        availability={seeker?.availability ?? undefined}
        isOwn
        onEdit={onEdit}
      />

      <Divider />

      <View className="px-5 pt-4">
  <ResumeUploadButton
    userId={userId}
    hasResume={!!seeker?.headline}
    showStatus
    onSuccess={() => {
      console.log('✅ Resume updated → refreshing profile')
      onRefresh?.()
    }}
    onError={(err) => {
      console.error('❌ Resume upload failed:', err)
    }}
  />
</View>

      <View className="px-5 py-5 gap-5">
        <View className="gap-3">
          <SectionHeader
            title="About"
            action={{ label: 'Edit', onPress: onEdit }}
          />

          {seeker?.bio ? (
            <Text className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {seeker.bio}
            </Text>
          ) : (
            <Pressable
              onPress={onEdit}
              className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl py-4 items-center"
            >
              <Text className="text-sm text-neutral-400 dark:text-neutral-500">
                + Add bio
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </>
  )
}

// ───────────────── API HELPERS ─────────────────

async function updateProfile(userId: string, data: { full_name: string }) {
  const { error } = await getSupabase()
    .from('profiles')
    .update(data)
    .eq('id', userId)

  if (error) throw error
}

async function updateJobSeeker(userId: string, data: Partial<JobSeeker>) {
  const { error } = await getSupabase()
    .from('job_seekers')
    .update(data)
    .eq('id', userId)

  if (error) throw error
}

// ───────────────── EDIT VIEW ─────────────────

function ProfileEdit({ profile, seeker, onCancel, onSave }: any) {
  const [name, setName] = useState(profile?.full_name ?? '')
  const [headline, setHeadline] = useState(seeker?.headline ?? '')
  const [location, setLocation] = useState(seeker?.location ?? '')
  const [bio, setBio] = useState(seeker?.bio ?? '')

  return (
    <ScrollView
      contentContainerClassName="px-5 py-5 gap-5 bg-white dark:bg-neutral-900"
      showsVerticalScrollIndicator={false}
    >
      <SectionHeader title="Edit Profile" />

      <Input label="Full name *" value={name} onChangeText={setName} />
      <Input label="Headline" value={headline} onChangeText={setHeadline} />
      <Input label="Location" value={location} onChangeText={setLocation} />

      <Input
        label="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={5}
        style={{ minHeight: 100, textAlignVertical: 'top' }}
      />

      <View className="flex-col gap-3 pt-4">
        <Button
          label="Cancel"
          variant="ghost"
          fullWidth
          onPress={onCancel}
        />

        <Button
          label="Save"
          fullWidth
          onPress={() => onSave({ name, headline, location, bio })}
        />
      </View>
    </ScrollView>
  )
}

// ───────────────── DASHBOARD VIEW ─────────────────

function DashboardView() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'applied' | 'shortlisted' | 'rejected' | 'hired'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const { width } = useWindowDimensions()
  const isSmall = width < 360
  const isMedium = width < 500

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      console.log('🚀 Loading applications...')

      const { data: { user } } = await getSupabase().auth.getUser()

      if (!user) {
        Toast.showError('User not authenticated')
        return
      }

      const apps = await getMyApplications(user.id)
      setApplications(apps)
    } catch (err) {
      console.error('❌ Dashboard load error:', err)
      Toast.showError('Failed to load applications')
    }

    setLoading(false)
  }

  // ───────── FILTER LOGIC ─────────

  const filteredApps =
    activeTab === 'all'
      ? applications
      : applications.filter(app => app.status === activeTab)

  const stats = {
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    hired: applications.filter(a => a.status === 'hired').length,
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <Text className="text-neutral-400">Loading applications...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">

      {/* ───────── STATS ───────── */}
      <View className="px-5 pt-5 pb-3 flex-row justify-between">
        <Stat label="Applied" value={stats.applied} />
        <Stat label="Shortlisted" value={stats.shortlisted} />
        <Stat label="Rejected" value={stats.rejected} />
        <Stat label="Hired" value={stats.hired} />
      </View>

      {/* ───────── FILTER UI ───────── */}
      {isSmall ? (
        <View className="px-5 pb-3">
          <Pressable
            onPress={() => setShowFilters(true)}
            className="flex-row items-center justify-between bg-neutral-100 dark:bg-neutral-800 px-4 py-3 rounded-xl"
          >
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Filters
            </Text>
            <Text className="text-xs text-neutral-400 capitalize">
              {activeTab}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="px-5 pb-3">
          <View className="flex-row bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            {['all', 'applied', 'shortlisted', 'rejected', 'hired'].map(tab => {
              const isActive = activeTab === tab

              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab as any)}
                  className={`rounded-lg items-center justify-center
                    ${isMedium ? 'px-3 py-1.5' : 'px-4 py-2'}
                    ${isActive ? 'bg-white dark:bg-neutral-900 shadow-sm' : ''}
                  `}
                >
                  <Text
                    className={`font-medium capitalize
                      ${isMedium ? 'text-xs' : 'text-sm'}
                      ${isActive
                        ? 'text-neutral-900 dark:text-white'
                        : 'text-neutral-500 dark:text-neutral-400'
                      }
                    `}
                  >
                    {tab}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      )}

      {/* ───────── LIST ───────── */}
      <ScrollView
        contentContainerClassName="px-5 pb-6 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {filteredApps.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-neutral-400 text-center">
              No {activeTab === 'all' ? '' : activeTab} applications found
            </Text>
          </View>
        ) : (
          filteredApps.map(app => (
            <ApplicationCard
              key={app.id}
              title={app.job?.title ?? 'Unknown role'}
              company={app.job?.poster?.company}
              location={app.job?.location}
              isRemote={app.job?.is_remote}
              salaryMin={app.job?.salary_min}
              salaryMax={app.job?.salary_max}
              employmentType={app.job?.employment_type}
              appliedAt={new Date(app.applied_at).toLocaleDateString()}
              status={app.status}
              onPress={() => {
                console.log('View job:', app.job?.id)
              }}
            />
          ))
        )}
      </ScrollView>

      {/* ───────── FIXED MODAL (TOP LAYER) ───────── */}
      {showFilters && (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            elevation: 9999, // Android fix
          }}
        >
          {/* BACKDROP */}
          <Pressable
            onPress={() => setShowFilters(false)}
            className="absolute inset-0 bg-black/40"
          />

          {/* SHEET */}
          <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 p-5 rounded-t-3xl gap-3">
            {['all', 'applied', 'shortlisted', 'rejected', 'hired'].map(tab => (
              <Pressable
                key={tab}
                onPress={() => {
                  setActiveTab(tab as any)
                  setShowFilters(false)
                }}
                className="py-3"
              >
                <Text className="text-base capitalize text-neutral-800 dark:text-neutral-200">
                  {tab}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setShowFilters(false)}
              className="py-3 items-center"
            >
              <Text className="text-neutral-400">Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center">
      <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
        {value}
      </Text>
      <Text className="text-xs text-neutral-400">{label}</Text>
    </View>
  )
}

// ───────────────── MAIN SCREEN ─────────────────

export default function SeekerProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [seeker, setSeeker] = useState<JobSeeker | null>(null)
  const [loading, setLoading] = useState(true)

  const [mode, setMode] = useState<'profile' | 'edit' | 'dashboard'>('profile')

  useEffect(() => { load() }, [])

  async function load() {
    console.log('🚀 Loading profile...')

    const { data: { user } } = await getSupabase().auth.getUser()

    if (!user) {
      console.error('❌ No user')
      return
    }

    const [p, s] = await Promise.all([
      getProfile(user.id),
      getJobSeeker(user.id),
    ])

    console.log('📦 Profile:', p)
    console.log('📦 Seeker:', s)

    setProfile(p)
    setSeeker(s)
    setLoading(false)
  }

  async function handleSave(data: any) {
    console.log('📦 Update payload:', data)

    // ✅ VALIDATION
    if (!data.name?.trim()) {
      Toast.showError('Full name is required')
      return
    }

    try {
      const { data: { user } } = await getSupabase().auth.getUser()

      if (!user) {
        Toast.showError('User not authenticated')
        return
      }

      await Promise.all([
        updateProfile(user.id, {
          full_name: data.name.trim(),
        }),
        updateJobSeeker(user.id, {
          headline: data.headline?.trim() || null,
          location: data.location?.trim() || null,
          bio: data.bio?.trim() || null,
        }),
      ])

      // ✅ LOCAL STATE UPDATE
      setProfile(prev =>
        prev ? { ...prev, full_name: data.name.trim() } : prev
      )

      setSeeker(prev =>
        prev
          ? {
              ...prev,
              headline: data.headline || null,
              location: data.location || null,
              bio: data.bio || null,
            }
          : prev
      )

      Toast.showSuccess('Profile updated')
      setMode('profile')

    } catch (err) {
      console.error('❌ Update error:', err)
      Toast.showError('Failed to update profile')
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <View className="flex-1 bg-white dark:bg-neutral-900" />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      header={{
        title:
          mode === 'profile' ? 'Profile' :
          mode === 'edit' ? 'Edit Profile' :
          'Dashboard',
      }}
      noPad
      noScroll={mode !== 'edit'}
    >
      {mode === 'profile' && (
        <ScrollView
          className="bg-white dark:bg-neutral-900"
          showsVerticalScrollIndicator={false}
        >
<ProfileView
  profile={profile}
  seeker={seeker}
  onEdit={() => setMode('edit')}
  userId={profile?.id}
  onRefresh={load}
/>

          <View className="px-5 pb-10">
            <Button
              label="Go to dashboard"
              variant="secondary"
              onPress={() => setMode('dashboard')}
            />
          </View>
        </ScrollView>
      )}

      {mode === 'edit' && (
        <ProfileEdit
          profile={profile}
          seeker={seeker}
          onCancel={() => setMode('profile')}
          onSave={handleSave}
        />
      )}

      {mode === 'dashboard' && <DashboardView />}
    </PageLayout>
  )
}