// packages/ui/src/components/atoms/Badge.tsx
import React from 'react'
import { View, Text } from 'react-native'

type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  | 'applied' | 'shortlisted' | 'rejected' | 'hired'
  | 'internship' | 'full_time' | 'part_time' | 'contract'

type Props = {
  label:    string
  variant?: Variant
  dot?:     boolean
  size?:    'sm' | 'md'
}

const variantClasses: Record<Variant, { bg: string; text: string; dot: string }> = {
  primary:     { bg: 'bg-primary-50',   text: 'text-primary-700',  dot: 'bg-primary-500' },
  secondary:   { bg: 'bg-secondary-50', text: 'text-secondary-700',dot: 'bg-secondary-500' },
  success:     { bg: 'bg-success-50',   text: 'text-success-700',  dot: 'bg-success-500' },
  warning:     { bg: 'bg-warning-50',   text: 'text-warning-700',  dot: 'bg-warning-500' },
  error:       { bg: 'bg-error-50',     text: 'text-error-600',    dot: 'bg-error-500' },
  info:        { bg: 'bg-blue-50',      text: 'text-blue-700',     dot: 'bg-blue-500' },
  neutral:     { bg: 'bg-neutral-100',  text: 'text-neutral-600',  dot: 'bg-neutral-400' },
  applied:     { bg: 'bg-blue-50',      text: 'text-blue-700',     dot: 'bg-blue-500' },
  shortlisted: { bg: 'bg-warning-50',   text: 'text-warning-700',  dot: 'bg-warning-500' },
  rejected:    { bg: 'bg-error-50',     text: 'text-error-600',    dot: 'bg-error-500' },
  hired:       { bg: 'bg-success-50',   text: 'text-success-700',  dot: 'bg-success-500' },
  internship:  { bg: 'bg-purple-50',    text: 'text-purple-700',   dot: 'bg-purple-500' },
  full_time:   { bg: 'bg-blue-50',      text: 'text-blue-700',     dot: 'bg-blue-500' },
  part_time:   { bg: 'bg-teal-50',      text: 'text-teal-700',     dot: 'bg-teal-500' },
  contract:    { bg: 'bg-orange-50',    text: 'text-orange-700',   dot: 'bg-orange-500' },
}

const sizeClasses = {
  sm: { container: 'px-2 py-0.5 rounded-full', text: 'text-xs font-medium', dot: 'w-1.5 h-1.5' },
  md: { container: 'px-3 py-1 rounded-full',   text: 'text-xs font-medium', dot: 'w-2 h-2' },
}

export function Badge({ label, variant = 'neutral', dot, size = 'md' }: Props) {
  const v = variantClasses[variant]
  const s = sizeClasses[size]

  return (
    <View className={`flex-row items-center gap-1.5 self-start ${v.bg} ${s.container}`}>
      {dot && <View className={`rounded-full ${v.dot} ${s.dot}`} />}
      <Text className={`${s.text} ${v.text}`}>{label}</Text>
    </View>
  )
}