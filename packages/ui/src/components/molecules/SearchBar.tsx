// packages/ui/src/components/molecules/SearchBar.tsx
import React, { useState } from 'react'
import { View, TextInput, Pressable, Text } from 'react-native'

type Props = {
  value:         string
  onChangeText:  (text: string) => void
  placeholder?:  string
  onSubmit?:     () => void
  onClear?:      () => void
  className?:    string
}

export function SearchBar({
  value, onChangeText, placeholder = 'Search jobs, companies…',
  onSubmit, onClear, className = '',
}: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <View className={[
      'flex-row items-center gap-2 px-4 py-2.5 rounded-2xl border',
      'bg-neutral-50 dark:bg-neutral-800',
      focused
        ? 'border-primary-400 bg-white dark:bg-neutral-800'
        : 'border-neutral-200 dark:border-neutral-700',
      className,
    ].join(' ')}>
      {/* Search icon */}
      <Text className="text-base text-neutral-400">🔍</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 text-sm text-neutral-900 dark:text-white py-0.5"
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => { onChangeText(''); onClear?.() }}
          className="w-5 h-5 rounded-full bg-neutral-200 items-center justify-center"
        >
          <Text className="text-xs text-neutral-500 font-bold">×</Text>
        </Pressable>
      )}
    </View>
  )
}