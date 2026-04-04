// apps/mobile/app/poster/_layout.tsx
import React from 'react'
import { View } from 'react-native'
import { Slot, useRouter, useSegments } from 'expo-router'
import { TabBar } from '@my-app/ui'

const POSTER_TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', activeIcon: '📊' },
  { key: 'chat',      label: 'Chat',      icon: '💬', activeIcon: '💬', badge: 0 },
  { key: 'profile',   label: 'Profile',   icon: '👤', activeIcon: '👤' },
]

export default function PosterLayout() {
  const router   = useRouter()
  const segments = useSegments()

  const active = POSTER_TABS.find(t =>
    segments[segments.length - 1] === t.key
  )?.key ?? 'dashboard'

  return (
    <View className="flex-1">
      <Slot />
      <TabBar
        tabs={POSTER_TABS}
        active={active}
        onChange={key => router.push(`/poster/${key}` as any)}
      />
    </View>
  )
}