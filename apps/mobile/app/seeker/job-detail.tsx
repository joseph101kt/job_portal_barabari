// apps/mobile/app/seeker/job-detail.tsx
import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  PageLayout, Badge, Tag, Button,
  Card, Avatar, Divider, BottomSheet,
  Input, SectionHeader,
} from '@my-app/ui'
import {
  getListingById, applyToJob, hasApplied,
  getSupabase, type JobListing,
} from '@my-app/supabase'

export default function JobDetailScreen() {
  const { id, apply: openApply } = useLocalSearchParams<{ id: string; apply?: string }>()
  const router = useRouter()

  const [job,         setJob]         = useState<JobListing | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [applied,     setApplied]     = useState(false)
  const [applyOpen,   setApplyOpen]   = useState(openApply === '1')
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  useEffect(() => {
    if (!id) return
    loadJob()
  }, [id])

  async function loadJob() {
    setLoading(true)
    const [data, user] = await Promise.all([
      getListingById(id),
      getSupabase().auth.getUser(),
    ])
    setJob(data)
    if (data && user.data.user) {
      const already = await hasApplied(data.id, user.data.user.id)
      setApplied(already)
    }
    setLoading(false)
  }

  async function handleApply() {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user || !job) return

    setSubmitting(true)
    const result = await applyToJob({
      job_id:       job.id,
      user_id:      user.id,
      cover_letter: coverLetter.trim() || undefined,
    })

    if (result) {
      setApplied(true)
      setApplyOpen(false)
      Alert.alert('Applied!', `Your application to ${job.title} has been submitted.`)
    } else {
      Alert.alert('Error', 'Failed to submit application. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <PageLayout>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color="#4F6EF7" />
        </View>
      </PageLayout>
    )
  }

  if (!job) return null

  const requiredSkills  = job.skills?.filter(s => s.required)  ?? []
  const optionalSkills  = job.skills?.filter(s => !s.required) ?? []

  return (
    <>
      <PageLayout
        header={{
          title: '',
          left: (
            <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center rounded-xl bg-neutral-100">
              <Text className="text-neutral-600">‹</Text>
            </Pressable>
          ),
        }}
        noPad
        noScroll
        footer={
          applied ? (
            <View className="flex-row items-center gap-2 justify-center py-1">
              <Badge label="✓ Applied" variant="success" />
              <Text className="text-sm text-neutral-500">You already applied to this role</Text>
            </View>
          ) : (
            <Button
              label="Apply now"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => setApplyOpen(true)}
            />
          )
        }
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-4">
          {/* Company header */}
          <View className="bg-white dark:bg-neutral-800 px-5 pt-4 pb-5 gap-4">
            <View className="flex-row gap-4 items-start">
              <Avatar name={job.poster?.company ?? ''} size="lg" />
              <View className="flex-1 gap-1">
                <Text className="text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                  {job.title}
                </Text>
                <Text className="text-base text-neutral-500">{job.poster?.company}</Text>
              </View>
            </View>

            {/* Quick stats */}
            <View className="flex-row flex-wrap gap-2">
              {job.employment_type && (
                <Badge label={job.employment_type.replace('_', '-')} variant={job.employment_type} />
              )}
              {job.experience_level && (
                <Badge label={job.experience_level} variant="neutral" />
              )}
              {job.is_remote && <Badge label="Remote" variant="success" />}
              {job.location && !job.is_remote && (
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm text-neutral-500">📍 {job.location}</Text>
                </View>
              )}
            </View>

            {/* Salary */}
            {(job.salary_min || job.salary_max) && (
              <Text className="text-base font-semibold text-success-700">
                💰 {job.salary_min && `₹${Math.round(job.salary_min / 1000)}k`}
                {job.salary_min && job.salary_max && ' – '}
                {job.salary_max && `₹${Math.round(job.salary_max / 1000)}k`}/mo
              </Text>
            )}

            {/* Deadline */}
            {job.application_deadline && (
              <Text className="text-sm text-warning-600">
                ⏰ Apply before {new Date(job.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            )}
          </View>

          <Divider />

          <View className="px-5 py-5 gap-6">
            {/* Description */}
            {job.description && (
              <View className="gap-2">
                <SectionHeader title="About this role" />
                <Text className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {job.description}
                </Text>
              </View>
            )}

            {/* Required skills */}
            {requiredSkills.length > 0 && (
              <View className="gap-3">
                <SectionHeader title="Required skills" />
                <View className="flex-row flex-wrap gap-2">
                  {requiredSkills.map(s => (
                    <Tag key={s.id} label={s.name} required />
                  ))}
                </View>
              </View>
            )}

            {/* Optional skills */}
            {optionalSkills.length > 0 && (
              <View className="gap-3">
                <SectionHeader title="Nice to have" />
                <View className="flex-row flex-wrap gap-2">
                  {optionalSkills.map(s => (
                    <Tag key={s.id} label={s.name} muted />
                  ))}
                </View>
              </View>
            )}

            {/* About company */}
            {job.poster?.description && (
              <View className="gap-3">
                <SectionHeader title={`About ${job.poster.company}`} />
                <Card elevation="flat">
                  <View className="gap-2">
                    {job.poster.industry && (
                      <Text className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                        {job.poster.industry}
                      </Text>
                    )}
                    <Text className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {job.poster.description}
                    </Text>
                    {job.poster.website && (
                      <Text className="text-sm text-primary-600 font-medium">{job.poster.website}</Text>
                    )}
                  </View>
                </Card>
              </View>
            )}
          </View>
        </ScrollView>
      </PageLayout>

      {/* Apply bottom sheet */}
      <BottomSheet
        visible={applyOpen}
        onClose={() => setApplyOpen(false)}
        title={`Apply to ${job.title}`}
        height="75%"
      >
        <View className="gap-5 pt-2">
          <Card elevation="flat">
            <View className="flex-row items-center gap-3">
              <Avatar name={job.poster?.company ?? ''} size="sm" />
              <View>
                <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{job.title}</Text>
                <Text className="text-xs text-neutral-400">{job.poster?.company}</Text>
              </View>
            </View>
          </Card>

          <Input
            label="Cover letter (optional)"
            placeholder="Why are you a great fit? What excites you about this role?"
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            numberOfLines={6}
            hint="Keep it concise — 2–3 sentences is perfect for most applications"
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />

          <Button
            label={submitting ? 'Submitting…' : 'Submit application'}
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            onPress={handleApply}
          />

          <Text className="text-xs text-neutral-400 text-center">
            Your profile and resume will be shared with the recruiter
          </Text>
        </View>
      </BottomSheet>
    </>
  )
}