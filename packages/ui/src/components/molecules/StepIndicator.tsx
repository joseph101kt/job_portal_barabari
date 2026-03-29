// packages/ui/src/components/molecules/StepIndicator.tsx
import React from 'react'
import { View, Text } from 'react-native'

type Props = {
  steps:   string[]
  current: number  // 0-indexed
}

export function StepIndicator({ steps, current }: Props) {
  return (
    <View className="gap-3">
      {/* Dots row */}
      <View className="flex-row items-center">
        {steps.map((_, i) => (
          <React.Fragment key={i}>
            <View className={[
              'w-8 h-8 rounded-full items-center justify-center border-2',
              i < current
                ? 'bg-primary-500 border-primary-500'   // completed
                : i === current
                ? 'bg-white border-primary-500'          // current
                : 'bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-600', // upcoming
            ].join(' ')}>
              {i < current ? (
                <Text className="text-white text-xs font-bold">✓</Text>
              ) : (
                <Text className={[
                  'text-xs font-semibold',
                  i === current ? 'text-primary-500' : 'text-neutral-400',
                ].join(' ')}>
                  {i + 1}
                </Text>
              )}
            </View>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <View className={[
                'flex-1 h-0.5 mx-1',
                i < current ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-700',
              ].join(' ')} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Current step label */}
      <View className="items-center">
        <Text className="text-xs font-medium text-neutral-500">
          Step {current + 1} of {steps.length} — {steps[current]}
        </Text>
      </View>
    </View>
  )
}