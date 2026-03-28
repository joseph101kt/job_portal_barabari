// packages/supabase/src/queries/interviews.ts

import { getSupabase } from '../client'
import type { Interview } from '../types'

export async function getMyInterviews(userId: string): Promise<Interview[]> {
  const { data } = await getSupabase()
    .from('interviews')
    .select(`
      *,
      candidate:profiles!candidate_id ( id, full_name, avatar_url, email ),
      interviewer:profiles!interviewer_id ( id, full_name, avatar_url ),
      listing:job_listings ( id, title )
    `)
    .or(`candidate_id.eq.${userId},interviewer_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getInterviewByRoom(roomName: string): Promise<Interview | null> {
  const { data } = await getSupabase()
    .from('interviews')
    .select(`
      *,
      candidate:profiles!candidate_id ( * ),
      interviewer:profiles!interviewer_id ( * ),
      listing:job_listings ( * )
    `)
    .eq('room_name', roomName)
    .single()
  return data
}

export async function createInterview(params: {
  candidate_id:   string
  interviewer_id: string
  listing_id?:    string
  scheduled_at?:  string
}): Promise<Interview | null> {
  // Generate a unique room name
  const roomName = `interview-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const { data } = await getSupabase()
    .from('interviews')
    .insert({
      ...params,
      room_name: roomName,
      status:    'scheduled',
    })
    .select()
    .single()
  return data
}

export async function updateInterview(
  id: string,
  updates: Partial<Pick<Interview,
    'status' | 'started_at' | 'ended_at' | 'feedback' | 'rating' | 'decision'
  >>
): Promise<Interview | null> {
  const { data } = await getSupabase()
    .from('interviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return data
}

export async function startInterview(id: string): Promise<Interview | null> {
  return updateInterview(id, {
    status:     'active',
    started_at: new Date().toISOString(),
  })
}

export async function endInterview(id: string): Promise<Interview | null> {
  return updateInterview(id, {
    status:   'ended',
    ended_at: new Date().toISOString(),
  })
}