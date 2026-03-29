// packages/ui/src/components/organisms/ChatInput.tsx
import React, { useState } from 'react'
import { View, TextInput, Pressable, Text } from 'react-native'

type Props = {
  onSend:    (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Type a message…' }: Props) {
  const [text, setText] = useState('')

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  const canSend = text.trim().length > 0 && !disabled

  return (
    <View className="flex-row items-end gap-2 px-4 py-3 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
      <View className="flex-1 min-h-10 max-h-28 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 justify-center">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          multiline
          returnKeyType="default"
          className="text-sm text-neutral-900 dark:text-white py-0"
          style={{ maxHeight: 100 }}
        />
      </View>

      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        className={[
          'w-10 h-10 rounded-full items-center justify-center',
          canSend ? 'bg-primary-500 active:bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700',
        ].join(' ')}
      >
        <Text className={`text-lg ${canSend ? 'text-white' : 'text-neutral-400'}`}>↑</Text>
      </Pressable>
    </View>
  )
}