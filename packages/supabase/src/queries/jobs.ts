// packages/supabase/src/queries/jobs.ts

import { getSupabase } from '../client'
import type { JobListing, EmploymentType, ExperienceLevel, ListingStatus } from '../types'

/* ────────────────────────────────────────────────
   🧠 HELPERS
──────────────────────────────────────────────── */

function assert(condition: any, message: string) {
  if (!condition) {
    console.error('❌', message)
    throw new Error(message)
  }
}

/* ──────────────────────────────────────────────── */

type ListingFilters = {
  status?:           ListingStatus
  employment_type?:  EmploymentType
  experience_level?: ExperienceLevel
  is_remote?:        boolean
  poster_id?:        string
}

/* ────────────────────────────────────────────────
   📥 GET LISTINGS
──────────────────────────────────────────────── */

export async function getListings(filters: ListingFilters = {}): Promise<JobListing[]> {
  console.log('📥 getListings filters:', filters)

  try {
    // ✅ Guard validation
    if (filters.poster_id) {
      assert(typeof filters.poster_id === 'string', 'poster_id must be string')
    }

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

    const { data, error } = await query

    if (error) {
      console.error('❌ getListings error:', error)
      throw error
    }

    console.log('✅ Listings fetched:', data?.length)

    return data ?? []
  } catch (err) {
    console.error('❌ getListings failed:', err)
    return []
  }
}

/* ──────────────────────────────────────────────── */

export async function getOpenListings(
  filters?: Omit<ListingFilters, 'status'>
): Promise<JobListing[]> {
  return getListings({ ...filters, status: 'open' })
}

export async function getMyListings(posterId: string): Promise<JobListing[]> {
  console.log('📥 getMyListings:', posterId)

  assert(posterId, 'posterId is required')

  return getListings({ poster_id: posterId })
}

/* ────────────────────────────────────────────────
   📄 GET BY ID
──────────────────────────────────────────────── */

export async function getListingById(id: string): Promise<JobListing | null> {
  console.log('📥 getListingById:', id)

  assert(id, 'listing id is required')

  try {
    const { data, error } = await getSupabase()
      .from('job_listings')
      .select(`
        *,
        poster:job_posters ( * ),
        skills:job_listing_skills ( required, skill:skills ( * ) )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ getListingById error:', error)
      throw error
    }

    return data
  } catch (err) {
    console.error('❌ getListingById failed:', err)
    return null
  }
}

/* ────────────────────────────────────────────────
   ➕ CREATE
──────────────────────────────────────────────── */

export async function createListing(
  listing: Pick<JobListing, 'poster_id' | 'title'> &
    Partial<Omit<JobListing, 'id' | 'created_at' | 'updated_at' | 'poster' | 'skills'>>
): Promise<JobListing | null> {

  console.log('📦 createListing input:', listing)

  // ✅ VALIDATION
  assert(listing.poster_id, 'poster_id is required')
  assert(listing.title?.trim(), 'title is required')

  if (
    listing.salary_min &&
    listing.salary_max &&
    listing.salary_min > listing.salary_max
  ) {
    throw new Error('Invalid salary range')
  }

  try {
    const { data, error } = await getSupabase()
      .from('job_listings')
      .insert(listing)
      .select()
      .single()

    if (error) {
      console.error('❌ createListing error:', error)
      throw error
    }

    console.log('✅ Listing created:', data)

    return data
  } catch (err) {
    console.error('❌ createListing failed:', err)
    return null
  }
}

/* ────────────────────────────────────────────────
   ✏️ UPDATE
──────────────────────────────────────────────── */

export async function updateListing(
  id: string,
  updates: Partial<Omit<JobListing, 'id' | 'poster_id' | 'created_at' | 'updated_at' | 'poster' | 'skills'>>
): Promise<JobListing | null> {

  console.log('✏️ updateListing:', { id, updates })

  assert(id, 'listing id is required')
  assert(updates && Object.keys(updates).length > 0, 'updates cannot be empty')

  if (
    updates.salary_min &&
    updates.salary_max &&
    updates.salary_min > updates.salary_max
  ) {
    throw new Error('Invalid salary range')
  }

  try {
    const { data, error } = await getSupabase()
      .from('job_listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ updateListing error:', error)
      throw error
    }

    console.log('✅ Listing updated:', data)

    return data
  } catch (err) {
    console.error('❌ updateListing failed:', err)
    return null
  }
}

/* ────────────────────────────────────────────────
   🧠 SKILLS
──────────────────────────────────────────────── */

export async function addListingSkills(
  listingId: string,
  skills: { skill_id: string; required?: boolean }[]
): Promise<void> {

  console.log('🧠 addListingSkills:', { listingId, skills })

  assert(listingId, 'listingId is required')
  assert(Array.isArray(skills), 'skills must be array')
  assert(skills.length > 0, 'skills cannot be empty')

  skills.forEach(s => {
    assert(s.skill_id, 'skill_id is required')
  })

  try {
    const { error } = await getSupabase()
      .from('job_listing_skills')
      .upsert(skills.map(s => ({
        listing_id: listingId,
        skill_id:   s.skill_id,
        required:   s.required ?? true,
      })))

    if (error) {
      console.error('❌ addListingSkills error:', error)
      throw error
    }

  } catch (err) {
    console.error('❌ addListingSkills failed:', err)
  }
}

/* ────────────────────────────────────────────────
   👁️ JOB VIEWS
──────────────────────────────────────────────── */

export async function recordJobView(params: {
  job_id:  string
  user_id?: string
  clicked?: boolean
}): Promise<void> {

  console.log('👁️ recordJobView:', params)

  assert(params.job_id, 'job_id is required')

  try {
    const { error } = await getSupabase()
      .from('job_views')
      .insert({
        job_id:    params.job_id,
        user_id:   params.user_id ?? null,
        clicked:   params.clicked ?? false,
        viewed_at: new Date().toISOString(),
      })

    if (error) {
      console.error('❌ recordJobView error:', error)
      throw error
    }

  } catch (err) {
    console.error('❌ recordJobView failed:', err)
  }
}

/* ────────────────────────────────────────────────
   📊 VIEW COUNT
──────────────────────────────────────────────── */

export async function getJobViewCount(jobId: string): Promise<number> {
  console.log('📊 getJobViewCount:', jobId)

  assert(jobId, 'jobId is required')

  try {
    const { count, error } = await getSupabase()
      .from('job_views')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId)

    if (error) {
      console.error('❌ getJobViewCount error:', error)
      throw error
    }

    return count ?? 0
  } catch (err) {
    console.error('❌ getJobViewCount failed:', err)
    return 0
  }
}