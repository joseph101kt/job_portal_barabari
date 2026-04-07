// packages/ui/src/components/atoms/DateInput.tsx
import React from 'react'
import { Platform, View, Text, Pressable } from 'react-native'

type Props = {
  label: string
  value?: string | null
  onChange: (date: string | null) => void
}

// ───────────── HELPERS ─────────────

function formatDisplay(date?: string | null) {
  if (!date) return ''

  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  } catch {
    return ''
  }
}

// ───────────── COMPONENT ─────────────

export function DateInput({ label, value, onChange }: Props) {
  // ✅ WEB HANDLER
  const handleWebPress = () => {
    const input = document.getElementById(
      `date-input-${label}`
    ) as HTMLInputElement | null

    if (!input) return

    if (input.showPicker) {
      input.showPicker()
    } else {
      input.focus()
      input.click()
    }
  }

  // ───────────── WEB ─────────────
  if (Platform.OS === 'web') {
    return (
      <View className="gap-1">
        <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </Text>

        <Pressable
          onPress={handleWebPress}
          className="
            relative p-3 rounded-xl border
            bg-white dark:bg-neutral-900
            border-neutral-200 dark:border-neutral-700
            active:opacity-80
          "
        >
          {/* Hidden native input */}
          <input
            id={`date-input-${label}`}
            type="date"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />

          {/* Visible value */}
          <Text
            className={`text-sm ${
              value
                ? 'text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-400 dark:text-neutral-500'
            }`}
          >
            {value ? formatDisplay(value) : 'Select date'}
          </Text>

          {/* Icon */}
          <Text className="absolute right-3 top-3 text-neutral-400">
            📅
          </Text>
        </Pressable>
      </View>
    )
  }

  // ───────────── NATIVE ─────────────
  return (
    <View className="gap-1">
      <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>

      <View
        className="
          p-3 rounded-xl border
          bg-white dark:bg-neutral-900
          border-neutral-200 dark:border-neutral-700
        "
      >
        <Text
          className={`text-sm ${
            value
              ? 'text-neutral-900 dark:text-neutral-100'
              : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          {formatDisplay(value) || 'Select date'}
        </Text>
      </View>
    </View>
  )
}