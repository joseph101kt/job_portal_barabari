'use client'

import { useEffect, useRef, useState } from 'react'
import {
  View,
  FlatList,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { getSupabase } from '@my-app/supabase'

type Message = {
  id: string
  content: string
  sender_id: string | null
  created_at: string
}

type Props = {
  applicationId: string
  onBack?: () => void
}

export function ChatSection({ applicationId, onBack }: Props) {
  const supabase = getSupabase()

  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const flatRef = useRef<FlatList>(null)

  // ================= GET USER =================
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  // ================= FETCH MESSAGES =================
  const fetchMessages = async () => {
    console.log('📥 fetching messages...')

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true })

    setMessages(data || [])

    setTimeout(() => {
      flatRef.current?.scrollToEnd({ animated: false })
    }, 100)
  }

  // ================= REALTIME + INITIAL LOAD =================
  useEffect(() => {
    if (!applicationId) return

    console.log('🟢 subscribe chat:', applicationId)

    fetchMessages()

    const channel = supabase
      .channel(`chat-${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `application_id=eq.${applicationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message

          console.log('🔥 realtime message:', newMsg)

          setMessages((prev) => {
            // 🔥 replace matching temp message
            const tempIndex = prev.findIndex(
              (m) =>
                m.id.startsWith('temp-') &&
                m.content === newMsg.content &&
                m.sender_id === newMsg.sender_id
            )

            if (tempIndex !== -1) {
              const updated = [...prev]
              updated[tempIndex] = newMsg
              return updated
            }

            // ✅ prevent true duplicates
            const exists = prev.find((m) => m.id === newMsg.id)
            if (exists) return prev

            return [...prev, newMsg]
          })

          setTimeout(() => {
            flatRef.current?.scrollToEnd({ animated: true })
          }, 100)
        }
      )
      .subscribe()

    return () => {
      console.log('🔴 unsubscribe chat:', applicationId)
      supabase.removeChannel(channel)
    }
  }, [applicationId])

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    const messageText = text.trim()
    if (!messageText) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      content: messageText,
      sender_id: user.id,
      created_at: new Date().toISOString(),
    }

    // ✅ optimistic UI
    setMessages((prev) => [...prev, tempMessage])
    setText('')

    setTimeout(() => {
      flatRef.current?.scrollToEnd({ animated: true })
    }, 100)

    const { error } = await supabase.from('messages').insert({
      application_id: applicationId,
      sender_id: user.id,
      content: messageText,
    })

    if (error) {
      console.error('❌ send message error:', error)
    }
  }

  // ================= UI =================
  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">

      {/* HEADER */}
      <View className="h-14 px-4 flex-row items-center border-b border-neutral-200 dark:border-neutral-800">
        {onBack && (
          <Pressable onPress={onBack} className="mr-3">
            <Text className="text-primary-500 text-base">←</Text>
          </Pressable>
        )}
        <Text className="text-base font-semibold text-neutral-900 dark:text-white">
          Chat
        </Text>
      </View>

      {/* BODY */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => {
            const isMine = item.sender_id === userId

            return (
              <View className={`mb-2 ${isMine ? 'items-end' : 'items-start'}`}>
                <View
                  className={`px-4 py-2 rounded-2xl max-w-[75%] ${
                    isMine
                      ? 'bg-blue-500'
                      : 'bg-neutral-200 dark:bg-neutral-700'
                  }`}
                >
                  <Text className={`${isMine ? 'text-white' : 'text-black dark:text-white'}`}>
                    {item.content}
                  </Text>
                </View>
              </View>
            )
          }}
        />

        {/* INPUT */}
        <View className="flex-row items-center gap-2 p-3 border-t border-neutral-200 dark:border-neutral-800">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-full text-black dark:text-white"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />

          <Pressable
            onPress={sendMessage}
            className="px-4 py-2 bg-blue-500 rounded-full"
          >
            <Text className="text-white font-semibold">Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}