// packages/ui/src/components/molecules/Card.tsx
import React from 'react'
import { Pressable, View, type ViewProps } from 'react-native'

type Elevation = 'flat' | 'raised' | 'elevated'
type Props = ViewProps & {
  elevation?: Elevation
  onPress?:   () => void
  children:   React.ReactNode
  className?: string
  noPad?:     boolean
}

const elevationClasses: Record<Elevation, string> = {
  flat:     'bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700',
  raised:   'bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm',
  elevated: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-md',
}

export function Card({ elevation = 'raised', onPress, children, className = '', noPad, ...props }: Props) {
  const classes = [
    'rounded-2xl',
    elevationClasses[elevation],
    noPad ? '' : 'p-4',
    className,
  ].join(' ')

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${classes} active:opacity-90`} {...props}>
        {children}
      </Pressable>
    )
  }

  return (
    <View className={classes} {...props}>
      {children}
    </View>
  )
}