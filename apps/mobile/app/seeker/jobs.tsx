// apps/mobile/app/seeker/jobs.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { View, FlatList, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
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
      {/* Sticky header */}
      <View className="bg-neutral-50 dark:bg-neutral-900 pt-4 pb-2 gap-3">
        <View className="px-5">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search jobs, companies, skills…"
          />
        </View>
        <FilterChips
          options={FILTER_OPTIONS}
          selected={activeFilters}
          onToggle={toggleFilter}
        />
      </View>

      <Divider />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerClassName="gap-3 px-5 pt-3 pb-24"
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
            <EmptyState
              emoji="🔍"
              title="No jobs found"
              description={search ? `No results for "${search}". Try different keywords.` : "Check back later for new opportunities."}
              action={activeFilters.length > 0 ? {
                label: 'Clear filters',
                onPress: () => { setActiveFilters([]); setSearch('') },
              } : undefined}
            />
          )
        }
      />
    </PageLayout>
  )
}