// apps/mobile/app/seeker/applications.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import {
  PageLayout, Card, Badge, Avatar,
  EmptyState, Divider,
} from '@my-app/ui'
import {
  getMyApplications, getSupabase,
  type Application, type ApplicationStatus,
} from '@my-app/supabase'

const TABS: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Applied',     value: 'applied' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Hired',       value: 'hired' },
  { label: 'Rejected',    value: 'rejected' },
]

const statusEmoji: Record<ApplicationStatus, string> = {
  applied:     '📤',
  shortlisted: '⭐',
  rejected:    '❌',
  hired:       '🎉',
}

export default function ApplicationsScreen() {
  const router = useRouter()
  const [apps,       setApps]       = useState<Application[]>([])
  const [activeTab,  setActiveTab]  = useState<ApplicationStatus | 'all'>('all')
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return
    const data = await getMyApplications(user.id)
    setApps(data)
  }

  useEffect(() => { load() }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const filtered = activeTab === 'all'
    ? apps
    : apps.filter(a => a.status === activeTab)

  function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const d = Math.floor(diff / 86_400_000)
    if (d === 0) return 'Today'
    if (d === 1) return 'Yesterday'
    if (d < 7)   return `${d} days ago`
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <PageLayout header={{ title: 'My Applications' }} noScroll noPad>
      {/* Tab bar */}
      <View className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <FlatList
          horizontal
          data={TABS}
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
                    <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-neutral-500'}`}>
                      {count}
                    </Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/seeker/job-detail', params: { id: item.job_id } })}
            className="active:opacity-90"
          >
            <Card elevation="raised" noPad>
              <View className="p-4 gap-3">
                {/* Header */}
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Avatar name={item.job?.poster?.company ?? ''} size="sm" />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-100" numberOfLines={1}>
                        {item.job?.title ?? 'Job'}
                      </Text>
                      <Text className="text-xs text-neutral-400">
                        {item.job?.poster?.company}
                      </Text>
                    </View>
                  </View>
                  <Badge label={item.status} variant={item.status} dot size="sm" />
                </View>

                {/* Meta */}
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl">{statusEmoji[item.status]}</Text>
                  <View>
                    <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      {item.status === 'applied'     && 'Application submitted'}
                      {item.status === 'shortlisted' && 'You\'ve been shortlisted!'}
                      {item.status === 'rejected'    && 'Application not selected'}
                      {item.status === 'hired'       && 'Congratulations! You\'re hired!'}
                    </Text>
                    <Text className="text-xs text-neutral-400">
                      Applied {relativeTime(item.applied_at)}
                    </Text>
                  </View>
                </View>

                {/* Employment type */}
                {item.job?.employment_type && (
                  <Badge
                    label={item.job.employment_type.replace('_', '-')}
                    variant={item.job.employment_type as ApplicationStatus}
                    size="sm"
                  />
                )}
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            emoji={activeTab === 'all' ? '📋' : statusEmoji[activeTab as ApplicationStatus] ?? '🔍'}
            title={activeTab === 'all' ? 'No applications yet' : `No ${activeTab} applications`}
            description={activeTab === 'all' ? 'Start applying to jobs to track them here.' : undefined}
            action={activeTab === 'all' ? {
              label: 'Browse jobs',
              onPress: () => router.push('/seeker/jobs'),
            } : undefined}
          />
        }
      />
    </PageLayout>
  )
}