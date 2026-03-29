// packages/ui/src/components/molecules/StatCard.tsx
import React from 'react'
import { View, Text } from 'react-native'
import { Card } from './Card'

type Trend = 'up' | 'down' | 'neutral'

type Props = {
  label:      string
  value:      string | number
  sublabel?:  string
  trend?:     Trend
  trendValue?: string
  color?:     'primary' | 'success' | 'warning' | 'error'
  onPress?:   () => void
}

const colorClasses = {
  primary: { icon: 'bg-primary-100', text: 'text-primary-600' },
  success: { icon: 'bg-success-100', text: 'text-success-600' },
  warning: { icon: 'bg-warning-100', text: 'text-warning-600' },
  error:   { icon: 'bg-error-100',   text: 'text-error-600' },
}

const trendClasses: Record<Trend, { text: string; prefix: string }> = {
  up:      { text: 'text-success-600', prefix: '↑ ' },
  down:    { text: 'text-error-600',   prefix: '↓ ' },
  neutral: { text: 'text-neutral-400', prefix: '— ' },
}

export function StatCard({ label, value, sublabel, trend, trendValue, color = 'primary', onPress }: Props) {
  const c = colorClasses[color]
  const t = trend ? trendClasses[trend] : null

  return (
    <Card elevation="raised" onPress={onPress} className="flex-1">
      <View className="gap-1">
        <Text className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          {label}
        </Text>
        <Text className={`text-2xl font-bold ${c.text}`}>
          {value}
        </Text>
        {(sublabel || trendValue) && (
          <View className="flex-row items-center gap-1">
            {t && trendValue && (
              <Text className={`text-xs font-medium ${t.text}`}>
                {t.prefix}{trendValue}
              </Text>
            )}
            {sublabel && (
              <Text className="text-xs text-neutral-400">{sublabel}</Text>
            )}
          </View>
        )}
      </View>
    </Card>
  )
}