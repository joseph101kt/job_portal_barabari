// packages/supabase/src/queries/applications.ts

import { getSupabase } from '../client'
import type { Application, ApplicationStatus } from '../types'

// Job seeker: apply to a listing
export async function applyToJob(params: {
  job_id:       string
  user_id:      string
  cover_letter?: string
}): Promise<Application | null> {
  const { data } = await getSupabase()
    .from('applications')
    .insert(params)
    .select()
    .single()
  return data
}

// Job seeker: view their own applications
export async function getMyApplications(userId: string): Promise<Application[]> {
  const { data } = await getSupabase()
    .from('applications')
    .select(`
      *,
      job:job_listings (
        id, title, status, employment_type, experience_level,
        poster:job_posters ( company )
      )
    `)
    .eq('user_id', userId)
    .order('applied_at', { ascending: false })
  return data ?? []
}

// Job seeker: check if already applied
export async function hasApplied(jobId: string, userId: string): Promise<boolean> {
  const { data } = await getSupabase()
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('user_id', userId)
    .single()
  return !!data
}

// Job seeker: withdraw application
export async function withdrawApplication(applicationId: string): Promise<void> {
  await getSupabase()
    .from('applications')
    .delete()
    .eq('id', applicationId)
}

// Job poster: view all applications for a listing
export async function getApplicationsForListing(listingId: string): Promise<Application[]> {
  const { data } = await getSupabase()
    .from('applications')
    .select(`
      *,
      applicant:profiles (
        id, full_name, avatar_url,
        job_seeker:job_seekers ( headline, location, availability, ai_summary )
      )
    `)
    .eq('job_id', listingId)
    .order('applied_at', { ascending: false })
  return data ?? []
}

// Job poster: update application status (shortlist / reject / hire)
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<Application | null> {
  const { data } = await getSupabase()
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single()
  return data
}

// Job poster: get counts per status for a listing (for dashboard stats)
export async function getApplicationStats(listingId: string): Promise<{
  applied:     number
  shortlisted: number
  rejected:    number
  hired:       number
}> {
  const { data } = await getSupabase()
    .from('applications')
    .select('status')
    .eq('job_id', listingId)

  const rows = data ?? []
  return {
    applied:     rows.filter(r => r.status === 'applied').length,
    shortlisted: rows.filter(r => r.status === 'shortlisted').length,
    rejected:    rows.filter(r => r.status === 'rejected').length,
    hired:       rows.filter(r => r.status === 'hired').length,
  }
}