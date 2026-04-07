import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import {
  PageLayout, ProfileHeader, Card,
  SectionHeader, Divider, Button, Input,
  Toast, ThemeToggle,
  DateInput
} from '@my-app/ui'
import {
  getProfile, getSupabase,
  type Profile, type JobSeeker,
  getFullResume, upsertResume,
  upsertJobSeeker,
  updateProfile,
  syncUserSkills
} from '@my-app/supabase'
import { ResumeUploadButton } from '@my-app/features'
import { Stack } from 'expo-router'

// ───────────── HELPERS ─────────────

function formatDate(date?: string) {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  } catch {
    return ''
  }
}

// ───────────── PROFILE VIEW ─────────────

function ProfileView({ profile, seeker, resume, onEdit, userId, onRefresh, onSignOut }: any) {
  return (
    <>
      <ProfileHeader
        name={profile?.full_name ?? 'Your Name'}
        avatarUri={profile?.avatar_url ?? undefined}
        headline={seeker?.headline ?? undefined}
        location={seeker?.location ?? undefined}
        isOwn
        onEdit={onEdit}
      />
      <Stack.Screen options={{ title: 'Profile' }} />

      <Divider />

      {/* Resume Upload */}
      <View className="px-5 pt-4">
        <ResumeUploadButton
          userId={userId}
          hasResume={!!seeker?.headline}
          showStatus
          onSuccess={onRefresh}
        />
      </View>

      <View className="px-5 py-6 gap-8">

        {/* Skills */}
        <View className="gap-3">
          <SectionHeader title="Skills" />

          {resume?.skills?.length ? (
            <View className="flex-row flex-wrap gap-2">
              {resume.skills.map((s: any) => (
                <View
                  key={s.id}
                  className="px-3 py-1 rounded-full
                  bg-neutral-100 dark:bg-neutral-800
                  border border-neutral-200 dark:border-neutral-700"
                >
                  <Text className="text-sm text-neutral-800 dark:text-neutral-200">
                    {s.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-neutral-500">+ Add skills</Text>
          )}
        </View>

        {/* Experience */}
        <View className="gap-3">
          <SectionHeader title="Experience" />

          {resume?.experiences?.length ? (
            resume.experiences.map((exp: any) => (
              <View
                key={exp.id}
                className="p-4 rounded-2xl
                bg-white dark:bg-neutral-900 
                border border-neutral-200 dark:border-neutral-700
                gap-1"
              >
                <Text className="text-base font-semibold dark:text-neutral-200">
                  {exp.role}
                </Text>

                <Text className="text-neutral-600 dark:text-neutral-400">
                  {exp.company_name}
                </Text>

                <Text className="text-sm text-neutral-500">
                  {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-neutral-500">+ Add experience</Text>
          )}
        </View>

        {/* Education */}
        <View className="gap-3">
          <SectionHeader title="Education" />

          {resume?.education?.length ? (
            resume.education.map((edu: any) => (
              <View
                key={edu.id}
                className="p-4 rounded-2xl
                bg-white dark:bg-neutral-900
                border border-neutral-200 dark:border-neutral-700
                gap-1"
              >
                <Text className="text-base font-semibold dark:text-neutral-200">
                  {edu.degree || 'Degree'}
                </Text>

                <Text className="text-neutral-600 dark:text-neutral-400">
                  {edu.institution}
                </Text>

                <Text className="text-sm text-neutral-500">
                  {formatDate(edu.start_date)} — {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-neutral-500">+ Add education</Text>
          )}
        </View>

        <ThemeToggle />
      </View>

      <View className="px-5 pb-6">
        <Button
          className="bg-red-600 border-red-500"
          label="Sign Out"
          onPress={onSignOut}
        />
      </View>
    </>
  )
}

// ───────────── EDIT VIEW ─────────────

function ProfileEdit({ profile, seeker, resume, onCancel, onSave }: any) {
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')

  const [experiences, setExperiences] = useState<any[]>([])
  const [education, setEducation] = useState<any[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  // ✅ FULL SYNC
  useEffect(() => {
    setName(profile?.full_name ?? '')
    setHeadline(seeker?.headline ?? '')
    setLocation(seeker?.location ?? '')
    setBio(seeker?.bio ?? '')

    setExperiences(resume?.experiences ?? [])
    setEducation(resume?.education ?? [])
    setSkills(resume?.skills?.map((s: any) => s.name) ?? [])
  }, [profile, seeker, resume])

  function update(
    list: any[],
    setter: any,
    i: number,
    field: string,
    value: string | null
  ) {
    const copy = [...list]
    copy[i] = { ...copy[i], [field]: value }
    setter(copy)
  }

  function addSkill(value: string) {
    const cleaned = value.trim()
    if (!cleaned || skills.includes(cleaned)) return
    setSkills(prev => [...prev, cleaned])
    setSkillInput('')
  }

  function removeSkill(i: number) {
    setSkills(prev => prev.filter((_, idx) => idx !== i))
  }

  return (
    <ScrollView contentContainerClassName="px-5 py-6 gap-8">

      <Input label="Full name" value={name} onChangeText={setName} />
      <Input label="Headline" value={headline} onChangeText={setHeadline} />
      <Input label="Location" value={location} onChangeText={setLocation} />
      <Input label="Bio" value={bio} onChangeText={setBio} multiline />

      {/* Skills */}
<View className="gap-3">
  <SectionHeader title="Skills" />

  <View className="flex-row flex-wrap gap-2">
    {skills.map((skill, i) => (
      <View
        key={i}
        className="flex-row items-center px-3 py-1 rounded-full
        bg-neutral-100 dark:bg-neutral-800
        border border-neutral-200 dark:border-neutral-700"
      >
        <Text className="text-sm text-neutral-800 dark:text-neutral-200">
          {skill}
        </Text>

        <Pressable onPress={() => removeSkill(i)}>
          <Text className="ml-2 text-neutral-500 dark:text-neutral-400">
            ✕
          </Text>
        </Pressable>
      </View>
    ))}
  </View>

  <Input
    label="Add skill"
    value={skillInput}
    onChangeText={(text) => {
      if (text.includes(',')) {
        const parts = text.split(',')

        parts.forEach(part => {
          const cleaned = part.trim()
          if (cleaned) addSkill(cleaned)
        })

        setSkillInput('')
      } else {
        setSkillInput(text)
      }
    }}
    onSubmitEditing={() => addSkill(skillInput)}
  />
</View>


      {/* Experience */}
<View className="gap-3">
  <SectionHeader title="Experience" />

  {experiences.map((exp, i) => (
    <View
      key={i}
      className="gap-2 p-4 rounded-2xl
      bg-white dark:bg-neutral-900
      border border-neutral-200 dark:border-neutral-700"
    >
      <Input
        label="Role"
        value={exp.role ?? ''}
        onChangeText={(v) => update(experiences, setExperiences, i, 'role', v)}
      />

      <Input
        label="Company"
        value={exp.company_name ?? ''}
        onChangeText={(v) => update(experiences, setExperiences, i, 'company_name', v)}
      />

      <DateInput
        label="Start Date"
        value={exp.start_date}
        onChange={(date) =>
          update(experiences, setExperiences, i, 'start_date', date)
        }
      />

      <DateInput
        label="End Date"
        value={exp.end_date}
        onChange={(date) =>
          update(experiences, setExperiences, i, 'end_date', date)
        }
      />

      {/* ✅ REMOVE BUTTON (missing before) */}
      <Button
        label="Remove"
        className='bg-red-500 border-red-500' 
        onPress={() =>
          setExperiences(prev => prev.filter((_, idx) => idx !== i))
        }
      />
    </View>
  ))}

  <Button
    label="+ Add Experience"
    onPress={() =>
      setExperiences(prev => [
        ...prev,
        { role: '', company_name: '', start_date: '', end_date: '' }
      ])
    }
  />
</View>

      {/* Education */}
<View className="gap-3">
  <SectionHeader title="Education" />

  {education.map((edu, i) => (
    <View
      key={i}
      className="gap-2 p-4 rounded-2xl
      bg-white dark:bg-neutral-900
      border border-neutral-200 dark:border-neutral-700"
    >
      <Input
        label="Degree"
        value={edu.degree ?? ''}
        onChangeText={(v) => update(education, setEducation, i, 'degree', v)}
      />

      <Input
        label="Institution"
        value={edu.institution ?? ''}
        onChangeText={(v) => update(education, setEducation, i, 'institution', v)}
      />

      <DateInput
        label="Start Date"
        value={edu.start_date}
        onChange={(date) =>
          update(education, setEducation, i, 'start_date', date)
        }
      />

      <DateInput
        label="End Date"
        value={edu.end_date ?? ''}
        onChange={(date) =>
          update(education, setEducation, i, 'end_date', date)
        }
      />

      <Button
        label="Remove"
        className='bg-red-500 border-red-500' 
        onPress={() =>
          setEducation(prev => prev.filter((_, idx) => idx !== i))
        }
      />
    </View>
  ))}
  
</View>

      <Button label="+ Add Education" onPress={() =>
        setEducation(prev => [...prev, { degree: '', institution: '', start_date: '', end_date: '' }])
      } />

      <Button label="Save" onPress={() =>
        onSave({ name, headline, location, bio, skills, experiences, education })
      } />

      <Button label="Cancel" onPress={onCancel} />
    </ScrollView>
  )
}

// ───────────── MAIN ─────────────

export default function SeekerProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [seeker, setSeeker] = useState<JobSeeker | null>(null)
  const [resume, setResume] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'profile' | 'edit'>('profile')

  const load = useCallback(async () => {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return

    const [p, full] = await Promise.all([
      getProfile(user.id),
      getFullResume(user.id),
    ])

    setProfile(p)
    setSeeker(full?.profile)
    setResume(full)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(data: any) {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return

    await updateProfile(user.id, { full_name: data.name })
    await upsertJobSeeker(user.id, {
      headline: data.headline,
      bio: data.bio,
      location: data.location,
    })
    await syncUserSkills(user.id, data.skills)

    await upsertResume(user.id, {
      experiences: data.experiences,
      education: data.education,
    })

    load()
    setMode('profile')
  }
  async function handleSignOut() {
    try {
      await getSupabase().auth.signOut()
      Toast.showSuccess('Signed out')
    } catch {
      Toast.showError('Failed to sign out')
    }
  }

  if (loading) return <PageLayout><View /></PageLayout>

  return (
    <PageLayout>
      {mode === 'profile'
        ? <ProfileView
            profile={profile}
            seeker={seeker}
            resume={resume}
            onEdit={() => setMode('edit')}
            onRefresh={load}
            onSignOut={handleSignOut}
          />
        : <ProfileEdit profile={profile} seeker={seeker} resume={resume} onCancel={() => setMode('profile')} onSave={handleSave} />
      }
    </PageLayout>
  )
}