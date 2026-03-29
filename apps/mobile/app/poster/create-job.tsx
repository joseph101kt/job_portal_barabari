// apps/mobile/app/poster/create-job.tsx
import React, { useState } from 'react'
import { View, Text, ScrollView, Alert, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import {
  PageLayout, Input, Button, Toggle,
  StepIndicator, FormSection, Chip, Divider,
} from '@my-app/ui'
import {
  createListing, getSupabase,
  type EmploymentType, type ExperienceLevel,
} from '@my-app/supabase'

const STEPS = ['Role details', 'Description', 'Requirements', 'Compensation']

const EMPLOYMENT_TYPES: { label: string; value: EmploymentType }[] = [
  { label: 'Full-time',  value: 'full_time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Part-time',  value: 'part_time' },
  { label: 'Contract',   value: 'contract' },
]

const EXPERIENCE_LEVELS: { label: string; value: ExperienceLevel }[] = [
  { label: 'Fresher',   value: 'fresher' },
  { label: 'Junior',    value: 'junior' },
  { label: 'Mid-level', value: 'mid' },
  { label: 'Senior',    value: 'senior' },
]

export default function CreateJobScreen() {
  const router  = useRouter()
  const [step,  setStep]  = useState(0)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title,        setTitle]        = useState('')
  const [empType,      setEmpType]      = useState<EmploymentType | null>(null)
  const [expLevel,     setExpLevel]     = useState<ExperienceLevel | null>(null)
  const [description,  setDescription]  = useState('')
  const [location,     setLocation]     = useState('')
  const [isRemote,     setIsRemote]     = useState(false)
  const [salaryMin,    setSalaryMin]    = useState('')
  const [salaryMax,    setSalaryMax]    = useState('')
  const [deadline,     setDeadline]     = useState('')

  function canAdvance(): boolean {
    if (step === 0) return !!title.trim() && !!empType
    if (step === 1) return !!description.trim()
    return true
  }

  async function handlePublish() {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return

    // Get poster_id
    const { data: poster } = await getSupabase()
      .from('job_posters')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!poster) {
      Alert.alert('Error', 'Could not find your poster profile.')
      return
    }

    setSaving(true)
    const listing = await createListing({
      poster_id:        poster.id,
      title:            title.trim(),
      description:      description.trim() || undefined,
      employment_type:  empType ?? undefined,
      experience_level: expLevel ?? undefined,
      location:         location.trim() || undefined,
      is_remote:        isRemote,
      salary_min:       salaryMin ? parseInt(salaryMin, 10) : undefined,
      salary_max:       salaryMax ? parseInt(salaryMax, 10) : undefined,
      application_deadline: deadline || undefined,
      status:           'open',
    })

    if (listing) {
      Alert.alert('Posted!', 'Your job is now live.', [
        { text: 'View applicants', onPress: () => router.replace({ pathname: '/poster/job-applicants', params: { id: listing.id } }) },
        { text: 'Back to dashboard', onPress: () => router.replace('/poster/dashboard') },
      ])
    } else {
      Alert.alert('Error', 'Failed to post job. Please try again.')
    }
    setSaving(false)
  }

  return (
    <PageLayout
      header={{
        title: 'Post a job',
        left: (
          <Pressable onPress={() => step > 0 ? setStep(s => s - 1) : router.back()}
            className="w-9 h-9 items-center justify-center rounded-xl bg-neutral-100">
            <Text className="text-neutral-600">‹</Text>
          </Pressable>
        ),
      }}
      noScroll noPad
    >
      <ScrollView contentContainerClassName="px-5 pt-4 pb-8 gap-6">
        <StepIndicator steps={STEPS} current={step} />

        {/* Step 0 — Role basics */}
        {step === 0 && (
          <FormSection title="What role are you hiring for?">
            <Input
              label="Job title *"
              placeholder="e.g. Frontend Engineer, Data Analyst"
              value={title}
              onChangeText={setTitle}
            />

            <View className="gap-2">
              <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Employment type *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {EMPLOYMENT_TYPES.map(t => (
                  <Chip
                    key={t.value}
                    label={t.label}
                    selected={empType === t.value}
                    onPress={() => setEmpType(t.value)}
                  />
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Experience level
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map(l => (
                  <Chip
                    key={l.value}
                    label={l.label}
                    selected={expLevel === l.value}
                    onPress={() => setExpLevel(l.value)}
                  />
                ))}
              </View>
            </View>
          </FormSection>
        )}

        {/* Step 1 — Description */}
        {step === 1 && (
          <FormSection
            title="Describe the role"
            description="What will the candidate be doing? What makes this role exciting?"
          >
            <Input
              label="Job description *"
              placeholder="Describe responsibilities, day-to-day work, growth opportunities..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={10}
              style={{ minHeight: 200, textAlignVertical: 'top' }}
            />
            <Text className="text-xs text-neutral-400 text-right">
              {description.length} characters
            </Text>
          </FormSection>
        )}

        {/* Step 2 — Requirements (skills added later) */}
        {step === 2 && (
          <FormSection
            title="Location & work setup"
            description="Where will this person work?"
          >
            <Toggle
              value={isRemote}
              onToggle={setIsRemote}
              label="This is a remote role"
            />

            {!isRemote && (
              <Input
                label="Office location"
                placeholder="e.g. Bangalore, India"
                value={location}
                onChangeText={setLocation}
              />
            )}

            <Divider />

            <Input
              label="Application deadline"
              placeholder="YYYY-MM-DD  (optional)"
              value={deadline}
              onChangeText={setDeadline}
              hint="Leave blank for no deadline"
            />
          </FormSection>
        )}

        {/* Step 3 — Compensation */}
        {step === 3 && (
          <FormSection
            title="Compensation"
            description="Listings with salary ranges get 3× more applications."
          >
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label="Min salary / month"
                  placeholder="e.g. 15000"
                  value={salaryMin}
                  onChangeText={setSalaryMin}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Max salary / month"
                  placeholder="e.g. 25000"
                  value={salaryMax}
                  onChangeText={setSalaryMax}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Text className="text-xs text-neutral-400">
              Values in ₹. Leave blank to hide salary.
            </Text>

            <Divider />

            {/* Preview */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-neutral-600">Preview</Text>
              <View className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 gap-2 border border-neutral-200 dark:border-neutral-700">
                <Text className="text-base font-bold text-neutral-800 dark:text-neutral-100">{title || 'Job title'}</Text>
                {empType && <Text className="text-xs text-neutral-400">{empType.replace('_', '-')} · {expLevel ?? 'Any level'}</Text>}
                {isRemote ? <Text className="text-xs text-neutral-500">🏠 Remote</Text> : location ? <Text className="text-xs text-neutral-500">📍 {location}</Text> : null}
                {(salaryMin || salaryMax) && (
                  <Text className="text-sm font-semibold text-success-700">
                    💰 ₹{salaryMin || '?'}–{salaryMax || '?'}/mo
                  </Text>
                )}
              </View>
            </View>
          </FormSection>
        )}

        {/* Navigation */}
        <View className="flex-row gap-3 pt-2">
          {step < STEPS.length - 1 ? (
            <Button
              label="Continue"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canAdvance()}
              onPress={() => setStep(s => s + 1)}
            />
          ) : (
            <Button
              label="Publish job"
              variant="primary"
              size="lg"
              fullWidth
              loading={saving}
              onPress={handlePublish}
            />
          )}
        </View>
      </ScrollView>
    </PageLayout>
  )
}