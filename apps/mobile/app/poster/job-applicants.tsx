import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, Pressable, RefreshControl,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  PageLayout, ApplicantCard, EmptyState, Toast,
} from '@my-app/ui'
import {
  getApplicationsForListing,
  getListingById,
  updateApplicationStatus,
  createInterview,
  getSupabase,
  getProfile,
  getJobSeeker,
  getFullResume,
  type Application,
  type ApplicationStatus,
} from '@my-app/supabase'

const TABS: { key: ApplicationStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'applied', label: 'Applied' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
]

type ResumeData = {
  experiences?: {
    role: string
    company_name?: string
    start_date?: string
    end_date?: string
  }[]
  education?: {
    degree: string
    institution?: string
  }[]
  skills?: {
    name: string
  }[]
}

type EnrichedApplication = Application & {
  profile?: any
  jobSeeker?: any
  skills?: { name: string }[]
  resume?: ResumeData | null
}

export default function JobApplicantsScreen() {
  const params = useLocalSearchParams()
  const id = params?.id as string | undefined

  const router = useRouter()

  const [title, setTitle] = useState('')
  const [apps, setApps] = useState<EnrichedApplication[]>([])
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('all')
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

      // 🔥 Enrich data (frontend only)
      const enrichedApps = await Promise.all(
        (applications ?? []).map(async (app) => {
          try {
            const [profile, jobSeeker, resume] = await Promise.all([
              getProfile(app.user_id),
              getJobSeeker(app.user_id),
              getFullResume(app.user_id),
            ])

            return {
              ...app,
              profile,
              jobSeeker,
              skills: resume?.skills ?? [],
              resume, 
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

      setTitle(listing?.title ?? 'Applicants')
      setApps(enrichedApps)
      console.log('✅ Applicants loaded:', enrichedApps)

    } catch (err) {
      console.error('❌ Load applicants error:', err)
      Toast.showError('Failed to load applicants')
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  // ───────── STATUS ACTIONS ─────────

  async function updateStatus(appId: string, status: ApplicationStatus) {
    const updated = await updateApplicationStatus(appId, status)

    if (!updated) {
      Toast.showError('Failed to update')
      return
    }

    setApps(prev =>
      prev.map(a => a.id === appId ? { ...a, status } : a)
    )
  }

  async function handleReject(app: EnrichedApplication) {
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

  async function handleInterview(app: EnrichedApplication) {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return

    const interview = await createInterview({
      candidate_id: app.user_id,
      interviewer_id: user.id,
      listing_id: id,
    })

    if (interview) {
      router.push({
        pathname: '/shared/interview-lobby',
        params: { roomName: interview.room_name },
      })
    }
  }

  // ───────── FILTER ─────────

  const filtered =
    activeTab === 'all'
      ? apps
      : apps.filter(a => a.status === activeTab)

  const getCount = (status: ApplicationStatus | 'all') =>
    status === 'all'
      ? apps.length
      : apps.filter(a => a.status === status).length

  // ───────── UI ─────────

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

      {/* Tabs */}
      <View className="px-5 pt-2 pb-2">
        <View className="flex-row bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 gap-1">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key
            const count = getCount(tab.key)

            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`flex-row items-center gap-1 px-3 py-1.5 rounded-lg
                  ${isActive ? 'bg-white dark:bg-neutral-900 shadow-sm' : ''}
                `}
              >
                <Text
                  className={`text-xs font-medium
                    ${isActive
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-500 dark:text-neutral-400'
                    }
                  `}
                >
                  {tab.label}
                </Text>

                {count > 0 && (
                  <View className="px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <Text className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerClassName="gap-3 px-5 pt-2 pb-24"
        showsVerticalScrollIndicator={false}

        renderItem={({ item }) => (
          <View className="gap-2">

            <ApplicantCard
              name={item.profile?.full_name ?? 'Candidate'}
              avatarUri={item.profile?.avatar_url ?? undefined}
              headline={item.jobSeeker?.headline ?? undefined}
              location={item.jobSeeker?.location ?? undefined}
              appliedAt={new Date(item.applied_at).toLocaleDateString()}
              status={item.status}
              skills={item.skills ?? []}
              experiences={
                item.resume?.experiences?.map(exp => ({
                  title: exp.role,
                  company: exp.company_name,
                })) ?? []
              }              
              education={item.resume?.education ?? []}

              onView={() => {
                console.log('View profile:', item.user_id)
              }}

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

            {item.status === 'shortlisted' && (
              <Pressable
                onPress={() => handleInterview(item)}
                className="mx-1 py-2.5 rounded-xl bg-primary-50 border border-primary-100 items-center"
              >
                <Text className="text-sm font-semibold text-primary-600">
                  🎥 Schedule interview
                </Text>
              </Pressable>
            )}

          </View>
        )}

        ListEmptyComponent={
          <EmptyState
            emoji="👥"
            title={
              activeTab === 'all'
                ? 'No applicants yet'
                : `No ${activeTab} applicants`
            }
          />
        }
      />
    </PageLayout>
  )
}