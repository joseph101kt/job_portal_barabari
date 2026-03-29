// packages/ui/src/components/atoms/Divider.tsx
import React from 'react'
import { View, Text } from 'react-native'

type Props = {
  label?:     string
  className?: string
}

export function Divider({ label, className = '' }: Props) {
  if (label) {
    return (
      <View className={`flex-row items-center gap-3 ${className}`}>
        <View className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
        <Text className="text-xs text-neutral-400 font-medium">{label}</Text>
        <View className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
      </View>
    )
  }

  return (
    <View className={`h-px bg-neutral-100 dark:bg-neutral-800 ${className}`} />
  )
}