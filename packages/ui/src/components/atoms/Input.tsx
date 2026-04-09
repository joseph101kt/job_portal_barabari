// packages/ui/src/components/atoms/Input.tsx
import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, type TextInputProps } from 'react-native'

type Props = TextInputProps & {
  label?:       string
  hint?:        string
  error?:       string
  leftIcon?:    React.ReactNode
  rightIcon?:   React.ReactNode
  onRightPress?: () => void
}

export function Input({
  label, hint, error, leftIcon, rightIcon, onRightPress,
  editable = true, className = '', ...props
}: Props) {
  const [focused, setFocused] = useState(false)



  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {label}
        </Text>
      )}

      <View className={[
        'flex-row items-center gap-2 px-4 rounded-xl ',
        'bg-neutral-50 dark:bg-neutral-800',
        focused ? 'bg-white dark:bg-neutral-800' : '',
        !editable ? 'opacity-60' : '',
      ].join(' ')}>

        {leftIcon && (
          <View className="opacity-50">{leftIcon}</View>
        )}

        <TextInput
          className={[
            'flex-1 py-3 text-base text-neutral-900 dark:text-neutral-50',
            className,
          ].join(' ')}
          placeholderTextColor="#94A3B8"
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {rightIcon && (
          <Pressable onPress={onRightPress} className="opacity-50">
            {rightIcon}
          </Pressable>
        )}
      </View>

      {error && (
        <Text className="text-xs text-error-600">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-xs text-neutral-400">{hint}</Text>
      )}
    </View>
  )
}