// packages/supabase/src/queries/applications.ts

import { getSupabase } from '../client'
import type { Application, ApplicationStatus } from '../types'

// Job seeker: apply to a listing
export async function applyToJob(params: {
  job_id: string
  user_id: string
  cover_letter?: string
}): Promise<Application | null> {
  console.log('🚀 Applying to job')

  if (!params.job_id || !params.user_id) {
    console.error('❌ Missing job_id or user_id')
    return null
  }

  const payload = {
    job_id: params.job_id,
    user_id: params.user_id,
    cover_letter: params.cover_letter?.trim() || null,
  }

  console.log('📦 Payload:', payload)

  const { data, error } = await getSupabase()
    .from('applications')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('❌ Apply error:', error)
    return null
  }

  console.log('✅ Applied:', data)

  return data
}

// Job seeker: view their own applications
export async function getMyApplications(userId: string): Promise<Application[]> {
  console.log('🚀 Fetching my applications:', userId)

  const { data, error } = await getSupabase()
    .from('applications')
    .select(`
      *,
      job:job_listings (
        id,
        title,
        location,
        is_remote,
        salary_min,
        salary_max,
        employment_type,
        experience_level,
        status,
        poster:job_posters (
          company
        )
      )
    `)
    .eq('user_id', userId)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('❌ Fetch applications error:', error)
    return []
  }

  console.log('✅ Applications:', data)

  return data ?? []
}

// Job seeker: check if already applied
export async function hasApplied(jobId: string, userId: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('❌ hasApplied error:', error)
    return false
  }

  return !!data
}
// Job seeker: withdraw application
export async function withdrawApplication(applicationId: string): Promise<boolean> {
  console.log('🚀 Withdraw application:', applicationId)

  const { error } = await getSupabase()
    .from('applications')
    .delete()
    .eq('id', applicationId)

  if (error) {
    console.error('❌ Withdraw error:', error)
    return false
  }

  return true
}

// Job poster: view all applications for a listing
export async function getApplicationsForListing(listingId: string) {
  console.log('🚀 Fetching applications for listing:', listingId)

  if (!listingId) {
    console.error('❌ Missing listingId')
    return []
  }

  const { data, error } = await getSupabase()
    .from('applications')
    .select(`
      *,
      applicant:job_seekers (
        id,
        headline,
        location,
        profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('job_id', listingId)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('❌ Fetch applications error:', error)
    return []
  }

  console.log('✅ Applications raw:', data)

  // flatten structure for UI
  const formatted = (data ?? []).map(app => ({
    ...app,
    applicant: {
      id: app.applicant?.id,
      name: app.applicant?.profiles?.full_name,
      avatar: app.applicant?.profiles?.avatar_url,
      headline: app.applicant?.headline,
      location: app.applicant?.location,
    },
  }))

  console.log('✅ Applications formatted:', formatted)

  return formatted
}
// Job poster: update application status (shortlist / reject / hire)
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<Application | null> {
  console.log('🚀 Updating status:', { applicationId, status })

  const { data, error } = await getSupabase()
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single()

  if (error) {
    console.error('❌ Update status error:', error)
    return null
  }

  console.log('✅ Updated:', data)

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