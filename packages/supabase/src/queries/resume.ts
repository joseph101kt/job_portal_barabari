// packages/supabase/src/queries/resume.ts

import { getSupabase } from '../client'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function normalizeDate(date?: string): string | null {
  if (!date || date.trim() === '') return null

  const clean = date.trim()

  // Reject non-date strings Gemini sometimes returns
  if (/^(present|current|now|ongoing|n\/a|na|-)$/i.test(clean)) return null

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean

  // YYYY-MM → YYYY-MM-01
  if (/^\d{4}-\d{2}$/.test(clean)) return `${clean}-01`

  // YYYY → YYYY-01-01
  if (/^\d{4}$/.test(clean)) return `${clean}-01-01`

  console.warn('[DB] normalizeDate: unrecognized format, returning null:', clean)
  return null
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Normalize and validate the raw AI result before touching the DB.
// Guarantees every array field exists and every required string is non-empty.
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

    experience: Array.isArray(raw?.experience)
      ? raw.experience.filter((e: any) => e && e.company && e.role)
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
// SKILLS FETCH (for prompt context)
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
// SKILLS UPSERT (bulk, with auto-insert)
// ─────────────────────────────────────────────

async function resolveSkills(
  skillNames: string[]
): Promise<{ name: string; id: string }[]> {
  if (!skillNames.length) return []

  const supabase = getSupabase()
  const unique   = [...new Set(skillNames.map(s => s.trim()).filter(Boolean))]

  // 1. Bulk fetch — case-insensitive match for each name
  const { data: existing } = await supabase
    .from('skills')
    .select('id, name')
    .in('name', unique)   // exact match first

  const found     = existing ?? []
  const foundNames = new Set(found.map((s: any) => s.name.toLowerCase()))

  // 2. For names that didn't match exactly, try ilike one by one
  const stillMissing = unique.filter(n => !foundNames.has(n.toLowerCase()))

  const ilikeMatches: { name: string; id: string }[] = []
  for (const name of stillMissing) {
    const { data, error } = await supabase
      .from('skills')
      .select('id, name')
      .ilike('name', `%${name}%`)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('[resolveSkills] ilike failed:', error.message)
      continue
    }

    if (data) {
      ilikeMatches.push({ id: data.id, name: data.name })
    }
  }

  // 3. Auto-insert truly new skills
  const newSkillNames = unique.filter(n => !foundNames.has(n.toLowerCase()))
  const newSkillRows  = newSkillNames.map(name => ({
    name,
    slug:     slugify(name),
    category: 'other',
  }))

  let inserted: { id: string; name: string }[] = []
  if (newSkillRows.length) {
    const { data, error } = await supabase
      .from('skills')
      .insert(newSkillRows)
      .select('id, name')

    if (error) {
      console.warn('[DB] resolveSkills insert error (some may already exist):', error.message)
    } else {
      inserted = data ?? []
    }
  }

  return [...found, ...ilikeMatches, ...inserted]
}

// ─────────────────────────────────────────────
// MAIN UPSERT FLOW
// ─────────────────────────────────────────────

