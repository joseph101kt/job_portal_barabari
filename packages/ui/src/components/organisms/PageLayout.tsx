// packages/ui/src/components/organisms/PageLayout.tsx
import React from 'react'
import {
  View, Text, ScrollView, SafeAreaView,
  type ScrollViewProps,
} from 'react-native'

type Header = {
  title:    string
  subtitle?: string
  right?:   React.ReactNode
  left?:    React.ReactNode
}

type Props = ScrollViewProps & {
  header?:       Header
  children:      React.ReactNode
  noPad?:        boolean
  noScroll?:     boolean
  bgColor?:      string
  footer?:       React.ReactNode
}

export function PageLayout({
  header, children, noPad, noScroll, footer,
  contentContainerClassName = '', ...props
}: Props) {
  const content = noScroll ? (
    <View className={noPad ? 'flex-1' : 'flex-1 gap-5 px-5 py-4'}>
      {children}
    </View>
  ) : (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName={`gap-5 pb-8 ${noPad ? '' : 'px-5 pt-4'} ${contentContainerClassName}`}
      {...props}
    >
      {children}
    </ScrollView>
  )

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      {header && (
        <View className="flex-row items-center px-5 py-3 bg-neutral-50 dark:bg-neutral-900">
          {header.left && (
            <View className="mr-3">{header.left}</View>
          )}
          <View className="flex-1">
            <Text className="text-xl font-bold text-neutral-900 dark:text-white">
              {header.title}
            </Text>
            {header.subtitle && (
              <Text className="text-xs text-neutral-400 mt-0.5">{header.subtitle}</Text>
            )}
          </View>
          {header.right && (
            <View className="ml-3">{header.right}</View>
          )}
        </View>
      )}

      {content}

      {footer && (
        <View className="border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-3">
          {footer}
        </View>
      )}
    </SafeAreaView>
  )
}