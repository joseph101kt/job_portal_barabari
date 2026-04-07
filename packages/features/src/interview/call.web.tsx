'use client'

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Platform, Pressable } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { RoomEvent } from 'livekit-client'
import { useRoomWeb as useRoom } from '@my-app/features'
import { getSupabase, endInterview } from '@my-app/supabase'
import { Icon } from '../livekit/ui/Icon'
import { ParticipantTile } from '../livekit/ui/ParticipantTile.web'

// ─── Control Button ────────────────────────────────────────────────────────────

interface CtrlBtnProps {
  onPress: () => void
  active?: boolean
  danger?: boolean
  children: React.ReactNode
  label: string
}

function CtrlBtn({ onPress, active = true, danger = false, children, label }: CtrlBtnProps) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center gap-1.5 active:opacity-70 active:scale-95 transition-all duration-100"
    >
      <View
        className={`p-2 rounded-xl items-center justify-center backdrop-blur-md ${
          danger
            ? 'bg-red-600/90'
            : active
            ? 'bg-white/10 border border-white/[0.12]'
            : 'bg-white/[0.05] border border-white/[0.05]'
        }`}
      >
        {children}
      </View>
      <Text
        className={`font-mono text-[9px] tracking-[0.8px] uppercase ${
          danger
            ? 'text-red-400/80'
            : active
            ? 'text-white/45'
            : 'text-white/25'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export function CallScreen() {
  const router = useRouter()
  const { interviewId } = useLocalSearchParams()

  const { status, error, room, connect, disconnect, isConnected, isConnecting } = useRoom()

  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({})
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (!interviewId || !userId) return
    connect({ roomName: interviewId as string, participantName: userId })
    return () => { disconnect() }
  }, [interviewId, userId])

  useEffect(() => {
    if (!room) return
    const update = () => forceUpdate(n => n + 1)
    room.on(RoomEvent.ParticipantConnected, update)
    room.on(RoomEvent.ParticipantDisconnected, update)
    room.on(RoomEvent.TrackSubscribed, update)
    room.on(RoomEvent.TrackUnsubscribed, update)
    return () => {
      room.off(RoomEvent.ParticipantConnected, update)
      room.off(RoomEvent.ParticipantDisconnected, update)
      room.off(RoomEvent.TrackSubscribed, update)
      room.off(RoomEvent.TrackUnsubscribed, update)
    }
  }, [room])

  // 🔥 Fetch participant names
  useEffect(() => {
    if (!room) return

    const participants = room.localParticipant
      ? [room.localParticipant, ...Array.from(room.remoteParticipants.values())]
      : []

    const ids = participants.map((p: any) => p.identity).filter(Boolean)

    if (!ids.length) return

    async function fetchProfiles() {
      const { data, error } = await getSupabase()
        .from('profiles')
        .select('id, full_name')
        .in('id', ids)

      if (error) {
        console.error('❌ profiles fetch error:', error)
        return
      }

      const map: Record<string, string> = {}
      data?.forEach((p: any) => {
        map[p.id] = p.full_name ?? 'Guest'
      })

      setProfilesMap(map)
    }

    fetchProfiles()
  }, [room, forceUpdate])

  async function toggleMic() {
    if (!room) return
    const next = !micOn
    await room.localParticipant.setMicrophoneEnabled(next)
    setMicOn(next)
  }

  async function toggleCam() {
    if (!room) return
    const next = !camOn
    await room.localParticipant.setCameraEnabled(next)
    setCamOn(next)
  }

  async function handleLeave() {
    await disconnect()
    if (interviewId) await endInterview(interviewId as string)
    router.canGoBack() ? router.back() : router.replace('/')
  }

  const participants = room?.localParticipant
    ? [room.localParticipant, ...Array.from(room.remoteParticipants.values())]
    : []

  const count = participants.length

  return (
    <View className="flex-1 bg-neutral-900">

      {/* ── Top bar ── */}
      <View
        className={`
          absolute top-0 left-0 right-0 z-40
          flex-row justify-end items-center px-5
          bg-gradient-to-b from-[#08080a]/95 to-transparent
          ${Platform.OS === 'web' ? 'pt-5 pb-4' : 'pt-14 pb-4'}
        `}
      >
        <View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.07]">
          {isConnecting && <ActivityIndicator size="small" color="rgba(251,191,36,0.8)" />}
          <Text
            className={`font-mono text-[9px] tracking-[1.5px] uppercase ${
              isConnected
                ? 'text-emerald-400/70'
                : status === 'error'
                ? 'text-red-400/70'
                : 'text-white/25'
            }`}
          >
            {status}
          </Text>
        </View>
      </View>

      {/* ── Video grid ── */}
      <View
        className={`
          flex-1 px-3
          ${Platform.OS === 'web' ? 'pt-[72px] pb-[120px]' : 'pt-[108px] pb-[120px]'}
        `}
      >
        {count === 1 && (
          <View className="flex-1 justify-center">
            <ParticipantTile
              participant={participants[0]}
              isLocal={participants[0].isLocal}
              name={profilesMap[participants[0].identity]}
            />
          </View>
        )}

        {count === 2 && (
          <View className="flex-1 flex-row gap-2.5 items-center">
            {participants.map((p: any) => (
              <View key={p.identity} className="flex-1">
                <ParticipantTile
                  participant={p}
                  isLocal={p.isLocal}
                  name={profilesMap[p.identity]}
                />
              </View>
            ))}
          </View>
        )}

        {count >= 3 && (
          <View className="flex-1 flex-row flex-wrap gap-2.5 content-start">
            {participants.map((p: any) => (
              <View key={p.identity} className="w-[calc(50%-5px)]">
                <ParticipantTile
                  participant={p}
                  isLocal={p.isLocal}
                  name={profilesMap[p.identity]}
                />
              </View>
            ))}
          </View>
        )}

        {count === 0 && isConnected && (
          <View className="flex-1 items-center justify-center gap-3">
            <View className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] items-center justify-center">
              <Icon name="user" size={20} color="rgba(255,255,255,0.2)" />
            </View>
            <Text className="font-mono text-[11px] tracking-[1.5px] uppercase text-white/[0.18]">
              Waiting for others to join
            </Text>
          </View>
        )}
      </View>

            {/* ── Controls bar ── */}
      <View className={`
        absolute bottom-0 left-0 right-0 z-40
        items-center bg-gradient-to-t from-[#08080a]/95 to-transparent
        ${Platform.OS === 'web' ? 'pb-7 pt-4' : 'pb-10 pt-4'}
      `}>
        <View className="flex-row items-end gap-5 px-7 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-2xl">

          <CtrlBtn onPress={toggleMic} active={micOn} label={micOn ? 'Mute' : 'Unmute'}>
            <Icon name={micOn ? 'mic' : 'mic-off'} size={20} />
          </CtrlBtn>

          <CtrlBtn onPress={toggleCam} active={camOn} label={camOn ? 'Stop' : 'Start'}>
            <Icon name={camOn ? 'video' : 'video-off'} size={20} />
          </CtrlBtn>

          <CtrlBtn onPress={handleLeave} danger label="Leave">
            <Icon name="phone-off" size={20} />
          </CtrlBtn>

        </View>
      </View>
    </View>
  )
}