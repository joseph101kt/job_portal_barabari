// packages/supabase/src/queries/interviews.ts

import { getSupabase } from '../client'
import type { Interview } from '../types'

/* ───────────────── VALIDATION ───────────────── */

function validateScheduleInterview(data: {
  applicationId: string
  scheduledAt: string
}) {
  if (!data.applicationId) return 'Application ID is required'
  if (!data.scheduledAt) return 'Scheduled time is required'

  const date = new Date(data.scheduledAt)
  if (isNaN(date.getTime())) return 'Invalid date'
  if (date <= new Date()) return 'Time must be in future'

  return null
}

/* ───────────────── 1. SCHEDULE ───────────────── */

export async function scheduleInterview({
  applicationId,
  scheduledAt,
}: {
  applicationId: string
  scheduledAt: string
}) {
  try {
    console.log('🚀 Action: scheduleInterview', { applicationId, scheduledAt })

    const errorMsg = validateScheduleInterview({ applicationId, scheduledAt })
    if (errorMsg) throw new Error(errorMsg)

    const supabase = getSupabase()

    // ✅ prevent duplicate active/scheduled
    const { data: existing } = await supabase
      .from('interviews')
      .select('id')
      .eq('application_id', applicationId)
      .in('status', ['scheduled', 'active'])

    if (existing && existing.length > 0) {
      throw new Error('An active or scheduled interview already exists')
    }

    const payload = {
      application_id: applicationId,
      room_name: applicationId,
      scheduled_at: scheduledAt,
      status: 'scheduled',
    }

    const { data, error } = await supabase
      .from('interviews')
      .insert(payload)
      .select()
      .single()

    if (error) throw error

    // ✅ link message → interview
    const { error: msgError } = await supabase.from('messages').insert({
      application_id: applicationId,
      content: 'Interview scheduled',
      type: 'interview_invite',
      interview_id: data.id,
    })

    if (msgError) throw msgError

    return data
  } catch (err) {
    console.error('❌ Error:', err)
    throw err
  }
}

/* ───────────────── 2. JOIN ───────────────── */

export async function joinInterview(interviewId: string) {
  try {
    console.log('🚀 Action: joinInterview', { interviewId })

    const supabase = getSupabase()

    const { data: existing, error: fetchError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .single()

    if (fetchError) throw fetchError
    if (!existing) throw new Error('Interview not found')

    if (existing.status === 'cancelled') {
      throw new Error('Interview was cancelled')
    }

    if (existing.status === 'active') return existing

    const { data, error } = await supabase
      .from('interviews')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', interviewId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (err) {
    console.error('❌ Error:', err)
    throw err
  }
}

/* ───────────────── 3. END ───────────────── */

export async function endInterview(interviewId: string) {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('interviews')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', interviewId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (err) {
    console.error('❌ Error:', err)
    throw err
  }
}

/* ───────────────── 4. CANCEL ───────────────── */

export async function cancelInterview(interviewId: string) {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('interviews')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', interviewId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (err) {
    console.error('❌ Error:', err)
    throw err
  }
}

/* ───────────────── 5. FEEDBACK ───────────────── */

export async function submitFeedback({
  applicationId,
  status,
  feedback,
}: {
  applicationId: string
  status: 'shortlisted' | 'rejected' | 'hired'
  feedback: string
}) {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        interview_feedback: feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (err) {
    console.error('❌ Error:', err)
    throw err
  }
}