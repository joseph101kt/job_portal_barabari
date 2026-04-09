// packages/supabase/src/queries/resume.ts

import { getSupabase } from '../client'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function normalizeDate(date?: string): string | null {
  if (!date || date.trim() === '') return null
  const clean = date.trim()
  if (/^(present|current|now|ongoing|n\/a|na|-)$/i.test(clean)) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean
  if (/^\d{4}-\d{2}$/.test(clean)) return `${clean}-01`
  if (/^\d{4}$/.test(clean)) return `${clean}-01-01`
  console.warn('[DB] normalizeDate: unrecognized format, returning null:', clean)
  return null
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function normalizeResumeData(raw: any): any {
  return {
    candidate: {
      name:     raw?.candidate?.name     || '',
      email:    raw?.candidate?.email    || '',
      phone:    raw?.candidate?.phone    || '',
      location: raw?.candidate?.location || '',
    },
    headline:        raw?.headline        || null,
    bio:             raw?.bio             || null,
    experienceLevel: raw?.experienceLevel || 'fresher',
    yearsExperience: typeof raw?.yearsExperience === 'number' ? raw.yearsExperience : 0,

    skills: Array.isArray(raw?.skills)
      ? raw.skills.filter((s: any) => s && typeof s.name === 'string' && s.name.trim())
      : [],

    // ← accept both `company` (AI output) and `company_name` (manual edit)
    experience: Array.isArray(raw?.experience)
      ? raw.experience.filter((e: any) => e && (e.company || e.company_name) && e.role)
      : [],

    education: Array.isArray(raw?.education)
      ? raw.education.filter((e: any) => e && e.institution)
      : [],

    projects: Array.isArray(raw?.projects)
      ? raw.projects.filter((p: any) => p && p.title)
      : [],

    certifications: Array.isArray(raw?.certifications)
      ? raw.certifications.filter((c: any) => c && c.name)
      : [],

    strengths:   Array.isArray(raw?.strengths)   ? raw.strengths   : [],
    gaps:        Array.isArray(raw?.gaps)         ? raw.gaps        : [],
    suggestions: Array.isArray(raw?.suggestions)  ? raw.suggestions : [],
  }
}

// ─────────────────────────────────────────────
// SKILLS FETCH
// ─────────────────────────────────────────────

export async function getAvailableSkills(): Promise<{ id: string; name: string; slug: string; category: string | null }[]> {
  const { data, error } = await getSupabase()
    .from('skills')
    .select('id, name, slug, category')
    .order('name')

  if (error) {
    console.error('[DB] getAvailableSkills error:', error.message)
    return []
  }
  return data ?? []
}

// ─────────────────────────────────────────────
// SKILLS UPSERT
// ─────────────────────────────────────────────

async function resolveSkills(skillNames: string[]): Promise<{ name: string; id: string }[]> {
  if (!skillNames.length) return []

  const supabase = getSupabase()
  const unique   = [...new Set(skillNames.map(s => s.trim()).filter(Boolean))]

  const { data: existing } = await supabase
    .from('skills')
    .select('id, name')
    .in('name', unique)

  const found      = existing ?? []
  const foundNames = new Set(found.map((s: any) => s.name.toLowerCase()))

  const stillMissing = unique.filter(n => !foundNames.has(n.toLowerCase()))

  const ilikeMatches: { name: string; id: string }[] = []
  for (const name of stillMissing) {
    const { data } = await supabase
      .from('skills')
      .select('id, name')
      .ilike('name', `%${name}%`)
      .limit(1)
      .maybeSingle()
    if (data) ilikeMatches.push({ id: data.id, name: data.name })
  }

  const newSkillNames = unique.filter(n => !foundNames.has(n.toLowerCase()))
  const newSkillRows  = newSkillNames.map(name => ({ name, slug: slugify(name), category: 'other' }))

  let inserted: { id: string; name: string }[] = []
  if (newSkillRows.length) {
    const { data, error } = await supabase.from('skills').insert(newSkillRows).select('id, name')
    if (error) console.warn('[DB] resolveSkills insert error:', error.message)
    else inserted = data ?? []
  }

  return [...found, ...ilikeMatches, ...inserted]
}

// ─────────────────────────────────────────────
// MAIN UPSERT
// ─────────────────────────────────────────────

export async function upsertResume(userId: string, rawData: any): Promise<boolean> {
  const supabase = getSupabase()

  console.log('[UPSERT START]', { userId })
  console.log('[UPSERT RAW DATA]', rawData)

  try {
    const data = normalizeResumeData(rawData as any) as any

    console.log('[UPSERT NORMALIZED]', data)
    console.log('[UPSERT KEYS]', Object.keys(data))
    console.log('[RAW AI DATA]', JSON.stringify(rawData, null, 2))

    const extractedName      = data.candidate?.name || data.name || null
    const extractedHeadline  = data.headline || data.title || data.role || data.experience?.[0]?.role || null
    const extractedLocation  = data.candidate?.location || null

    console.log('[FINAL NAME]', extractedName)
    console.log('[FINAL HEADLINE]', extractedHeadline)
    console.log('[FINAL LOCATION]', extractedLocation)

    // ── 0. ENSURE job_seekers row exists ──
    const { error: seekerError } = await supabase
      .from('job_seekers')
      .upsert({ id: userId, created_at: new Date().toISOString() }, { onConflict: 'id' })

    if (seekerError) {
      console.error('[DB] upsertResume: failed to ensure job_seekers row', seekerError.message)
      return false
    }

    // ── 0.5 UPDATE job_seekers — only overwrite fields that were actually extracted ──
    const seekerUpdates: Record<string, any> = {}
    if (extractedHeadline !== null) seekerUpdates.headline  = extractedHeadline
    if (extractedLocation !== null) seekerUpdates.location  = extractedLocation
    if (data.bio          !== null) seekerUpdates.ai_summary = data.bio

    if (Object.keys(seekerUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('job_seekers')
        .update(seekerUpdates)
        .eq('id', userId)

      if (updateError) console.error('[DB] failed to update job_seekers fields', updateError.message)
      else             console.log('[DB] job_seekers updated', seekerUpdates)
    } else {
      console.log('[DB] no job_seekers fields to update from resume')
    }

    // ── 0.6 UPDATE name in profiles (only if extracted and currently empty) ──
    if (extractedName) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: extractedName })
        .eq('id', userId)
        .is('full_name', null)

      if (profileError) console.error('[DB] failed to update profile name', profileError.message)
      else              console.log('[DB] profile name updated')
    } else {
      console.log('[DB] no name extracted from resume')
    }

    // ── 1. CLEAR OLD DATA ──
    await supabase.from('experiences').delete().eq('user_id', userId)
    await supabase.from('education').delete().eq('user_id', userId)
    console.log('[DB] cleared experiences + education')

    // ── 2. EXPERIENCES ──
    console.log('[DB EXPERIENCE INPUT]', data.experience)

    if (data.experience?.length) {
      const payload = data.experience.map((e: any) => ({
        user_id:      userId,
        company_name: e.company_name ?? e.company ?? '',  // ← handle both shapes
        role:         e.role ?? '',
        start_date:   normalizeDate(e.start_date ?? e.startDate),
        end_date:     normalizeDate(e.end_date   ?? e.endDate),
        description:  e.description ?? null,
      }))

      const { error } = await supabase.from('experiences').insert(payload)
      if (error) throw error
      console.log('[DB] inserted experiences:', payload.length)
    }

    // ── 3. EDUCATION ──
    console.log('[DB EDUCATION INPUT]', data.education)

    if (data.education?.length) {
      const payload = data.education.map((e: any) => ({
        user_id:       userId,
        institution:   e.institution ?? '',
        degree:        e.degree ?? null,
        field_of_study: e.field_of_study ?? e.fieldOfStudy ?? null,
        start_date:    normalizeDate(e.start_date ?? e.startDate),
        end_date:      normalizeDate(e.end_date   ?? e.endDate),
      }))

      const { error } = await supabase.from('education').insert(payload)
      if (error) throw error
      console.log('[DB] inserted education:', payload.length)
    }

    return true

  } catch (err: any) {
    console.error('[DB] upsertResume error:', err.message)
    return false
  }
}

