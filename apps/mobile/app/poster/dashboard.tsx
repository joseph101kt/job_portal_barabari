// apps/mobile/app/poster/dashboard.tsx
import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, Pressable,
  RefreshControl, ScrollView, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import {
  PageLayout, StatCard, Card, Badge, SectionHeader,
  Button, EmptyState, Avatar, Divider,
} from '@my-app/ui'
import {
  getMyListings, getApplicationStats,
  getSupabase, type JobListing,
} from '@my-app/supabase'

type ListingWithStats = JobListing & {
  stats?: { applied: number; shortlisted: number; hired: number; rejected: number }
}

export default function PosterDashboardScreen() {
  const router = useRouter()
  const [listings,   setListings]   = useState<ListingWithStats[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [userName,   setUserName]   = useState('')

  async function load() {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return

    const data = await getMyListings(user.id)

    // Load stats for each listing
    const withStats = await Promise.all(
      data.map(async listing => ({
        ...listing,
        stats: await getApplicationStats(listing.id),
      }))
    )

    setListings(withStats)

    // Get poster name
    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    setUserName(profile?.full_name ?? '')
  }

  useEffect(() => { load() }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  // Aggregate stats
  const totalApps     = listings.reduce((s, l) => s + (l.stats?.applied     ?? 0), 0)
  const totalShort    = listings.reduce((s, l) => s + (l.stats?.shortlisted  ?? 0), 0)
  const totalHired    = listings.reduce((s, l) => s + (l.stats?.hired        ?? 0), 0)
  const activeJobs    = listings.filter(l => l.status === 'open').length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <PageLayout
      header={{
        title: 'Dashboard',
        right: (
          <Button
            label="+ Post job"
            variant="primary"
            size="sm"
            onPress={() => router.push('/poster/create-job')}
          />
        ),
      }}
      noScroll noPad
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerClassName="gap-5 px-5 pt-4 pb-24"
      >
        {/* Greeting */}
        <View>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
            {greeting}{userName ? `, ${userName.split(' ')[0]}` : ''} 👋
          </Text>
          <Text className="text-sm text-neutral-400 mt-1">
            Here's how your hiring is going
          </Text>
        </View>

        {/* Stats row */}
        <View className="flex-row gap-3">
          <StatCard label="Active jobs"    value={activeJobs}  color="primary"  />
          <StatCard label="Total applied"  value={totalApps}   color="warning"  />
        </View>
        <View className="flex-row gap-3">
          <StatCard label="Shortlisted"    value={totalShort}  color="success"  />
          <StatCard label="Hired"          value={totalHired}  color="success" trend={totalHired > 0 ? 'up' : 'neutral'} />
        </View>

        <Divider />

        {/* Job listings */}
        <SectionHeader
          title="Your job postings"
          action={{ label: 'View all', onPress: () => router.push('/poster/jobs') }}
        />

        {listings.length === 0 ? (
          <EmptyState
            emoji="📝"
            title="No job postings yet"
            description="Create your first job posting to start finding great candidates."
            action={{
              label: 'Post a job',
              onPress: () => router.push('/poster/create-job'),
            }}
          />
        ) : (
          <View className="gap-3">
            {listings.slice(0, 5).map(listing => (
              <Pressable
                key={listing.id}
                onPress={() => router.push({ pathname: '/poster/job-applicants', params: { id: listing.id } })}
                className="active:opacity-90"
              >
                <Card elevation="raised" noPad>
                  <View className="p-4 gap-3">
                    {/* Title row */}
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100" numberOfLines={1}>
                          {listing.title}
                        </Text>
                        <Text className="text-xs text-neutral-400 mt-0.5">
                          Posted {new Date(listing.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </Text>
                      </View>
                      <Badge
                        label={listing.status}
                        variant={listing.status === 'open' ? 'success' : 'neutral'}
                        dot
                        size="sm"
                      />
                    </View>

                    {/* Application stats mini-row */}
                    {listing.stats && (
                      <View className="flex-row gap-4">
                        <View className="items-center">
                          <Text className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                            {listing.stats.applied}
                          </Text>
                          <Text className="text-xs text-neutral-400">Applied</Text>
                        </View>
                        <View className="items-center">
                          <Text className="text-lg font-bold text-warning-600">
                            {listing.stats.shortlisted}
                          </Text>
                          <Text className="text-xs text-neutral-400">Shortlisted</Text>
                        </View>
                        <View className="items-center">
                          <Text className="text-lg font-bold text-success-600">
                            {listing.stats.hired}
                          </Text>
                          <Text className="text-xs text-neutral-400">Hired</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <View className="flex-row border-t border-neutral-100 dark:border-neutral-700">
                    <Pressable
                      onPress={() => router.push({ pathname: '/poster/job-applicants', params: { id: listing.id } })}
                      className="flex-1 py-2.5 items-center active:bg-neutral-50"
                    >
                      <Text className="text-sm font-medium text-primary-600">View applicants</Text>
                    </Pressable>
                    <View className="w-px bg-neutral-100 dark:bg-neutral-700" />
                    <Pressable
                      onPress={() => router.push({ pathname: '/poster/create-job', params: { editId: listing.id } })}
                      className="flex-1 py-2.5 items-center active:bg-neutral-50"
                    >
                      <Text className="text-sm font-medium text-neutral-500">Edit</Text>
                    </Pressable>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  )
}