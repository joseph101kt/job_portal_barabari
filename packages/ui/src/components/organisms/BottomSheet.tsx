// packages/ui/src/components/organisms/BottomSheet.tsx
import React, { useEffect } from 'react'
import {
  View, Text, Modal, Pressable, ScrollView, Dimensions,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, runOnJS,
} from 'react-native-reanimated'

type Props = {
  visible:    boolean
  onClose:    () => void
  title?:     string
  children:   React.ReactNode
  height?:    '40%' | '60%' | '75%' | '90%'
  scrollable?: boolean
}

const { height: SCREEN_H } = Dimensions.get('window')

export function BottomSheet({
  visible, onClose, title, children,
  height = '60%', scrollable = true,
}: Props) {
  const translateY = useSharedValue(SCREEN_H)

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 })
    } else {
      translateY.value = withTiming(SCREEN_H, { duration: 250 })
    }
  }, [visible])

  function handleClose() {
    translateY.value = withTiming(SCREEN_H, { duration: 250 }, () => {
      runOnJS(onClose)()
    })
  }

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 bg-black/50"
        onPress={handleClose}
      />

      {/* Sheet */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 rounded-t-3xl overflow-hidden"
        style={[{ maxHeight: height }, sheetStyle]}
      >
        {/* Handle */}
        <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-600" />
        </View>

        {/* Header */}
        {title && (
          <View className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-base font-semibold text-neutral-900 dark:text-white">
              {title}
            </Text>
            <Pressable onPress={handleClose} className="w-7 h-7 rounded-full bg-neutral-100 items-center justify-center">
              <Text className="text-neutral-500 text-base leading-none">×</Text>
            </Pressable>
          </View>
        )}

        {/* Content */}
        {scrollable ? (
          <ScrollView
            contentContainerClassName="px-5 pb-8"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View className="px-5 pb-8">{children}</View>
        )}
      </Animated.View>
    </Modal>
  )
}