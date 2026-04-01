import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import {
  PageLayout, Input, Button, Toggle,
  StepIndicator, FormSection, Chip, Divider,
  Toast,
} from '@my-app/ui'
import {
  createListing, getSupabase,
  type EmploymentType,
  type ExperienceLevel,
  type ListingStatus,
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
    if (step === 0) return !!title.trim() && !!empType
    if (step === 1) return !!description.trim()
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

    // ✅ VALIDATION
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

      const payload = {
        poster_id: poster.id,
        title: title.trim(),
        description: description.trim(),
        employment_type: empType ?? undefined,
        experience_level: expLevel ?? undefined,
        location: location.trim() || undefined,
        is_remote: isRemote,
        salary_min: salaryMin ? parseInt(salaryMin) : undefined,
        salary_max: salaryMax ? parseInt(salaryMax) : undefined,
        application_deadline: deadline || undefined,
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
          <FormSection title="What role are you hiring for?">
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
          </FormSection>
        )}

        {step === 1 && (
          <FormSection title="Describe the role">
            <Input
              label="Job description *"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={10}
            />
          </FormSection>
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

/* ───────────────── VALIDATION ───────────────── */

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