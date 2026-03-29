// packages/ui/src/components/molecules/ProfileCompletion.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { ProgressBar } from './ProgressBar'
import { Card } from './Card'

type Task = {
  label:     string
  done:      boolean
  onPress?:  () => void
}

type Props = {
  tasks:     Task[]
  onDismiss?: () => void
}

export function ProfileCompletion({ tasks, onDismiss }: Props) {
  const completed = tasks.filter(t => t.done).length
  const progress  = completed / tasks.length
  const pct       = Math.round(progress * 100)

  if (progress === 1) return null

  return (
    <Card elevation="raised" className="gap-3">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Complete your profile
          </Text>
          <Text className="text-xs text-neutral-400 mt-0.5">
            {pct}% done · Get {tasks.length - completed} more things done
          </Text>
        </View>
        {onDismiss && (
          <Pressable onPress={onDismiss}>
            <Text className="text-neutral-300 text-lg">×</Text>
          </Pressable>
        )}
      </View>

      <ProgressBar progress={progress} color="primary" size="sm" />

      <View className="gap-2">
        {tasks.filter(t => !t.done).slice(0, 3).map((task, i) => (
          <Pressable
            key={i}
            onPress={task.onPress}
            className="flex-row items-center gap-2 active:opacity-70"
          >
            <View className="w-4 h-4 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
            <Text className="text-sm text-primary-600 font-medium flex-1">
              {task.label}
            </Text>
            <Text className="text-neutral-300">›</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  )
}