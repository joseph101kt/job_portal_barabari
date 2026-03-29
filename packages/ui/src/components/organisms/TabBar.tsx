// packages/ui/src/components/organisms/TabBar.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Tab = {
  key:         string
  label:       string
  icon:        string   // emoji for now — swap for SVG icons later
  activeIcon?: string
  badge?:      number
}

type Props = {
  tabs:     Tab[]
  active:   string
  onChange: (key: string) => void
}

export function TabBar({ tabs, active, onChange }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="flex-row bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800"
      style={{ paddingBottom: insets.bottom }}
    >
      {tabs.map(tab => {
        const isActive = tab.key === active
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className="flex-1 items-center py-2.5 gap-1 active:opacity-70"
          >
            <View className="relative">
              <Text className="text-2xl leading-none">
                {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
              </Text>
              {tab.badge != null && tab.badge > 0 && (
                <View className="absolute -top-1 -right-2 bg-error-500 rounded-full min-w-4 h-4 items-center justify-center px-0.5">
                  <Text className="text-white text-xs font-bold leading-none">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text className={[
              'text-xs font-medium',
              isActive ? 'text-primary-600' : 'text-neutral-400',
            ].join(' ')}>
              {tab.label}
            </Text>
            {isActive && (
              <View className="absolute bottom-0 w-5 h-0.5 rounded-full bg-primary-500" />
            )}
          </Pressable>
        )
      })}
    </View>
  )
}