// packages/ui/src/components/atoms/Tag.tsx
import React from 'react'
import { Pressable, Text, View } from 'react-native'

type Props = {
  label:      string
  onRemove?:  () => void
  onPress?:   () => void
  muted?:     boolean
  required?:  boolean
}

export function Tag({ label, onRemove, onPress, muted, required }: Props) {
  const Wrapper = onPress ? Pressable : View

  return (
    <Wrapper
      onPress={onPress}
      className={[
        'flex-row items-center gap-1 px-2.5 py-1 rounded-lg self-start',
        required
          ? 'bg-primary-50 border border-primary-200'
          : muted
          ? 'bg-neutral-100 border border-neutral-200'
          : 'bg-primary-50 border border-primary-100',
        onPress ? 'active:opacity-75' : '',
      ].join(' ')}
    >
      <Text className={[
        'text-xs font-medium',
        required ? 'text-primary-700' : muted ? 'text-neutral-500' : 'text-primary-600',
      ].join(' ')}>
        {label}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} className="ml-0.5">
          <Text className="text-xs text-neutral-400">×</Text>
        </Pressable>
      )}
    </Wrapper>
  )
}