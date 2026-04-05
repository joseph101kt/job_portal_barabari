'use client'

import { useEffect, useState } from 'react'
import { View, useWindowDimensions, Text } from 'react-native'
import { getSupabase } from '@my-app/supabase'
import { ChatSection } from './ChatSection.tsx'
import { Sidebar } from './sidebar.tsx'
import { getMyChats, startChat } from '@my-app/supabase'

type ChatItem = {
  id: string
  title: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
}

export function ChatPage() {
  const supabase = getSupabase()
  const { width } = useWindowDimensions()

  const isMobile = width < 768

  const [activeChats, setActiveChats] = useState<ChatItem[]>([])
  const [inactiveChats, setInactiveChats] = useState<ChatItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'poster' | 'seeker'>('seeker')

  // ================= FETCH CHATS =================
  const fetchChats = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole =
      profile?.role === 'job_poster' ? 'poster' : 'seeker'

    setRole(userRole)

    const res = await getMyChats(user.id, userRole)

    setActiveChats(res.active || [])
    setInactiveChats(res.inactive || [])

    setLoading(false)
  }

  useEffect(() => {
    fetchChats()
  }, [])

  // ================= REALTIME UPDATE =================
  const handleIncomingMessage = (msg: any) => {
    const chatId = msg.application_id

    // 🔥 1. check if chat exists in active
    setActiveChats((prevActive) => {
      const exists = prevActive.find((c) => c.id === chatId)

      if (exists) {
        return prevActive
          .map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  lastMessage: msg.content,
                  lastMessageAt: msg.created_at,
                  unreadCount:
                    selectedId === chatId
                      ? 0
                      : (chat.unreadCount || 0) + 1,
                }
              : chat
          )
          .sort((a, b) =>
            (b.lastMessageAt || '').localeCompare(a.lastMessageAt || '')
          )
      }

      return prevActive
    })

    // 🔥 2. if not in active → move from inactive
    setInactiveChats((prevInactive) => {
      const chat = prevInactive.find((c) => c.id === chatId)
      if (!chat) return prevInactive

      const updatedChat: ChatItem = {
        ...chat,
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
        unreadCount: selectedId === chatId ? 0 : 1,
      }

      // ✅ add to active
      setActiveChats((prev) =>
        [updatedChat, ...prev].sort((a, b) =>
          (b.lastMessageAt || '').localeCompare(a.lastMessageAt || '')
        )
      )

      // ✅ remove from inactive
      return prevInactive.filter((c) => c.id !== chatId)
    })
  }

  // ================= HANDLE SELECT =================
  const handleSelect = async (id: string, isInactive?: boolean) => {
    if (isInactive && role === 'poster') {
      await startChat(id, role)
      await fetchChats() // only here we refetch
    }

    setSelectedId(id)

    // ✅ reset unread count
    setActiveChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, unreadCount: 0 } : chat
      )
    )
  }

  // ================= REALTIME LISTENER =================
  useEffect(() => {
    const channel = supabase
      .channel('sidebar-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          handleIncomingMessage(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedId])

  // ================= MOBILE =================
  if (isMobile) {
    if (selectedId) {
      return (
        <ChatSection
          applicationId={selectedId}
          onBack={() => setSelectedId(null)}
        />
      )
    }

    return (
      <Sidebar
        activeChats={activeChats}
        inactiveChats={inactiveChats}
        selectedId={selectedId}
        onSelect={handleSelect}
        loading={loading}
        isPoster={role === 'poster'}
      />
    )
  }

  // ================= DESKTOP =================
  return (
    <View className="flex-1 flex-row bg-white dark:bg-neutral-900">

      {/* SIDEBAR */}
      <View className="w-80 border-r border-neutral-200 dark:border-neutral-800">
        <Sidebar
          activeChats={activeChats}
          inactiveChats={inactiveChats}
          selectedId={selectedId}
          onSelect={handleSelect}
          loading={loading}
          isPoster={role === 'poster'}
        />
      </View>

      {/* CHAT */}
      <View className="flex-1">
        {selectedId ? (
          <ChatSection applicationId={selectedId} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-neutral-500">
              Select a chat
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}