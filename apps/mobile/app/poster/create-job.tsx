
import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import {
  PageLayout, Input, Button, Toggle,
  StepIndicator, FormSection, Chip,
  Toast,
  DateInput,
} from '@my-app/ui'
import {
  createListing, getSupabase,
  type EmploymentType,
  type ExperienceLevel,
  type ListingStatus,
} from '@my-app/supabase'

// ✅ ONLY 2 STEPS
const STEPS = ['Job details', 'Compensation']

const EMPLOYMENT_TYPES = [
  { label: 'Full-time', value: 'full_time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Part-time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
]

const EXPERIENCE_LEVELS = [
  { label: 'Fresher', value: 'fresher' },
  { label: 'Junior', value: 'junior' },
  { label: 'Mid-level', value: 'mid' },
  { label: 'Senior', value: 'senior' },
]

// ───────────────── STEP 1 ─────────────────
function StepJobDetails({
  title, setTitle,
  empType, setEmpType,
  description, setDescription,
}: any) {
  return (
    <FormSection title="">
      <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm gap-4">
        <Stack.Screen options={{ title: 'Create-Job' }} />

        <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
          Job Details
        </Text>

        <View className="gap-4">
          <Input
            label="Job title *"
            placeholder="e.g. Frontend Engineer"
            value={title}
            onChangeText={setTitle}
          />

          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Employment type *
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-1">
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

          <Input
            label="Job description *"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            className="min-h-[120px]"
          />
        </View>
      </View>
    </FormSection>
  )
}

// ───────────────── STEP 2 ─────────────────
function StepCompensation({
  expLevel, setExpLevel,
  location, setLocation,
  isRemote, setIsRemote,
  salaryMin, setSalaryMin,
  salaryMax, setSalaryMax,
  deadline, setDeadline,
}: any) {
  return (
    <FormSection title="">
      <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm gap-4">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
          Compensation & Requirements
        </Text>

        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Experience level
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-1">
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

          <Input
            label="Location"
            value={location}
            onChangeText={setLocation}
          />

          <Toggle
            label="Remote"
            value={isRemote}
            onToggle={setIsRemote}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Min salary"
                value={salaryMin}
                onChangeText={setSalaryMin}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Max salary"
                value={salaryMax}
                onChangeText={setSalaryMax}
                keyboardType="numeric"
              />
            </View>
          </View>

<DateInput
  label="Application deadline"
  value={deadline}
  onChange={setDeadline}
/>
        </View>
      </View>
    </FormSection>
  )
}

// ───────────────── MAIN SCREEN ─────────────────

export default function CreateJobScreen() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [empType, setEmpType] = useState<EmploymentType | null>(null)
  const [expLevel, setExpLevel] = useState<ExperienceLevel | null>(null)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [isRemote, setIsRemote] = useState(false)
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [deadline, setDeadline] = useState('')

  function canAdvance(): boolean {
    if (step === 0) {
      return !!title.trim() && !!empType && !!description.trim()
    }
    return true
  }

  async function handlePublish() {
    console.log('🚀 Publishing job...')

    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) {
      Toast.showError('User not authenticated')
      return
    }

    const { data: poster } = await getSupabase()
      .from('job_posters')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!poster) {
      Toast.showError('Poster profile not found')
      return
    }

    const error = validateJob({
      title,
      description,
      empType,
      salaryMin,
      salaryMax,
    })

    if (error) {
      Toast.showError(error)
      return
    }

    setSaving(true)

    try {
      const payload = {
        poster_id: poster.id,
        title: title.trim(),
        description: description.trim() || null,
        employment_type: empType ?? null,
        experience_level: expLevel ?? null,
        location: location.trim() || null,
        is_remote: isRemote,
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        application_deadline: deadline
          ? new Date(deadline).toISOString()
          : null,
        status: 'open' as ListingStatus,
      }

      const listing = await createListing(payload)

      if (!listing) {
        Toast.showError('Failed to create job')
        setSaving(false)
        return
      }

      Toast.showSuccess('Job posted successfully')
      router.replace('/poster/dashboard')
    } catch (err) {
      console.error(err)
      Toast.showError('Something went wrong')
      setSaving(false)
      return
    }

    setSaving(false)
  }

  return (
    <PageLayout
      header={{
        title: 'Post a job',
        left: (
          <Pressable
            onPress={() => step > 0 ? setStep(s => s - 1) : router.back()}
            className="w-10 h-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800"
          >
            <Text className="text-neutral-700 dark:text-neutral-300">‹</Text>
          </Pressable>
        ),
      }}
      noScroll
      noPad
    >
      <ScrollView contentContainerClassName="px-5 pt-6 pb-28 gap-6 bg-neutral-50 dark:bg-black">
        <StepIndicator steps={STEPS} current={step} />

        {step === 0 && (
          <StepJobDetails
            title={title}
            setTitle={setTitle}
            empType={empType}
            setEmpType={setEmpType}
            description={description}
            setDescription={setDescription}
          />
        )}

        {step === 1 && (
          <StepCompensation
            expLevel={expLevel}
            setExpLevel={setExpLevel}
            location={location}
            setLocation={setLocation}
            isRemote={isRemote}
            setIsRemote={setIsRemote}
            salaryMin={salaryMin}
            setSalaryMin={setSalaryMin}
            salaryMax={salaryMax}
            setSalaryMax={setSalaryMax}
            deadline={deadline}
            setDeadline={setDeadline}
          />
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <View className="px-5 pb-6 pt-3 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800">
        {step < STEPS.length - 1 ? (
          <Button
            label="Continue"
            fullWidth
            disabled={!canAdvance()}
            onPress={() => setStep(s => s + 1)}
          />
        ) : (
          <Button
            label="Publish job"
            fullWidth
            loading={saving}
            onPress={handlePublish}
          />
        )}
      </View>
    </PageLayout>
  )
}

// ───────────────── VALIDATION ─────────────────

export function validateJob(data: any): string | null {
  if (!data.title.trim()) return 'Job title is required'
  if (!data.empType) return 'Select employment type'
  if (!data.description.trim()) return 'Description is required'

  if (data.salaryMin && data.salaryMax) {
    const min = Number(data.salaryMin)
    const max = Number(data.salaryMax)

    if (isNaN(min) || isNaN(max)) return 'Invalid salary values'
    if (min > max) return 'Min salary cannot exceed max salary'
  }

  return null
}

