// packages/supabase/src/queries/messages.ts

import { getSupabase } from '../client'
import type { Message } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export async function getMessages(roomId: string, limit = 50): Promise<Message[]> {
  const { data } = await getSupabase()
    .from('messages')
    .select(`
      *,
      sender:profiles ( id, full_name, avatar_url )
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(limit)
  return data ?? []
}

export async function sendMessage(params: {
  room_id:   string
  sender_id: string
  content:   string
}): Promise<Message | null> {
  const { data } = await getSupabase()
    .from('messages')
    .insert(params)
    .select(`*, sender:profiles ( id, full_name, avatar_url )`)
    .single()
  return data
}

// Subscribe to new messages in a room
// Returns the channel so caller can unsubscribe on cleanup
export function subscribeToMessages(
  roomId:    string,
  onMessage: (message: Message) => void
): RealtimeChannel {
  return getSupabase()
    .channel(`messages:${roomId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'messages',
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        // Fetch full message with sender join
        const { data } = await getSupabase()
          .from('messages')
          .select(`*, sender:profiles ( id, full_name, avatar_url )`)
          .eq('id', payload.new.id)
          .single()
        if (data) onMessage(data)
      }
    )
    .subscribe()
}