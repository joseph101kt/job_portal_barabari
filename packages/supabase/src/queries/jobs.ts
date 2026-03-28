// packages/supabase/src/queries/jobs.ts

import { getSupabase } from '../client'
import type { JobListing, EmploymentType, ExperienceLevel, ListingStatus } from '../types'

type ListingFilters = {
  status?:           ListingStatus
  employment_type?:  EmploymentType
  experience_level?: ExperienceLevel
  is_remote?:        boolean
  poster_id?:        string
}

export async function getListings(filters: ListingFilters = {}): Promise<JobListing[]> {
  let query = getSupabase()
    .from('job_listings')
    .select(`
      *,
      poster:job_posters ( company, website, industry ),
      skills:job_listing_skills ( required, skill:skills ( id, name, slug, category ) )
    `)
    .order('created_at', { ascending: false })

  if (filters.status)           query = query.eq('status', filters.status)
  if (filters.employment_type)  query = query.eq('employment_type', filters.employment_type)
  if (filters.experience_level) query = query.eq('experience_level', filters.experience_level)
  if (filters.is_remote != null) query = query.eq('is_remote', filters.is_remote)
  if (filters.poster_id)        query = query.eq('poster_id', filters.poster_id)

  const { data } = await query
  return data ?? []
}

export async function getOpenListings(filters?: Omit<ListingFilters, 'status'>): Promise<JobListing[]> {
  return getListings({ ...filters, status: 'open' })
}

export async function getMyListings(posterId: string): Promise<JobListing[]> {
  return getListings({ poster_id: posterId })
}

export async function getListingById(id: string): Promise<JobListing | null> {
  const { data } = await getSupabase()
    .from('job_listings')
    .select(`
      *,
      poster:job_posters ( * ),
      skills:job_listing_skills ( required, skill:skills ( * ) )
    `)
    .eq('id', id)
    .single()
  return data
}

export async function createListing(
  listing: Pick<JobListing, 'poster_id' | 'title'> &
    Partial<Omit<JobListing, 'id' | 'created_at' | 'updated_at' | 'poster' | 'skills'>>
): Promise<JobListing | null> {
  const { data } = await getSupabase()
    .from('job_listings')
    .insert(listing)
    .select()
    .single()
  return data
}

export async function updateListing(
  id: string,
  updates: Partial<Omit<JobListing, 'id' | 'poster_id' | 'created_at' | 'updated_at' | 'poster' | 'skills'>>
): Promise<JobListing | null> {
  const { data } = await getSupabase()
    .from('job_listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return data
}

export async function addListingSkills(
  listingId: string,
  skills: { skill_id: string; required?: boolean }[]
): Promise<void> {
  await getSupabase()
    .from('job_listing_skills')
    .upsert(skills.map(s => ({
      listing_id: listingId,
      skill_id:   s.skill_id,
      required:   s.required ?? true,
    })))
}

export async function recordJobView(params: {
  job_id:  string
  user_id?: string
  clicked?: boolean
}): Promise<void> {
  await getSupabase()
    .from('job_views')
    .insert({
      job_id:    params.job_id,
      user_id:   params.user_id ?? null,
      clicked:   params.clicked ?? false,
      viewed_at: new Date().toISOString(),
    })
}

export async function getJobViewCount(jobId: string): Promise<number> {
  const { count } = await getSupabase()
    .from('job_views')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)
  return count ?? 0
}