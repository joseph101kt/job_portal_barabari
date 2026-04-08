// packages/supabase/src/queries/chat.ts

import { getSupabase, supabase } from '../client'
import { ChatItem, Message, MyChatsResult } from '../types'

export async function startChat(applicationId: string, role: string) {
  if (role !== 'poster') {
    console.warn('❌ Only posters can start chat')
    return false
  }

  const { error } = await getSupabase()
    .from('applications')
    .update({ chat_started: true })
    .eq('id', applicationId)

  if (error) {
    console.error('❌ startChat error:', error)
    return false
  }

  return true
}

export async function sendMessage(params: {
  application_id: string
  sender_id: string
  content: string
}): Promise<Message | null> {
  console.log('🚀 Sending message')

  if (!params.content.trim()) {
    console.error('❌ Empty message')
    return null
  }

  const payload = {
    application_id: params.application_id,
    sender_id: params.sender_id,
    content: params.content.trim(),
  }

  console.log('📦 Payload:', payload)

  // insert message
  const { data, error } = await supabase
    .from('messages')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('❌ Send message error:', error)
    return null
  }

  // ensure chat is started
    await supabase
    .from('applications')
    .update({ 
        chat_started: true,
        updated_at: new Date().toISOString()
    })
    .eq('id', params.application_id)

  console.log('✅ Message sent:', data)

  return data
}

export async function getMessages(applicationId: string): Promise<Message[]> {
  console.log('🚀 Fetching messages:', applicationId)

  const { data, error } = await getSupabase()
    .from('messages')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('❌ Fetch messages error:', error)
    return []
  }

  return data ?? []
}


export async function getMyChats(
  userId: string,
  role: 'poster' | 'seeker'
): Promise<MyChatsResult> {
  const supabase = getSupabase()

  console.log('🚀 [getMyChats] start:', { userId, role })

  // ================= STEP 1: RESOLVE JOB IDS (poster only) =================
  let jobIds: string[] | null = null

  if (role === 'poster') {
    const { data: listings, error: listingsError } = await supabase
      .from('job_listings')
      .select('id')
      .eq('poster_id', userId)

    if (listingsError) {
      console.error('❌ listings error:', listingsError)
      return { active: [], inactive: [] }
    }

    jobIds = listings?.map(l => l.id) ?? []
    console.log('📋 jobIds:', jobIds)

    if (jobIds.length === 0) return { active: [], inactive: [] }
  }

  // ================= STEP 2: FETCH APPLICATIONS =================
  let query = supabase
    .from('applications')
    .select(`
      id,
      chat_started,
      updated_at,
      user_id,

      job:job_listings (
        id,
        title,
        poster_id
      ),

      messages (
        content,
        created_at
      )
    `)

  if (role === 'poster' && jobIds) {
    query = query.in('job_id', jobIds)
  } else {
    query = query.eq('user_id', userId)
  }

  const { data: apps, error } = await query

  if (error) {
    console.error('❌ applications error:', error)
    return { active: [], inactive: [] }
  }

  console.log('📦 applications:', apps)

  if (!apps || apps.length === 0) return { active: [], inactive: [] }

  // ================= STEP 3: FILTER FOR SEEKER =================
  // 🔥 KEY FIX: seeker only sees active chats
  const filteredApps =
    role === 'seeker'
      ? apps.filter(app => app.chat_started)
      : apps

  console.log('🎯 filteredApps:', filteredApps)

  if (filteredApps.length === 0) {
    return { active: [], inactive: [] }
  }

  // ================= STEP 4: COLLECT PROFILE IDS =================
  const seekerIds = [...new Set(filteredApps.map(a => a.user_id))]
  const posterIds = [
    ...new Set(
      filteredApps
        .map(a => (a.job as any)?.poster_id)
        .filter(Boolean)
    ),
  ]

  console.log('🧠 seekerIds:', seekerIds)
  console.log('🧠 posterIds:', posterIds)

  // ================= STEP 5: FETCH PROFILES =================
  const [{ data: seekerProfiles }, { data: posterProfiles }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', seekerIds),

      supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', posterIds),
    ])

  console.log('👥 seekerProfiles:', seekerProfiles)
  console.log('🏢 posterProfiles:', posterProfiles)

  // ================= STEP 6: MAPS =================
  const seekerMap = new Map(seekerProfiles?.map(p => [p.id, p]) ?? [])
  const posterMap = new Map(posterProfiles?.map(p => [p.id, p]) ?? [])

  // ================= STEP 7: BUILD RESULT =================
  const active: ChatItem[] = []
  const inactive: ChatItem[] = []

  for (const app of filteredApps) {
    console.log('🔍 processing app:', app.id)

    const job = app.job as unknown as {
      id: string
      title: string
      poster_id: string
    } | null

    const seekerProfile = seekerMap.get(app.user_id)
    const posterProfile = posterMap.get(job?.poster_id ?? '')

    const messages = (app.messages ?? []) as {
      content: string
      created_at: string
    }[]

    const lastMsg = messages.length
      ? messages.reduce((a, b) =>
          a.created_at > b.created_at ? a : b
        )
      : undefined

    const title =
      role === 'poster'
        ? seekerProfile?.full_name ?? 'Applicant'
        : posterProfile?.full_name ?? job?.title ?? 'Company'

    const item: ChatItem = {
      id: app.id,
      title,
      lastMessage: lastMsg?.content,
      lastMessageAt: lastMsg?.created_at,
      avatar:
        role === 'poster'
          ? seekerProfile?.avatar_url
          : posterProfile?.avatar_url,
    }

    if (app.chat_started) {
      active.push(item)
    } else {
      inactive.push(item)
    }
  }

  console.log('✅ result:', {
    activeCount: active.length,
    inactiveCount: inactive.length,
  })

  return { active, inactive }
}