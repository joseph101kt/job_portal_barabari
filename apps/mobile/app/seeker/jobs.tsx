'use client'

import React, { useEffect, useState } from 'react'
import { View, FlatList, RefreshControl, Text, TextInput, Pressable } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import {
  PageLayout, SearchBar, FilterChips,
  JobCard, EmptyState,
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

const STEP = 5000

export default function JobsScreen() {
  const router = useRouter()

  const [jobs, setJobs] = useState<JobListing[]>([])
  const [filtered, setFiltered] = useState<JobListing[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const [minSalary, setMinSalary] = useState('0')
  const [maxSalary, setMaxSalary] = useState('200000')

  async function load() {
    setLoading(true)
    const data = await getOpenListings()
    setJobs(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  function scoreJob(job: JobListing, q: string) {
    let score = 0
    const text = q.toLowerCase()

    const title = job.title?.toLowerCase() ?? ''
    const desc = job.description?.toLowerCase() ?? ''
    const company = job.poster?.company?.toLowerCase() ?? ''
    const location = job.location?.toLowerCase() ?? ''
    const emp = job.employment_type?.toLowerCase() ?? ''
    const exp = job.experience_level?.toLowerCase() ?? ''
    const skills = job.skills?.map(s => s.name.toLowerCase()).join(' ') ?? ''

    if (title.includes(text)) score += 5
    if (company.includes(text)) score += 4
    if (skills.includes(text)) score += 4
    if (desc.includes(text)) score += 3
    if (location.includes(text)) score += 2
    if (emp.includes(text)) score += 2
    if (exp.includes(text)) score += 2

    return score
  }

  // 🔧 Helpers for increment/decrement
  const adjustMin = (delta: number) => {
    const val = Math.max(0, (parseInt(minSalary) || 0) + delta)
    setMinSalary(String(val))
  }

  const adjustMax = (delta: number) => {
    const val = Math.max(0, (parseInt(maxSalary) || 0) + delta)
    setMaxSalary(String(val))
  }

  useEffect(() => {
    let result = [...jobs]

    const q = debouncedSearch.trim().toLowerCase()

    const isRemoteSearch =
      q.includes('remote') ||
      q.includes('wfh') ||
      q.includes('work from home')

    if (q) {
      result = result
        .map(j => ({
          job: j,
          score: scoreJob(j, q),
        }))
        .filter(x => x.score > 0 || (isRemoteSearch && x.job.is_remote))
        .sort((a, b) => b.score - a.score)
        .map(x => x.job)
    }

    if (activeFilters.length > 0) {
      result = result.filter(j => {
        return activeFilters.every(f => {
          if (f === 'remote') return j.is_remote
          if (f === 'fresher') return j.experience_level === 'fresher'
          return j.employment_type === f
        })
      })
    }

    let min = parseInt(minSalary) || 0
    let max = parseInt(maxSalary) || 99999999

    if (min > max) [min, max] = [max, min]

    result = result.filter(j => {
      const jobMin = j.salary_min ?? 0
      const jobMax = j.salary_max ?? 99999999
      return jobMax >= min && jobMin <= max
    })

    setFiltered(result)
  }, [jobs, debouncedSearch, activeFilters, minSalary, maxSalary])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  function toggleFilter(value: string) {
    setActiveFilters(prev =>
      prev.includes(value)
        ? prev.filter(f => f !== value)
        : [...prev, value]
    )
  }

  function handleJobPress(job: JobListing) {
    recordJobView({ job_id: job.id, clicked: true }).catch(() => {})
    router.push({ pathname: '/seeker/job-detail', params: { id: job.id } })
  }

  function handleApply(job: JobListing) {
    router.push({
      pathname: '/seeker/job-detail',
      params: { id: job.id, apply: '1' }
    })
  }

  function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const h = Math.floor(diff / 3_600_000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 7) return `${d}d ago`
    return `${Math.floor(d / 7)}w ago`
  }

  return (
    <PageLayout noScroll noPad>
      <Stack.Screen options={{ title: 'Jobs' }} />

      <View className="bg-neutral-50 dark:bg-neutral-900 pt-5 pb-3 gap-4">

        <View className="px-5">
          <Text className="text-2xl font-bold text-neutral-900 dark:text-white">
            Find Jobs
          </Text>
        </View>

        <View className="px-5">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search jobs, skills, companies…"
          />
        </View>

        {/* 🔥 Combined row */}
        <View className="flex-row items-center gap-3 px-5">

          {/* Chips */}
          <View className="flex-1">
            <FilterChips
              options={FILTER_OPTIONS}
              selected={activeFilters}
              onToggle={toggleFilter}
            />
          </View>

{/* 💰 Compact Salary Box (Improved Buttons) */}
<View className="flex-row items-center gap-3 px-3 py-2 rounded-xl bg-blue-50 dark:bg-neutral-800">

  {/* MIN */}
  <View className="flex-row items-center gap-1">

    <Pressable
      onPress={() => {
        const val = Math.max(0, (parseInt(minSalary) || 0) - STEP)
        setMinSalary(String(val))
      }}
      className="h-7 w-7 items-center justify-center rounded-md bg-white dark:bg-neutral-700"
      android_ripple={{ color: '#ddd', borderless: true }}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
    >
      <Text selectable={false} className="text-sm font-bold dark:text-white">−</Text>
    </Pressable>

    <TextInput
      value={minSalary}
      onChangeText={setMinSalary}
      keyboardType="numeric"
      className="w-14 text-center text-sm text-black dark:text-white"
    />

    <Pressable
      onPress={() => {
        const val = (parseInt(minSalary) || 0) + STEP
        setMinSalary(String(val))
      }}
      className="h-7 w-7 items-center justify-center rounded-md bg-white dark:bg-neutral-700"
      android_ripple={{ color: '#ddd', borderless: true }}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
    >
      <Text selectable={false} className="text-sm font-bold dark:text-white">+</Text>
    </Pressable>

  </View>

  {/* Separator */}
  <Text selectable={false} className="text-xs text-neutral-400">to</Text>

  {/* MAX */}
  <View className="flex-row items-center gap-1">

    <Pressable
      onPress={() => {
        const val = Math.max(0, (parseInt(maxSalary) || 0) - STEP)
        setMaxSalary(String(val))
      }}
      className="h-7 w-7 items-center justify-center rounded-md bg-white dark:bg-neutral-700"
      android_ripple={{ color: '#ddd', borderless: true }}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
    >
      <Text selectable={false} className="text-sm font-bold dark:text-white">−</Text>
    </Pressable>

    <TextInput
      value={maxSalary}
      onChangeText={setMaxSalary}
      keyboardType="numeric"
      className="w-14 text-center text-sm text-black dark:text-white"
    />

    <Pressable
      onPress={() => {
        const val = (parseInt(maxSalary) || 0) + STEP
        setMaxSalary(String(val))
      }}
      className="h-7 w-7 items-center justify-center rounded-md bg-white dark:bg-neutral-700"
      android_ripple={{ color: '#ddd', borderless: true }}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
    >
      <Text selectable={false} className="text-sm font-bold dark:text-white">+</Text>
    </Pressable>

  </View>

</View>
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
            onPress={() => handleJobPress(item)}
            onApply={() => handleApply(item)}
          />
        )}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              emoji="🔍"
              title="No jobs found"
              description="Try different filters"
            />
          )
        }
      />
    </PageLayout>
  )
}