// apps/mobile/app/shared/chat.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  View, Text, FlatList, KeyboardAvoidingView, Platform,
  ActivityIndicator, Pressable,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  PageLayout, MessageBubble, ChatInput, Avatar,
} from '@my-app/ui'
import {
  getMessages, sendMessage, subscribeToMessages,
  getSupabase, type Message,
} from '@my-app/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export default function ChatScreen() {
  const { roomId, title, participantName } = useLocalSearchParams<{
    roomId: string
    title?: string
    participantName?: string
  }>()
  const router  = useRouter()
  const listRef = useRef<FlatList>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [userId,   setUserId]   = useState<string | null>(null)
  const [loading,  setLoading]  = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    init()
    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [roomId])

  async function init() {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user || !roomId) return

    setUserId(user.id)

    // Load history
    const history = await getMessages(roomId, 100)
    setMessages(history)
    setLoading(false)

    // Subscribe to new messages
    channelRef.current = subscribeToMessages(roomId, (msg) => {
      setMessages(prev => [...prev, msg])
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    })
  }

  async function handleSend(content: string) {
    if (!userId || !roomId) return

    // Optimistic update
    const optimistic: Message = {
      id:         `temp-${Date.now()}`,
      room_id:    roomId,
      sender_id:  userId,
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50)

    await sendMessage({ room_id: roomId, sender_id: userId, content })
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  function shouldShowAvatar(index: number, messages: Message[]): boolean {
    if (index === 0) return true
    return messages[index].sender_id !== messages[index - 1].sender_id
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <PageLayout
        header={{
          title: title ?? 'Chat',
          subtitle: participantName,
          left: (
            <Pressable onPress={() => router.back()}
              className="w-9 h-9 items-center justify-center rounded-xl bg-neutral-100">
              <Text className="text-neutral-600">‹</Text>
            </Pressable>
          ),
          right: participantName ? (
            <Avatar name={participantName} size="sm" />
          ) : undefined,
        }}
        noScroll noPad
        footer={<ChatInput onSend={handleSend} />}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#4F6EF7" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerClassName="gap-1 py-4"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item, index }) => (
              <MessageBubble
                content={item.content}
                isMine={item.sender_id === userId}
                senderName={item.sender?.full_name ?? undefined}
                avatarUri={item.sender?.avatar_url ?? undefined}
                time={formatTime(item.created_at)}
                showAvatar={shouldShowAvatar(index, messages)}
              />
            )}
          />
        )}
      </PageLayout>
    </KeyboardAvoidingView>
  )
}