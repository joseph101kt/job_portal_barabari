// apps/mobile/app/shared/interview-lobby.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, Alert, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { PageLayout, Card, Button, Badge, Avatar } from '@my-app/ui'
import {
  getInterviewByRoom, startInterview,
  getSupabase, type Interview,
} from '@my-app/supabase'

export default function InterviewLobbyScreen() {
  const { roomName } = useLocalSearchParams<{ roomName: string }>()
  const router = useRouter()

  const [interview, setInterview] = useState<Interview | null>(null)
  const [userId,    setUserId]    = useState<string | null>(null)
  const [joining,   setJoining]   = useState(false)

  useEffect(() => {
    init()
  }, [roomName])

  async function init() {
    const { data: { user } } = await getSupabase().auth.getUser()
    if (!user || !roomName) return
    setUserId(user.id)

    const data = await getInterviewByRoom(roomName)
    setInterview(data)
  }

  async function handleJoin() {
    if (!interview) return
    setJoining(true)

    if (interview.status === 'scheduled') {
      await startInterview(interview.id)
    }

    router.push({
      pathname: '/shared/interview-room',
      params: { roomName },
    })
    setJoining(false)
  }

  const isInterviewer = userId === interview?.interviewer_id
  const isCandidate   = userId === interview?.candidate_id

  const otherPerson = isInterviewer
    ? interview?.candidate
    : interview?.interviewer

  return (
    <PageLayout
      header={{
        title: 'Interview lobby',
        left: (
          <Pressable onPress={() => router.back()}
            className="w-9 h-9 items-center justify-center rounded-xl bg-neutral-100">
            <Text className="text-neutral-600">‹</Text>
          </Pressable>
        ),
      }}
    >
      <View className="gap-5">
        {/* Interview info */}
        <Card elevation="raised" className="gap-4">
          <View className="items-center gap-3">
            <View className="w-16 h-16 rounded-2xl bg-primary-100 items-center justify-center">
              <Text className="text-3xl">🎥</Text>
            </View>
            <View className="items-center gap-1">
              <Text className="text-xl font-bold text-neutral-900 dark:text-white text-center">
                {interview?.listing?.title ?? 'Interview'}
              </Text>
              <Text className="text-sm text-neutral-500 text-center">
                {isInterviewer ? 'You are the interviewer' : 'Candidate interview'}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-center">
            <Badge
              label={interview?.status ?? 'scheduled'}
              variant={interview?.status === 'active' ? 'success' : 'warning'}
              dot
            />
          </View>
        </Card>

        {/* Participant */}
        {otherPerson && (
          <Card elevation="flat">
            <View className="flex-row items-center gap-3">
              <Avatar
                name={otherPerson.full_name ?? '?'}
                uri={otherPerson.avatar_url ?? undefined}
                size="md"
              />
              <View className="flex-1">
                <Text className="text-sm text-neutral-400 mb-0.5">
                  {isInterviewer ? 'Candidate' : 'Interviewer'}
                </Text>
                <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                  {otherPerson.full_name ?? 'Unknown'}
                </Text>
              </View>
              <View className="w-2.5 h-2.5 rounded-full bg-success-500" />
            </View>
          </Card>
        )}

        {/* Pre-call checklist */}
        <Card elevation="flat" className="gap-3">
          <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Before you join
          </Text>
          {[
            { icon: '🎤', text: 'Make sure your microphone is working' },
            { icon: '📷', text: 'Check your camera is on and clear' },
            { icon: '🔇', text: 'Find a quiet space with good lighting' },
          ].map((item, i) => (
            <View key={i} className="flex-row items-center gap-3">
              <Text className="text-base">{item.icon}</Text>
              <Text className="text-sm text-neutral-500 flex-1">{item.text}</Text>
            </View>
          ))}
        </Card>

        {/* Room name */}
        <View className="items-center gap-1">
          <Text className="text-xs text-neutral-400">Room</Text>
          <Text className="text-xs font-mono text-neutral-500">{roomName}</Text>
        </View>

        <Button
          label={joining ? 'Joining…' : 'Join interview'}
          variant="primary"
          size="lg"
          fullWidth
          loading={joining}
          onPress={handleJoin}
        />

        {isInterviewer && (
          <Button
            label="Open chat"
            variant="outline"
            size="md"
            fullWidth
            onPress={() => router.push({
              pathname: '/shared/chat',
              params: {
                roomId: roomName,
                title:  'Interview chat',
                participantName: otherPerson?.full_name ?? 'Candidate',
              },
            })}
          />
        )}
      </View>
    </PageLayout>
  )
}