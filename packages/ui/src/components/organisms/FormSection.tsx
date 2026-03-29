// packages/ui/src/components/organisms/FormSection.tsx
import React from 'react'
import { View, Text } from 'react-native'

type Props = {
  title?:      string
  description?: string
  children:    React.ReactNode
  className?:  string
}

export function FormSection({ title, description, children, className = '' }: Props) {
  return (
    <View className={`gap-4 ${className}`}>
      {(title || description) && (
        <View className="gap-1">
          {title && (
            <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
              {title}
            </Text>
          )}
          {description && (
            <Text className="text-sm text-neutral-400 leading-relaxed">
              {description}
            </Text>
          )}
        </View>
      )}
      <View className="gap-3">
        {children}
      </View>
    </View>
  )
}