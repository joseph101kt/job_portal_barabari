// packages/supabase/src/queries/jobs.ts

import { getSupabase } from '../client'
import type { JobListing } from '../types'

export async function getOpenListings(): Promise<JobListing[]> {
  const { data } = await getSupabase()
    .from('job_listings')
    .select(`
      *,
      poster:job_posters ( company, website, industry ),
      skills:job_listing_skills ( required, skill:skills ( id, name, slug, category ) )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  return data ?? []
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

export async function getMyListings(posterId: string): Promise<JobListing[]> {
  const { data } = await getSupabase()
    .from('job_listings')
    .select('*')
    .eq('poster_id', posterId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createListing(
  listing: Pick<JobListing, 'poster_id' | 'title'> &
    Partial<Omit<JobListing, 'id' | 'created_at' | 'updated_at'>>
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
  updates: Partial<Omit<JobListing, 'id' | 'poster_id' | 'created_at' | 'updated_at'>>
): Promise<JobListing | null> {
  const { data } = await getSupabase()
    .from('job_listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return data
}