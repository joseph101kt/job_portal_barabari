// apps/mobile/app/seeker/jobs.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { View, FlatList, RefreshControl, Text } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import {
  PageLayout, SearchBar, FilterChips,
  JobCard, EmptyState, Divider,
} from '@my-app/ui'
import {
  getOpenListings, recordJobView,
  type JobListing, type EmploymentType,
} from '@my-app/supabase'

const FILTER_OPTIONS = [
  { label: 'Remote',      value: 'remote' },
  { label: 'Internship',  value: 'internship' },
  { label: 'Full-time',   value: 'full_time' },
  { label: 'Part-time',   value: 'part_time' },
  { label: 'Fresher',     value: 'fresher' },
  { label: 'Contract',    value: 'contract' },
]

export default function JobsScreen() {
  const router = useRouter()
  const [jobs,      setJobs]      = useState<JobListing[]>([])
  const [filtered,  setFiltered]  = useState<JobListing[]>([])
  const [search,    setSearch]    = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading,   setLoading]   = useState(true)

  async function load() {
    setLoading(true)
    const data = await getOpenListings()
    setJobs(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Client-side filter + search
  useEffect(() => {
    let result = [...jobs]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.poster?.company?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q)
      )
    }

    if (activeFilters.length > 0) {
      result = result.filter(j => {
        return activeFilters.every(f => {
          if (f === 'remote')  return j.is_remote
          if (f === 'fresher') return j.experience_level === 'fresher'
          return j.employment_type === f
        })
      })
    }

    setFiltered(result)
  }, [jobs, search, activeFilters])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  function toggleFilter(value: string) {
    setActiveFilters(prev =>
      prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
    )
  }

  function handleJobPress(job: JobListing) {
    recordJobView({ job_id: job.id, clicked: true }).catch(() => {})
    router.push({ pathname: '/seeker/job-detail', params: { id: job.id } })
  }

  function handleApply(job: JobListing) {
    router.push({ pathname: '/seeker/job-detail', params: { id: job.id, apply: '1' } })
  }

  function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const h = Math.floor(diff / 3_600_000)
    if (h < 1)  return 'Just now'
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 7)  return `${d}d ago`
    return `${Math.floor(d / 7)}w ago`
  }

  return (
    <PageLayout noScroll noPad>
      <Stack.Screen options={{ title: 'Jobs' }} />
      {/* Sticky header */}
<View className="bg-neutral-50 dark:bg-neutral-900 pt-5 pb-3 gap-4">
  {/* Title */}
  <View className="px-5">
    <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
      Find Jobs
    </Text>
    <Text className="text-sm text-neutral-400 mt-1">
      Discover opportunities tailored for you
    </Text>
  </View>

  {/* Search */}
  <View className="px-5">
    <SearchBar
      value={search}
      onChangeText={setSearch}
      placeholder="Search jobs, companies, skills…"
    />
  </View>

  {/* Filters (more breathing space) */}
  <View className="pb-1">
    <FilterChips
      options={FILTER_OPTIONS}
      selected={activeFilters}
      onToggle={toggleFilter}
    />
  </View>
</View>

      <View className="h-2 bg-neutral-100 dark:bg-neutral-800" />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerClassName="gap-4 px-5 pt-4 pb-28"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <JobCard
            id={item.id}
            title={item.title}
            company={item.poster?.company ?? 'Unknown'}
            location={item.location ?? undefined}
            isRemote={item.is_remote}
            salaryMin={item.salary_min ?? undefined}
            salaryMax={item.salary_max ?? undefined}
            employmentType={item.employment_type as EmploymentType ?? undefined}
            skills={item.skills?.map(s => s.name) ?? []}
            postedAt={relativeTime(item.created_at)}
            deadline={item.application_deadline
              ? `Closes ${new Date(item.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
              : undefined}
            isNew={Date.now() - new Date(item.created_at).getTime() < 86_400_000}
            onPress={() => handleJobPress(item)}
            onApply={() => handleApply(item)}
          />
        )}
        ListEmptyComponent={
          loading ? null : (
            <View className="flex-1 justify-center items-center mt-20 px-6">
              <EmptyState
                emoji="🔍"
                title="No jobs found"
                description={
                  search
                    ? `No results for "${search}". Try different keywords.`
                    : "Check back later for new opportunities."
                }
                action={activeFilters.length > 0 ? {
                  label: 'Clear filters',
                  onPress: () => { setActiveFilters([]); setSearch('') },
                } : undefined}
              />
            </View>
          )
        }
      />
    </PageLayout>
  )
}