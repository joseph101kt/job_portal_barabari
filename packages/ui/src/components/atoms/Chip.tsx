// packages/ui/src/components/atoms/Chip.tsx
import React from 'react'
import { Pressable, Text, View } from 'react-native'

type Props = {
  label:      string
  selected?:  boolean
  onPress?:   () => void
  icon?:      React.ReactNode
  disabled?:  boolean
}

export function Chip({ label, selected, onPress, icon, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        'flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border',
        selected
          ? 'bg-primary-500 border-primary-500'
          : 'bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700',
        disabled ? 'opacity-50' : 'active:opacity-75',
      ].join(' ')}
    >
      {icon && (
        <View className={selected ? 'opacity-90' : 'opacity-60'}>{icon}</View>
      )}
      <Text className={[
        'text-sm font-medium',
        selected ? 'text-white' : 'text-neutral-600 dark:text-neutral-300',
      ].join(' ')}>
        {label}
      </Text>
    </Pressable>
  )
}