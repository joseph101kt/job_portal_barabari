// apps/mobile/app/poster/job-applicants.tsx
import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, Pressable, RefreshControl, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  PageLayout, ApplicantCard, Badge, EmptyState, Divider,
} from '@my-app/ui'
import {
  getApplicationsForListing, getListingById,
  updateApplicationStatus, createInterview,
  getSupabase, type Application, type ApplicationStatus,
} from '@my-app/supabase'

const STATUS_TABS: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Applied',     value: 'applied' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Hired',       value: 'hired' },
  { label: 'Rejected',    value: 'rejected' },
]

export default function JobApplicantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router  = useRouter()

  const [title,       setTitle]      = useState('')
  const [apps,        setApps]       = useState<Application[]>([])
  const [activeTab,   setActiveTab]  = useState<ApplicationStatus | 'all'>('all')
  const [refreshing,  setRefreshing] = useState(false)

  async function load() {
    if (!id) return
    const [listing, applications] = await Promise.all([
      getListingById(id),
      getApplicationsForListing(id),
    ])
    setTitle(listing?.title ?? 'Applicants')
    setApps(applications)
  }

  useEffect(() => { load() }, [id])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function handleShortlist(app: Application) {
    await updateApplicationStatus(app.id, 'shortlisted')
    setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: 'shortlisted' } : a))
  }

  async function handleReject(app: Application) {
    Alert.alert('Reject application?', 'This will notify the candidate.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          await updateApplicationStatus(app.id, 'rejected')
          setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: 'rejected' } : a))
        },
      },
    ])
  }

  async function handleScheduleInterview(app: Application) {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return

    const interview = await createInterview({
      candidate_id:   app.user_id,
      interviewer_id: user.id,
      listing_id:     id,
    })

    if (interview) {
      router.push({
        pathname: '/shared/interview-lobby',
        params: { roomName: interview.room_name },
      })
    }
  }

  const filtered = activeTab === 'all'
    ? apps
    : apps.filter(a => a.status === activeTab)

  return (
    <PageLayout
      header={{
        title,
        subtitle: `${apps.length} application${apps.length !== 1 ? 's' : ''}`,
        left: (
          <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center rounded-xl bg-neutral-100">
            <Text className="text-neutral-600">‹</Text>
          </Pressable>
        ),
      }}
      noScroll noPad
    >
      {/* Status tabs */}
      <View className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <FlatList
          horizontal
          data={STATUS_TABS}
          keyExtractor={t => t.value}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-1 py-2"
          renderItem={({ item }) => {
            const count = item.value === 'all'
              ? apps.length
              : apps.filter(a => a.status === item.value).length
            const isActive = activeTab === item.value

            return (
              <Pressable
                onPress={() => setActiveTab(item.value)}
                className={[
                  'flex-row items-center gap-1.5 px-3 py-1.5 rounded-full',
                  isActive ? 'bg-primary-500' : 'bg-neutral-100 dark:bg-neutral-800',
                ].join(' ')}
              >
                <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
                  {item.label}
                </Text>
                {count > 0 && (
                  <View className={`w-5 h-5 rounded-full items-center justify-center ${isActive ? 'bg-white/20' : 'bg-neutral-200 dark:bg-neutral-700'}`}>
                    <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-neutral-500'}`}>{count}</Text>
                  </View>
                )}
              </Pressable>
            )
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerClassName="gap-3 px-5 pt-3 pb-24"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => (
          <View className="gap-2">
            <ApplicantCard
              name={item.applicant?.full_name ?? 'Candidate'}
              avatarUri={item.applicant?.avatar_url ?? undefined}
              headline={(item.applicant as any)?.job_seeker?.headline ?? undefined}
              appliedAt={new Date(item.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              status={item.status}
              onView={() => {/* navigate to candidate profile */}}
              onShortlist={item.status === 'applied' ? () => handleShortlist(item) : undefined}
              onReject={item.status === 'applied' || item.status === 'shortlisted' ? () => handleReject(item) : undefined}
            />
            {item.status === 'shortlisted' && (
              <Pressable
                onPress={() => handleScheduleInterview(item)}
                className="mx-1 py-2.5 rounded-xl bg-primary-50 border border-primary-100 items-center active:opacity-80"
              >
                <Text className="text-sm font-semibold text-primary-600">🎥 Schedule interview</Text>
              </Pressable>
            )}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="👥"
            title={activeTab === 'all' ? 'No applicants yet' : `No ${activeTab} applicants`}
            description={activeTab === 'all' ? 'Share your job posting to attract candidates.' : undefined}
          />
        }
      />
    </PageLayout>
  )
}