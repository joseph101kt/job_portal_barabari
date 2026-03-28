// packages/supabase/src/queries/profiles.ts

import { getSupabase } from '../client'
import type { Profile, JobSeeker, JobPoster } from '../types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'role' | 'onboarded'>>
): Promise<Profile | null> {
  const { data } = await getSupabase()
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return data
}

export async function getJobSeeker(userId: string): Promise<JobSeeker | null> {
  const { data } = await getSupabase()
    .from('job_seekers')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function upsertJobSeeker(
  userId: string,
  updates: Partial<Omit<JobSeeker, 'id' | 'created_at' | 'updated_at'>>
): Promise<JobSeeker | null> {
  const { data } = await getSupabase()
    .from('job_seekers')
    .upsert({ id: userId, ...updates })
    .select()
    .single()
  return data
}

export async function getJobPoster(userId: string): Promise<JobPoster | null> {
  const { data } = await getSupabase()
    .from('job_posters')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function upsertJobPoster(
  userId: string,
  updates: Partial<Omit<JobPoster, 'id' | 'created_at'>>
): Promise<JobPoster | null> {
  const { data } = await getSupabase()
    .from('job_posters')
    .upsert({ id: userId, ...updates })
    .select()
    .single()
  return data
}