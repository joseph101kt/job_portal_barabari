// packages/ui/src/components/atoms/Toggle.tsx
import React from 'react'
import { Pressable, View, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

type Props = {
  value:       boolean
  onToggle:    (v: boolean) => void
  label?:      string
  disabled?:   boolean
}

export function Toggle({ value, onToggle, label, disabled }: Props) {
  const translateX = useSharedValue(value ? 20 : 2)

  React.useEffect(() => {
    translateX.value = withSpring(value ? 20 : 2, { damping: 15, stiffness: 200 })
  }, [value])

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <Pressable
      onPress={() => !disabled && onToggle(!value)}
      disabled={disabled}
      className={`flex-row items-center gap-2.5 ${disabled ? 'opacity-50' : ''}`}
    >
      <View className={[
        'w-12 h-7 rounded-full justify-center',
        value ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-700',
      ].join(' ')}>
        <Animated.View
          className="w-5 h-5 rounded-full bg-white shadow-sm absolute"
          style={thumbStyle}
        />
      </View>
      {label && (
        <Text className="text-sm text-neutral-700 dark:text-neutral-200">{label}</Text>
      )}
    </Pressable>
  )
}