import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import {
  PageLayout, ProfileHeader, Card,
  SectionHeader, Divider, Button, Input,
  Toast, ThemeToggle
} from '@my-app/ui'
import {
  getProfile, getSupabase,
  type Profile, type JobSeeker,
  getFullResume, upsertResume
} from '@my-app/supabase'

import { ResumeUploadButton } from '../uploadResumeBtn'

// ───────────────── HELPERS ─────────────────

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



// ───────────────── PROFILE VIEW ─────────────────

function ProfileView({ profile, seeker, resume, onEdit, userId, onRefresh }: any) {
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

      <Divider />

      <View className="px-5 pt-4">
        <ResumeUploadButton
          userId={userId}
          hasResume={!!seeker?.headline}
          showStatus
          onSuccess={onRefresh}
        />
      </View>

      <View className="px-5 py-6 gap-8">

        {/* About */}
        <View className="gap-3">
          <SectionHeader title="About" action={{ label: 'Edit', onPress: onEdit }} />
          {seeker?.bio ? (
            <Text className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {seeker.bio}
            </Text>
          ) : (
            <Pressable onPress={onEdit}>
              <Text className="text-sm text-neutral-400 dark:text-neutral-500 italic">
                + Add bio
              </Text>
            </Pressable>
          )}
        </View>

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
            <Text className="text-sm text-neutral-400 dark:text-neutral-500 italic">
              + Add skills
            </Text>
          )}
        </View>

        {/* Experience */}
        <View className="gap-3">
          <SectionHeader title="Experience" />
          {resume?.experiences?.length ? (
            resume.experiences.map((exp: any) => (
              <Card key={exp.id} className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                  {exp.role}
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  {exp.company_name}
                </Text>
                <Text className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                </Text>
                {exp.description && (
                  <Text className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
                    {exp.description}
                  </Text>
                )}
              </Card>
            ))
          ) : (
            <Text className="text-sm text-neutral-400 dark:text-neutral-500 italic">
              + Add experience
            </Text>
          )}
        </View>

        {/* Education */}
        <View className="gap-3">
          <SectionHeader title="Education" />
          {resume?.education?.length ? (
            resume.education.map((edu: any) => (
              <Card key={edu.id} className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                  {edu.degree || 'Degree'}
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  {edu.institution}
                </Text>
                <Text className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  {formatDate(edu.start_date)} — {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                </Text>
              </Card>
            ))
          ) : (
            <Text className="text-sm text-neutral-400 dark:text-neutral-500 italic">
              + Add education
            </Text>
          )}
        </View>

        {/* Theme */}
        <View className="gap-3">
          <SectionHeader title="Appearance" />
          <ThemeToggle variant="row" />
        </View>

      </View>
    </>
  )
}

// ───────────────── EDIT VIEW ─────────────────

