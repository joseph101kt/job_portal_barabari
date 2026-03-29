// packages/ui/src/components/atoms/Avatar.tsx
import React from 'react'
import { View, Text, Image } from 'react-native'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type Props = {
  uri?:      string
  name?:     string
  size?:     Size
  className?: string
}

const sizeClasses: Record<Size, { container: string; text: string; px: number }> = {
  xs: { container: 'w-7 h-7 rounded-lg',    text: 'text-xs font-semibold',   px: 28 },
  sm: { container: 'w-9 h-9 rounded-xl',    text: 'text-sm font-semibold',   px: 36 },
  md: { container: 'w-11 h-11 rounded-xl',  text: 'text-base font-semibold', px: 44 },
  lg: { container: 'w-14 h-14 rounded-2xl', text: 'text-lg font-bold',       px: 56 },
  xl: { container: 'w-20 h-20 rounded-3xl', text: 'text-2xl font-bold',      px: 80 },
}

const bgColors = [
  'bg-primary-100',
  'bg-secondary-100',
  'bg-success-100',
  'bg-purple-100',
  'bg-teal-50',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

function getColorIndex(name: string): number {
  const code = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return code % bgColors.length
}

export function Avatar({ uri, name = '', size = 'md', className = '' }: Props) {
  const s = sizeClasses[size]
  const initials = getInitials(name || '?')
  const bg = bgColors[getColorIndex(name)]

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${s.container} ${className}`}
        style={{ width: s.px, height: s.px }}
      />
    )
  }

  return (
    <View className={`${s.container} ${bg} items-center justify-center ${className}`}
      style={{ width: s.px, height: s.px }}>
      <Text className={`${s.text} text-neutral-700`}>{initials}</Text>
    </View>
  )
}