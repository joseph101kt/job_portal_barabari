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
import {
  ScheduleInterviewBtn,
  ScheduleInterviewModal,
} from '../interview/scheduleInterview'
import { InterviewCard } from '../interview/InterviewCard.tsx'

type Message = {
  id: string
  content: string
  sender_id: string | null
  created_at: string
  type?: 'text' | 'interview_invite'
  interview_id?: string
}

type Props = {
  applicationId: string
  onBack?: () => void
  role?: 'poster' | 'job_seeker'
}

export function ChatSection({
  applicationId,
  onBack,
  role = 'job_seeker',
}: Props) {
  const supabase = getSupabase()

  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  const flatRef = useRef<FlatList>(null)

  // ================= GET USER =================
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  // ================= FETCH =================
  const fetchMessages = async () => {
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

  // ================= REALTIME =================
  useEffect(() => {
    if (!applicationId) return

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

          setMessages((prev) => {
            // ✅ Prevent duplicates (now works because IDs match)
            if (prev.find((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          setTimeout(() => {
            flatRef.current?.scrollToEnd({ animated: true })
          }, 100)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [applicationId])

  // ================= SEND =================
  const sendMessage = async () => {
    const messageText = text.trim()
    if (!messageText) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // ✅ Generate SAME ID for optimistic + DB
    const id = crypto.randomUUID()

    const newMessage: Message = {
      id,
      content: messageText,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      type: 'text',
    }

    // ✅ Optimistic update
    setMessages((prev) => [...prev, newMessage])
    setText('')

    setTimeout(() => {
      flatRef.current?.scrollToEnd({ animated: true })
    }, 100)

    // ✅ Insert with SAME ID
    await supabase.from('messages').insert({
      id, // 🔥 critical fix
      application_id: applicationId,
      sender_id: user.id,
      content: messageText,
      type: 'text',
    })
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

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* MODAL */}
        {showSchedule && (
          <ScheduleInterviewModal
            applicationId={applicationId}
            onClose={() => setShowSchedule(false)}
          />
        )}

        {/* MESSAGES */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => {
            const isMine = item.sender_id === userId

            if (item.type === 'interview_invite' && item.interview_id) {
              return (
                <View className="mb-3">
                  <InterviewCard
                    interviewId={item.interview_id}
                    role={role}
                  />
                </View>
              )
            }

            return (
              <View
                className={`mb-2 ${
                  isMine ? 'items-end' : 'items-start'
                }`}
              >
                <View
                  className={`px-4 py-2 rounded-2xl max-w-[75%] ${
                    isMine
                      ? 'bg-blue-500'
                      : 'bg-neutral-200 dark:bg-neutral-700'
                  }`}
                >
                  <Text
                    className={`${
                      isMine
                        ? 'text-white'
                        : 'text-black dark:text-white'
                    }`}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            )
          }}
        />

        {/* INPUT */}
        <View className="flex-row items-center gap-2 p-3 border-t border-neutral-200 dark:border-neutral-800">
          {role === 'poster' && (
            <ScheduleInterviewBtn
              onPress={() => setShowSchedule(true)}
            />
          )}

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