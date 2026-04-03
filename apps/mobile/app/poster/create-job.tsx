import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import {
  PageLayout, Input, Button, Toggle,
  StepIndicator, FormSection, Chip,
  Toast,
} from '@my-app/ui'
import {
  createListing, getSupabase,
  type EmploymentType,
  type ExperienceLevel,
  type ListingStatus,
} from '@my-app/supabase'

// ✅ ONLY 2 STEPS
const STEPS = ['Job details', 'Compensation']

const EMPLOYMENT_TYPES: { label: string; value: EmploymentType }[] = [
  { label: 'Full-time', value: 'full_time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Part-time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
]

const EXPERIENCE_LEVELS: { label: string; value: ExperienceLevel }[] = [
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
    <FormSection title="Job Details">
      <Input
        label="Job title *"
        placeholder="e.g. Frontend Engineer"
        value={title}
        onChangeText={setTitle}
      />

      <View className="gap-2">
        <Text className="text-sm font-medium">Employment type *</Text>
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

      <Input
        label="Job description *"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={8}
      />
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
    <FormSection title="Compensation & Requirements">
      <View className="gap-2">
        <Text className="text-sm font-medium">Experience level</Text>
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

      <Input
        label="Min salary"
        value={salaryMin}
        onChangeText={setSalaryMin}
        keyboardType="numeric"
      />

      <Input
        label="Max salary"
        value={salaryMax}
        onChangeText={setSalaryMax}
        keyboardType="numeric"
      />

      <Input
        label="Application deadline"
        value={deadline}
        onChangeText={setDeadline}
        placeholder="YYYY-MM-DD"
      />
    </FormSection>
  )
}

// ───────────────── MAIN SCREEN ─────────────────

export default function CreateJobScreen() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Form state
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
    console.log('👤 User:', user)

    if (!user) {
      Toast.showError('User not authenticated')
      return
    }

    const { data: poster } = await getSupabase()
      .from('job_posters')
      .select('id')
      .eq('id', user.id)
      .single()

    console.log('📄 Poster:', poster)

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
      const status: ListingStatus = 'open'

      function toNullableNumber(val: string): number | null {
        if (!val) return null
        const num = Number(val)
        return isNaN(num) ? null : num
      }

      const payload = {
        poster_id: poster.id,
        title: title.trim(),
        description: description.trim() || null,

        employment_type: empType ?? null,
        experience_level: expLevel ?? null,

        location: location.trim() || null,
        is_remote: isRemote,

        salary_min: toNullableNumber(salaryMin),
        salary_max: toNullableNumber(salaryMax),

        application_deadline: deadline
          ? new Date(deadline).toISOString()
          : null,

        status,
      }

      console.log('📦 Payload:', payload)

      const listing = await createListing(payload)

      console.log('✅ Listing:', listing)

      if (!listing) {
        Toast.showError('Failed to create job')
        setSaving(false)
        return
      }

      Toast.showSuccess('Job posted successfully')
      router.replace('/poster/dashboard')

    } catch (err) {
      console.error('❌ Publish error:', err)
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
            className="w-9 h-9 items-center justify-center rounded-xl bg-neutral-100"
          >
            <Text className="text-neutral-600">‹</Text>
          </Pressable>
        ),
      }}
      noScroll
      noPad
    >
      <ScrollView contentContainerClassName="px-5 pt-4 pb-8 gap-6">
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

        <View className="flex-row gap-3 pt-2">
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
      </ScrollView>
    </PageLayout>
  )
}

// ───────────────── VALIDATION ─────────────────

type ValidateJobInput = {
  title: string
  description: string
  empType: string | null
  salaryMin: string
  salaryMax: string
}

export function validateJob(data: ValidateJobInput): string | null {
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