export async function upsertResume(userId: string, rawData: any): Promise<boolean> {
  const supabase = getSupabase()

  // Validate and normalize before touching anything
  const data = normalizeResumeData(rawData)

  const finalBio =
  data.bio && data.bio.trim().length > 0
    ? data.bio
    : (rawData.summary?.slice(0, 500) || null)

  console.log('[DB] upsertResume start:', userId)
  console.log('[DB] normalized data summary:', {
    headline:    data.headline,
    skills:      data.skills.length,
    experience:  data.experience.length,
    education:   data.education.length,
    projects:    data.projects.length,
    certs:       data.certifications.length,
  })

  try {
    // ── 1. PROFILES — full_name + onboarded ────────
    const fullName = data.candidate.name || null
    if (fullName) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, onboarded: true })
        .eq('id', userId)

      if (profileError) {
        console.error('[DB] profiles update error:', profileError.message)
      } else {
        console.log('[DB] profiles updated: full_name =', fullName)
      }
    } else {
      // Still mark as onboarded even if name is missing
      await supabase
        .from('profiles')
        .update({ onboarded: true })
        .eq('id', userId)
    }

    // ── 2. JOB SEEKERS — upsert base profile ───────
    const { error: seekerError } = await supabase
      .from('job_seekers')
      .upsert({
        id:         userId,
        headline:   data.headline,
        bio:        finalBio,
        location:   data.candidate.location || null,
        ai_summary: data,
      })

    if (seekerError) throw seekerError
    console.log('[DB] job_seekers upserted')

    // ── 3. CONDITIONAL DELETES — only if AI returned data ──
    // Never delete a section if AI returned nothing for it
    if (data.experience.length > 0) {
      await supabase.from('experiences').delete().eq('user_id', userId)
      console.log('[DB] cleared experiences (will replace)')
    }
    if (data.education.length > 0) {
      await supabase.from('education').delete().eq('user_id', userId)
      console.log('[DB] cleared education (will replace)')
    }
    if (data.projects.length > 0) {
      await supabase.from('projects').delete().eq('user_id', userId)
      console.log('[DB] cleared projects (will replace)')
    }
    if (data.certifications.length > 0) {
      await supabase.from('certifications').delete().eq('user_id', userId)
      console.log('[DB] cleared certifications (will replace)')
    }
    if (data.skills.length > 0) {
      await supabase.from('job_seeker_skills').delete().eq('user_id', userId)
      console.log('[DB] cleared job_seeker_skills (will replace)')
    }

    // ── 4. EXPERIENCES ─────────────────────────────
    if (data.experience.length > 0) {
      const payload = data.experience.map((e: any) => ({
        user_id:      userId,
        company_name: e.company,
        role:         e.role,
        start_date:   normalizeDate(e.startDate),
        end_date:     e.isCurrent ? null : normalizeDate(e.endDate),
        description:  e.description || null,
      }))

      const { error } = await supabase.from('experiences').insert(payload)
      if (error) console.error('[DB] experiences insert error:', error.message)
      else console.log('[DB] inserted', payload.length, 'experiences')
    }

    // ── 5. EDUCATION ───────────────────────────────
    if (data.education.length > 0) {
      const payload = data.education.map((e: any) => ({
        user_id:        userId,
        institution:    e.institution,
        degree:         e.degree        || null,
        field_of_study: e.fieldOfStudy  || null,
        start_date:     normalizeDate(e.startDate),
        end_date:       e.isCurrent ? null : normalizeDate(e.endDate),
      }))

      const { error } = await supabase.from('education').insert(payload)
      if (error) console.error('[DB] education insert error:', error.message)
      else console.log('[DB] inserted', payload.length, 'education rows')
    }

    // ── 6. PROJECTS ────────────────────────────────
    if (data.projects.length > 0) {
      const payload = data.projects.map((p: any) => ({
        user_id:     userId,
        title:       p.title,
        description: p.description || null,
        project_url: p.url         || null,
      }))

      const { error } = await supabase.from('projects').insert(payload)
      if (error) console.error('[DB] projects insert error:', error.message)
      else console.log('[DB] inserted', payload.length, 'projects')
    }

    // ── 7. CERTIFICATIONS ──────────────────────────
    if (data.certifications.length > 0) {
      const payload = data.certifications.map((c: any) => ({
        user_id:    userId,
        name:       c.name,
        issuer:     c.issuer || null,
        issue_date: normalizeDate(c.date),
      }))

      const { error } = await supabase.from('certifications').insert(payload)
      if (error) console.error('[DB] certifications insert error:', error.message)
      else console.log('[DB] inserted', payload.length, 'certifications')
    }

    // ── 8. SKILLS — resolve + bulk insert ──────────
    if (data.skills.length > 0) {
      const skillNames = data.skills.map((s: any) => s.name as string)
      const resolved   = await resolveSkills(skillNames)

      console.log('[DB] resolved', resolved.length, '/', skillNames.length, 'skills')

      if (resolved.length > 0) {
        const junctionRows = resolved.map(s => ({
          user_id:  userId,
          skill_id: s.id,
        }))

        const { error } = await supabase
          .from('job_seeker_skills')
          .insert(junctionRows)

        if (error) console.error('[DB] job_seeker_skills insert error:', error.message)
        else console.log('[DB] inserted', junctionRows.length, 'skill links')
      }
    }

    console.log('[DB] upsertResume success for', userId)
    return true

  } catch (err: any) {
    console.error('[DB] upsertResume fatal error:', err?.message ?? err)
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

  if (error) {
    console.error('[DB] getJobSeekerProfile error:', error.message)
    return null
  }
  return data
}

export async function getExperiences(userId: string) {
  const { data, error } = await getSupabase()
    .from('experiences')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('[DB] getExperiences error:', error.message)
    return []
  }
  return data
}

export async function getEducation(userId: string) {
  const { data, error } = await getSupabase()
    .from('education')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('[DB] getEducation error:', error.message)
    return []
  }
  return data
}

export async function getProjects(userId: string) {
  const { data, error } = await getSupabase()
    .from('projects')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('[DB] getProjects error:', error.message)
    return []
  }
  return data
}

export async function getCertifications(userId: string) {
  const { data, error } = await getSupabase()
    .from('certifications')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('[DB] getCertifications error:', error.message)
    return []
  }
  return data
}

export async function getSkills(userId: string) {
  const { data, error } = await getSupabase()
    .from('job_seeker_skills')
    .select(`skill_id, skills ( id, name, category )`)
    .eq('user_id', userId)

  if (error) {
    console.error('[DB] getSkills error:', error.message)
    return []
  }
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