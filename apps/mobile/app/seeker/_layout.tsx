// apps/mobile/app/seeker/_layout.tsx
import React, { useState } from 'react'
import { View } from 'react-native'
import { Slot, useRouter, useSegments } from 'expo-router'
import { TabBar } from '@my-app/ui'

const SEEKER_TABS = [
  { key: 'jobs',         label: 'Jobs',         icon: '🔍', activeIcon: '🔎' },
  { key: 'applications', label: 'Applications',  icon: '📋', activeIcon: '📋' },
  { key: 'chat',         label: 'Chat',          icon: '💬', activeIcon: '💬', badge: 0 },
  { key: 'profile',      label: 'Profile',       icon: '👤', activeIcon: '👤' },
]

export default function SeekerLayout() {
  const router   = useRouter()
  const segments = useSegments()

  // Determine active tab from current route
  const active = SEEKER_TABS.find(t =>
    segments[segments.length - 1] === t.key
  )?.key ?? 'jobs'

  function handleTabChange(key: string) {
    router.push(`/seeker/${key}` as any)
  }

  return (
    <View className="flex-1">
      <Slot />
      <TabBar
        tabs={SEEKER_TABS}
        active={active}
        onChange={handleTabChange}
      />
    </View>
  )
}