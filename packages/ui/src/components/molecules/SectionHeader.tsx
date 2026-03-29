// packages/ui/src/components/molecules/SectionHeader.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'

type Props = {
  title:       string
  subtitle?:   string
  action?:     { label: string; onPress: () => void }
  className?:  string
}

export function SectionHeader({ title, subtitle, action, className = '' }: Props) {
  return (
    <View className={`flex-row items-end justify-between ${className}`}>
      <View className="gap-0.5 flex-1">
        <Text className="text-lg font-bold text-neutral-900 dark:text-white">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-neutral-400">{subtitle}</Text>
        )}
      </View>
      {action && (
        <Pressable onPress={action.onPress} className="active:opacity-70">
          <Text className="text-sm font-medium text-primary-600">{action.label}</Text>
        </Pressable>
      )}
    </View>
  )
}