// ─────────────────────────────────────────────
// RETRIEVAL QUERIES
// ─────────────────────────────────────────────

export async function getJobSeekerProfile(userId: string) {
  const { data, error } = await getSupabase()
    .from('job_seekers')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) { console.error('[DB] getJobSeekerProfile error:', error.message); return null }
  return data
}

export async function getExperiences(userId: string) {
  const { data, error } = await getSupabase()
    .from('experiences')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (error) { console.error('[DB] getExperiences error:', error.message); return [] }
  return data
}

export async function getEducation(userId: string) {
  const { data, error } = await getSupabase()
    .from('education')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (error) { console.error('[DB] getEducation error:', error.message); return [] }
  return data
}

export async function getProjects(userId: string) {
  const { data, error } = await getSupabase()
    .from('projects')
    .select('*')
    .eq('user_id', userId)

  if (error) { console.error('[DB] getProjects error:', error.message); return [] }
  return data
}

export async function getCertifications(userId: string) {
  const { data, error } = await getSupabase()
    .from('certifications')
    .select('*')
    .eq('user_id', userId)

  if (error) { console.error('[DB] getCertifications error:', error.message); return [] }
  return data
}

export async function getSkills(userId: string) {
  const { data, error } = await getSupabase()
    .from('job_seeker_skills')
    .select(`skill_id, skills ( id, name, category )`)
    .eq('user_id', userId)

  if (error) { console.error('[DB] getSkills error:', error.message); return [] }
  return (data ?? []).map((s: any) => s.skills).filter(Boolean)
}

export async function getFullResume(userId: string) {
  try {
    const [profile, experiences, education, projects, certifications, skills] =
      await Promise.all([
        getJobSeekerProfile(userId),
        getExperiences(userId),
        getEducation(userId),
        getProjects(userId),
        getCertifications(userId),
        getSkills(userId),
      ])
    return { profile, experiences, education, projects, certifications, skills }
  } catch (err: any) {
    console.error('[DB] getFullResume error:', err?.message ?? err)
    return null
  }
}