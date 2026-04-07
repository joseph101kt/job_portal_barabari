'use client'

import { useEffect, useRef, useState } from 'react'
import { View, Text } from 'react-native'
import { Track } from 'livekit-client'
import { Icon } from './Icon'

interface Props {
  participant: any
  isLocal: boolean
  name?: string
}

export function ParticipantTile({ participant, isLocal, name }: Props) {
  const videoRef = useRef<any>(null)
  const audioRef = useRef<any>(null)

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasVideo, setHasVideo] = useState(false)
  const [isLoadingVideo, setIsLoadingVideo] = useState(true)

  // 🎥 Track handling + race condition fix
useEffect(() => {
  if (!participant) return

  let retryCount = 0
  let retryTimer: any

  const attach = () => {
    const videoPub = participant.getTrackPublication(Track.Source.Camera)
    const audioPub = participant.getTrackPublication(Track.Source.Microphone)

    // VIDEO
    if (videoPub?.track && videoRef.current) {
      videoPub.track.attach(videoRef.current)

      const videoEnabled = !videoPub.isMuted
      setHasVideo(videoEnabled)
      setIsLoadingVideo(false)

      // ✅ STOP retrying once success
      if (retryTimer) clearInterval(retryTimer)
    } else {
      setHasVideo(false)
      setIsLoadingVideo(true)

      // 🔁 Retry only a few times
      if (retryCount < 10 && !retryTimer) {
        retryTimer = setInterval(() => {
          retryCount++
          attach()
        }, 200)
      }
    }

    // AUDIO
    if (audioPub?.track && audioRef.current && !isLocal) {
      audioPub.track.attach(audioRef.current)
    }

    setIsMuted(audioPub?.isMuted ?? false)
  }

  attach()

  participant.on('trackSubscribed', attach)
  participant.on('trackPublished', attach)
  participant.on('trackMuted', attach)
  participant.on('trackUnmuted', attach)
  participant.on('trackUnsubscribed', attach)

  return () => {
    if (retryTimer) clearInterval(retryTimer)

    participant.off('trackSubscribed', attach)
    participant.off('trackPublished', attach)
    participant.off('trackMuted', attach)
    participant.off('trackUnmuted', attach)
    participant.off('trackUnsubscribed', attach)
  }
}, [participant, isLocal])
  // 🎙 Speaking indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking((participant.audioLevel ?? 0) > 0.05)
    }, 200)
    return () => clearInterval(interval)
  }, [participant])

  // 👤 Name
  const displayName = isLocal ? 'You' : (name ?? 'Guest')

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <View className="w-full aspect-video rounded-2xl overflow-hidden bg-[#0d0d0f] relative">

      {/* 🔊 Speaking ring */}
      {isSpeaking && (
        <View className="absolute inset-0 rounded-2xl z-20 pointer-events-none border-2 border-amber-400 shadow-[0_0_0_4px_rgba(245,158,11,0.15),inset_0_0_24px_rgba(245,158,11,0.08)]" />
      )}

      {/* Idle border */}
      {!isSpeaking && (
        <View className="absolute inset-0 rounded-2xl z-20 pointer-events-none border border-white/[0.06]" />
      )}

      {/* ✨ Loading shimmer */}
      {isLoadingVideo && (
        <View className="absolute inset-0 z-10 overflow-hidden">
          <View className="absolute inset-0 bg-[#151518]" />
          <View className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        </View>
      )}

      {/* 👤 Avatar fallback */}
      {!hasVideo && !isLoadingVideo && (
        <View className="absolute inset-0 items-center justify-center bg-[#111114] z-10">
          <View className="w-16 h-16 rounded-full items-center justify-center bg-amber-400/10 border border-amber-400/25">
            <Text className="font-mono text-xl font-medium text-amber-400 tracking-[2px]">
              {initials}
            </Text>
          </View>
        </View>
      )}

      {/* 🎥 Video */}
      {/* @ts-ignore */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`absolute inset-0 w-full h-full object-cover ${
          hasVideo ? 'block' : 'hidden'
        }`}
      />

      {/* 🔊 Audio */}
      {/* @ts-ignore */}
      {!isLocal && <audio ref={audioRef} autoPlay className="hidden" />}

      {/* Bottom bar */}
      <View className="absolute bottom-0 left-0 right-0 z-30 flex-row justify-between items-center px-3 py-2.5 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
        <Text
          numberOfLines={1}
          className={`font-mono text-[11px] font-medium tracking-[0.8px] shrink mr-2 ${
            isLocal ? 'text-white/40' : 'text-white/85'
          }`}
        >
          {displayName}
        </Text>

        <View
          className={`flex-row items-center gap-1 px-1.5 py-0.5 rounded-md ${
            isMuted
              ? 'bg-red-500/15'
              : isSpeaking
              ? 'bg-amber-400/15'
              : 'bg-white/[0.06]'
          }`}
        >
          {isMuted ? (
            <Icon name="mic-off" size={12} color="#ef4444" />
          ) : isSpeaking ? (
            <Icon name="volume" size={12} color="#f59e0b" />
          ) : (
            <Icon name="mic" size={12} color="rgba(255,255,255,0.3)" />
          )}
        </View>
      </View>

      {/* You badge */}
      {isLocal && (
        <View className="absolute top-2.5 right-2.5 z-30 px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/10">
          <Text className="font-mono text-[9px] text-white/35 tracking-[1.2px] uppercase">
            you
          </Text>
        </View>
      )}
    </View>
  )
}