function ProfileEdit({ profile, seeker, resume, onCancel, onSave }: any) {
  const [name, setName] = useState(profile?.full_name ?? '')
  const [headline, setHeadline] = useState(seeker?.headline ?? '')
  const [location, setLocation] = useState(seeker?.location ?? '')
  const [bio, setBio] = useState(seeker?.bio ?? '')



  const [experiences, setExperiences] = useState(resume?.experiences ?? [])
  const [education, setEducation] = useState(resume?.education ?? [])

  function update(list: any[], setter: any, i: number, field: string, value: string) {
    const copy = [...list]
    copy[i] = { ...copy[i], [field]: value }
    setter(copy)
  }

  const [skills, setSkills] = useState<string[]>(
    resume?.skills?.map((s: any) => s.name) ?? []
  )

  const [skillInput, setSkillInput] = useState('')

  function addSkill(value: string) {
  const cleaned = value.trim()
  if (!cleaned) return

  if (skills.includes(cleaned)) return // prevent duplicates

  setSkills(prev => [...prev, cleaned])
  setSkillInput('')
}

function removeSkill(index: number) {
  setSkills(prev => prev.filter((_, i) => i !== index))
}

  return (
    <ScrollView contentContainerClassName="px-5 py-6 gap-8">

      <SectionHeader title="Edit Profile" />

      <Input label="Full name" value={name} onChangeText={setName} />
      <Input label="Headline" value={headline} onChangeText={setHeadline} />
      <Input label="Location" value={location} onChangeText={setLocation} />
      <Input label="Bio" value={bio} onChangeText={setBio} multiline />

<View className="gap-3">
  <SectionHeader title="Skills" />

  {/* Chips */}
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

  {/* Input */}
<Input
  label="Add skill"
  value={skillInput}
  onChangeText={(text) => {
    // if comma typed
    if (text.includes(',')) {
      const parts = text.split(',')

      parts.forEach(part => {
        const cleaned = part.trim()
        if (cleaned) addSkill(cleaned)
      })

      setSkillInput('') // clear input
    } else {
      setSkillInput(text)
    }
  }}
  onSubmitEditing={() => addSkill(skillInput)}
/>
</View>

      {/* Experience */}
      <SectionHeader title="Experience" />

      {experiences.map((exp: any, i: number) => (
        <View key={i} className="gap-2 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
          <Input label="Role" value={exp.role} onChangeText={(v) => update(experiences, setExperiences, i, 'role', v)} />
          <Input label="Company" value={exp.company_name} onChangeText={(v) => update(experiences, setExperiences, i, 'company_name', v)} />
          <Input label="Start Date (YYYY-MM)" value={exp.start_date} onChangeText={(v) => update(experiences, setExperiences, i, 'start_date', v)} />
          <Input label="End Date (YYYY-MM)" value={exp.end_date} onChangeText={(v) => update(experiences, setExperiences, i, 'end_date', v)} />
        </View>
      ))}

      <Button label="+ Add Experience" onPress={() =>
        setExperiences([...experiences, { role: '', company_name: '', start_date: '', end_date: '' }])
      } />

      {/* Education */}
      <SectionHeader title="Education" />

      {education.map((edu: any, i: number) => (
        <View key={i} className="gap-2 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
          <Input label="Degree" value={edu.degree} onChangeText={(v) => update(education, setEducation, i, 'degree', v)} />
          <Input label="Institution" value={edu.institution} onChangeText={(v) => update(education, setEducation, i, 'institution', v)} />
          <Input label="Start Date (YYYY-MM)" value={edu.start_date} onChangeText={(v) => update(education, setEducation, i, 'start_date', v)} />
          <Input label="End Date (YYYY-MM)" value={edu.end_date} onChangeText={(v) => update(education, setEducation, i, 'end_date', v)} />
        </View>
      ))}

      <Button label="+ Add Education" onPress={() =>
        setEducation([...education, { degree: '', institution: '', start_date: '', end_date: '' }])
      } />

      <Button
        label="Save"
        onPress={() =>
          onSave({
            name,
            headline,
            location,
            bio,
            skills,
            experiences,
            education,
          })
        }
      />

      <Button label="Cancel" variant="ghost" onPress={onCancel} />

    </ScrollView>
  )
}

// ───────────────── MAIN SCREEN ─────────────────

export default function SeekerProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [seeker, setSeeker] = useState<JobSeeker | null>(null)
  const [resume, setResume] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'profile' | 'edit'>('profile')

  useEffect(() => { load() }, [])

  async function load() {
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
  }

async function handleSave(data: any) {
  try {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user) return

    await upsertResume(user.id, {
      ...data,
      skills: data.skills.map((name: string) => ({ name })),
      experiences: data.experiences,
      education: data.education,
    })

    Toast.showSuccess('Profile updated')
    setMode('profile')
    load()

  } catch (err) {
    console.error(err)
    Toast.showError('Failed to update')
  }
}

  if (loading) return <PageLayout><View /></PageLayout>

  return (
    <PageLayout header={{ title: 'Profile' }}>
      {mode === 'profile' ? (
        <ScrollView>
          <ProfileView
            profile={profile}
            seeker={seeker}
            resume={resume}
            userId={profile?.id}
            onEdit={() => setMode('edit')}
            onRefresh={load}
          />
        </ScrollView>
      ) : (
        <ProfileEdit
          profile={profile}
          seeker={seeker}
          resume={resume}
          onCancel={() => setMode('profile')}
          onSave={handleSave}
        />
      )}
    </PageLayout>
  )
}