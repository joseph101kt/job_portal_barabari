
// 🔥 DEBUG VERSION — DO NOT REMOVE LOGS YET

import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, Pressable, RefreshControl,
} from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import {
  PageLayout, ApplicantCard, EmptyState, Toast,
} from '@my-app/ui'
import {
  getApplicationsForListing,
  getListingById,
  updateApplicationStatus,
  getSupabase,
  getProfile,
  getJobSeeker,
  getFullResume,
  type Application,
  type ApplicationStatus,
  startChat,
  supabase,
} from '@my-app/supabase'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'applied', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
]

export default function JobApplicantsScreen() {
  const params = useLocalSearchParams()
  const id = params?.id as string | undefined
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [apps, setApps] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    if (!id) {
      console.error('❌ No listing ID found')
      return
    }

    try {
      console.log('🚀 Loading applicants for job:', id)

      const [listing, applications] = await Promise.all([
        getListingById(id),
        getApplicationsForListing(id),
      ])

      console.log('📄 LISTING:', listing)
      console.log('📄 RAW APPLICATIONS:', applications)

      const enrichedApps = await Promise.all(
        (applications ?? []).map(async (app) => {
          try {
            console.log('👤 Processing applicant:', app.user_id)

            const [profile, jobSeeker, resume] = await Promise.all([
              getProfile(app.user_id),
              getJobSeeker(app.user_id),
              getFullResume(app.user_id),
            ])

            console.log('🧠 PROFILE:', profile)
            console.log('🧠 JOB SEEKER:', jobSeeker)
            console.log('🧠 RAW RESUME:', resume)

            // 🔥 CRITICAL: normalize resume shape
            const normalizedResume = {
              experience: resume?.experiences ?? resume?.experiences ?? [],
              education: resume?.education ?? [],
              skills: resume?.skills ?? [],
            }

            console.log('✅ NORMALIZED RESUME:', normalizedResume)

            return {
              ...app,
              profile,
              jobSeeker,
              skills: normalizedResume.skills,
              resume: normalizedResume,
            }

          } catch (err) {
            console.error('❌ Enrich error:', err)
            return {
              ...app,
              profile: null,
              jobSeeker: null,
              skills: [],
              resume: null,
            }
          }
        })
      )

      console.log('✅ FINAL ENRICHED APPS:', enrichedApps)

      setTitle(listing?.title ?? 'Applicants')
      setApps(enrichedApps)

    } catch (err) {
      console.error('❌ Load applicants error:', err)
      Toast.showError('Failed to load applicants')
    }
  }

  async function handleRefresh() {
    console.log('🔄 Refresh triggered')
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function handleStartChat(app: any) {
    try {
      console.log('💬 Starting chat for:', app.id)

      const { data: { user } } = await getSupabase().auth.getUser()
      if (!user) {
        console.error('❌ No user found')
        return
      }

      await startChat(app.id, 'poster')

      const { error } = await supabase.from('messages').insert({
        application_id: app.id,
        sender_id: user.id,
        content: "Hi",
      })

      if (error) {
        console.error('❌ send message error:', error)
      }

      router.push('/poster/chat')

    } catch (err) {
      console.error('❌ start chat error:', err)
      Toast.showError('Failed to start chat')
    }
  }

  async function updateStatus(appId: string, status: ApplicationStatus) {
    console.log('🔄 Updating status:', appId, status)

    const updated = await updateApplicationStatus(appId, status)

    if (!updated) {
      Toast.showError('Failed to update')
      return
    }

    setApps(prev =>
      prev.map(a => a.id === appId ? { ...a, status } : a)
    )
  }

  async function handleReject(app: any) {
    console.log('❌ Rejecting:', app.id)

    try {
      const updated = await updateApplicationStatus(app.id, 'rejected')

      if (!updated) {
        Toast.showError('Failed to reject')
        return
      }

      setApps(prev =>
        prev.map(a =>
          a.id === app.id ? { ...a, status: 'rejected' } : a
        )
      )

      Toast.showSuccess('Application rejected')

    } catch (err) {
      console.error('❌ Reject error:', err)
      Toast.showError('Something went wrong')
    }
  }

  const filtered =
    activeTab === 'all'
      ? apps
      : apps.filter(a => a.status === activeTab)

  return (
    <PageLayout
      header={{
        title,
        subtitle: `${apps.length} application${apps.length !== 1 ? 's' : ''}`,
        left: (
          <Pressable
            onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800"
          >
            <Text className="text-neutral-600 dark:text-neutral-300">‹</Text>
          </Pressable>
        ),
      }}
      noScroll
      noPad
    >
      <Stack.Screen options={{ title: 'Applicants' }} />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerClassName="gap-3 px-5 pt-2 pb-24"

        renderItem={({ item }) => {
          console.log('🎯 RENDER ITEM:', item)

          return (
            <ApplicantCard
              name={item.profile?.full_name ?? 'Candidate'}
              avatarUri={item.profile?.avatar_url ?? undefined}
              headline={item.jobSeeker?.headline ?? undefined}
              location={item.jobSeeker?.location ?? undefined}
              appliedAt={new Date(item.applied_at).toLocaleDateString()}
              status={item.status}

              skills={item.skills ?? []}

              experiences={
                item.resume?.experience?.map((exp: { role: any; company_name: any }) => ({
                  title: exp.role,
                  company: exp.company_name,
                })) ?? []
              }

              education={item.resume?.education ?? []}

              onStartChat={() => handleStartChat(item)}
              onShortlist={
                item.status === 'applied'
                  ? () => updateStatus(item.id, 'shortlisted')
                  : undefined
              }
              onReject={
                item.status === 'applied' || item.status === 'shortlisted'
                  ? () => handleReject(item)
                  : undefined
              }
              onHire={
                item.status === 'shortlisted'
                  ? () => updateStatus(item.id, 'hired')
                  : undefined
              }
            />
          )
        }}

        ListEmptyComponent={
          <EmptyState
            emoji="👥"
            title="No applicants yet"
          />
        }
      />
    </PageLayout>
  )
}
