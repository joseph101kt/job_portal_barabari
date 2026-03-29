// packages/ui/src/components/molecules/ProgressBar.tsx
import React from 'react'
import { View, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

type Props = {
  progress:    number   // 0–1
  label?:      string
  showPercent?: boolean
  color?:      'primary' | 'success' | 'warning' | 'error'
  size?:       'sm' | 'md' | 'lg'
}

const colorClasses = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error:   'bg-error-500',
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  progress, label, showPercent,
  color = 'primary', size = 'md',
}: Props) {
  const width = useSharedValue(0)

  React.useEffect(() => {
    width.value = withSpring(Math.min(Math.max(progress, 0), 1) * 100, {
      damping: 20, stiffness: 90,
    })
  }, [progress])

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

  const pct = Math.round(progress * 100)

  return (
    <View className="gap-1.5">
      {(label || showPercent) && (
        <View className="flex-row justify-between items-center">
          {label && (
            <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {label}
            </Text>
          )}
          {showPercent && (
            <Text className="text-xs font-semibold text-neutral-500">
              {pct}%
            </Text>
          )}
        </View>
      )}
      <View className={`w-full rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden ${sizeClasses[size]}`}>
        <Animated.View
          className={`h-full rounded-full ${colorClasses[color]}`}
          style={animStyle}
        />
      </View>
    </View>
  )
}