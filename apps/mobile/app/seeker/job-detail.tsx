import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, Modal,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  PageLayout, Badge, Tag, Button,
  Card, Avatar, Divider,
  Input, SectionHeader,
  Toast,
} from '@my-app/ui'
import {
  getListingById, applyToJob, hasApplied,
  getSupabase, type JobListing,
} from '@my-app/supabase'

// ───────────────── APPLY MODAL ─────────────────

function ApplyModal({
  visible,
  onClose,
  job,
  coverLetter,
  setCoverLetter,
  submitting,
  onSubmit,
}: any) {
  if (!job) return null

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white dark:bg-neutral-900 rounded-t-3xl p-5 gap-5">

          {/* Header */}
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold">Apply</Text>
            <Pressable onPress={onClose}>
              <Text className="text-neutral-400 text-lg">✕</Text>
            </Pressable>
          </View>

          {/* Job preview */}
          <Card elevation="flat">
            <View className="flex-row items-center gap-3">
              <Avatar name={job.poster?.company ?? ''} size="sm" />
              <View>
                <Text className="text-sm font-semibold">{job.title}</Text>
                <Text className="text-xs text-neutral-400">{job.poster?.company}</Text>
              </View>
            </View>
          </Card>

          {/* Input */}
          <Input
            label="Cover letter"
            placeholder="Why are you a great fit?"
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            numberOfLines={5}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />

          {/* Action */}
          <Button
            label={submitting ? 'Submitting…' : 'Submit application'}
            loading={submitting}
            fullWidth
            onPress={onSubmit}
          />

          <Text className="text-xs text-neutral-400 text-center">
            Your profile will be shared with the recruiter
          </Text>
        </View>
      </View>
    </Modal>
  )
}

// ───────────────── JOB HEADER ─────────────────

function JobHeader({ job }: { job: JobListing }) {
  return (
    <View className="bg-white dark:bg-neutral-800 px-5 pt-4 pb-5 gap-4">
      <View className="flex-row gap-4 items-start">
        <Avatar name={job.poster?.company ?? ''} size="lg" />
        <View className="flex-1 gap-1">
          <Text className="text-2xl font-bold">{job.title}</Text>
          <Text className="text-base text-neutral-500">{job.poster?.company}</Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {job.employment_type && (
          <Badge label={job.employment_type.replace('_', '-')} />
        )}
        {job.experience_level && (
          <Badge label={job.experience_level} variant="neutral" />
        )}
        {job.is_remote && <Badge label="Remote" variant="success" />}
      </View>
    </View>
  )
}

// ───────────────── MAIN SCREEN ─────────────────

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const [job, setJob] = useState<JobListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [applied, setApplied] = useState(false)

  const [applyOpen, setApplyOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      job_id: job.id,
      user_id: user.id,
      cover_letter: coverLetter.trim() || undefined,
    })

    if (result) {
      setApplied(true)
      setApplyOpen(false)
      Toast.showSuccess('Application submitted')
    } else {
      Toast.showError('Failed to apply')
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <PageLayout>
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator />
        </View>
      </PageLayout>
    )
  }

  if (!job) return null

  const requiredSkills = job.skills?.filter(s => s.required) ?? []
  const optionalSkills = job.skills?.filter(s => !s.required) ?? []

  return (
    <>
      <PageLayout
        header={{
          title: job.title,
          left: (
            <Pressable onPress={() => router.back()}>
              <Text>‹</Text>
            </Pressable>
          ),
        }}
        footer={
          applied ? (
            <Text className="text-center text-neutral-500">✓ Already applied</Text>
          ) : (
            <Button label="Apply now" fullWidth onPress={() => setApplyOpen(true)} />
          )
        }
      >
        <ScrollView>
          <JobHeader job={job} />

          <Divider />

          <View className="px-5 py-5 gap-6">
            {job.description && (
              <View>
                <SectionHeader title="About this role" />
                <Text>{job.description}</Text>
              </View>
            )}

            {requiredSkills.length > 0 && (
              <View>
                <SectionHeader title="Required skills" />
                <View className="flex-row flex-wrap gap-2">
                  {requiredSkills.map(s => (
                    <Tag key={s.id} label={s.name} required />
                  ))}
                </View>
              </View>
            )}

            {optionalSkills.length > 0 && (
              <View>
                <SectionHeader title="Nice to have" />
                <View className="flex-row flex-wrap gap-2">
                  {optionalSkills.map(s => (
                    <Tag key={s.id} label={s.name} muted />
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </PageLayout>

      <ApplyModal
        visible={applyOpen}
        onClose={() => setApplyOpen(false)}
        job={job}
        coverLetter={coverLetter}
        setCoverLetter={setCoverLetter}
        submitting={submitting}
        onSubmit={handleApply}
      />
    </>
  )
}