// packages/supabase/src/queries/profiles.ts

import { getSupabase } from '../client'
import type { Profile, JobSeeker, JobPoster } from '../types'

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('❌ getProfile error:', error)
    return null
  }

  console.log('✅ getProfile success:', data)
  return data
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'role' | 'onboarded'>>
): Promise<Profile | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('❌ updateProfile error:', error)
    return null
  }

  console.log('✅ updateProfile success:', data)
  return data
}

// ─────────────────────────────────────────────
// JOB SEEKER
// ─────────────────────────────────────────────

export async function getJobSeeker(userId: string): Promise<JobSeeker | null> {
  const { data, error } = await getSupabase()
    .from('job_seekers')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('❌ getJobSeeker error:', error)
    return null
  }

  console.log('✅ getJobSeeker success:', data)
  return data
}

export async function upsertJobSeeker(
  userId: string,
  updates: Partial<Omit<JobSeeker, 'id' | 'created_at' | 'updated_at'>>
): Promise<JobSeeker | null> {
  const payload = { id: userId, ...updates }

  console.log('📦 upsertJobSeeker payload:', payload)

  const { data, error } = await getSupabase()
    .from('job_seekers')
    .upsert(payload)
    .select()
    .single()

  if (error) {
    console.error('❌ upsertJobSeeker error:', error)
    return null
  }

  if (!data) {
    console.error('❌ upsertJobSeeker returned no data')
    return null
  }

  console.log('✅ upsertJobSeeker success:', data)
  return data
}

// ─────────────────────────────────────────────
// JOB POSTER
// ─────────────────────────────────────────────

export async function getJobPoster(userId: string): Promise<JobPoster | null> {
  const { data, error } = await getSupabase()
    .from('job_posters')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('❌ getJobPoster error:', error)
    return null
  }

  console.log('✅ getJobPoster success:', data)
  return data
}

export async function upsertJobPoster(
  userId: string,
  updates: Partial<Omit<JobPoster, 'id' | 'created_at'>>
): Promise<JobPoster | null> {
  const payload = { id: userId, ...updates }

  console.log('📦 upsertJobPoster payload:', payload)

  const { data, error } = await getSupabase()
    .from('job_posters')
    .upsert(payload)
    .select()
    .single()

  if (error) {
    console.error('❌ upsertJobPoster error:', error)
    return null
  }

  if (!data) {
    console.error('❌ upsertJobPoster returned no data')
    return null
  }

  console.log('✅ upsertJobPoster success:', data)
  return data
}

export async function syncUserSkills(userId: string, skillNames: string[]) {
  const supabase = getSupabase()

  // 1. Get existing skills
  const { data: existingSkills } = await supabase
    .from('skills')
    .select('*')
    .in('name', skillNames)

  const existingMap = new Map(existingSkills?.map(s => [s.name, s]))

  // 2. Create missing skills
  const newSkills = skillNames
    .filter(name => !existingMap.has(name))
    .map(name => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }))

  let createdSkills: any[] = []
  if (newSkills.length) {
    const { data } = await supabase
      .from('skills')
      .insert(newSkills)
      .select()

    createdSkills = data || []
  }

  const allSkills = [...(existingSkills || []), ...createdSkills]

  // 3. Clear old relations
  await supabase
    .from('job_seeker_skills')
    .delete()
    .eq('user_id', userId)

  // 4. Insert new relations
  await supabase
    .from('job_seeker_skills')
    .insert(
      allSkills.map(s => ({
        user_id: userId,
        skill_id: s.id,
      }))
    )
}