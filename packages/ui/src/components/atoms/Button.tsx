// packages/ui/src/components/atoms/Button.tsx
import React from 'react'
import { Pressable, Text, ActivityIndicator, View } from 'react-native'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
type Size    = 'xs' | 'sm' | 'md' | 'lg'

type Props = {
  label:     string
  onPress?:  () => void
  variant?:  Variant
  size?:     Size
  loading?:  boolean
  disabled?: boolean
  fullWidth?: boolean
  icon?:     React.ReactNode
  iconRight?: React.ReactNode
  className?: string
}

const variantClasses: Record<Variant, { container: string; text: string }> = {
  primary:   { container: 'bg-primary-500 border border-primary-500',   text: 'text-white' },
  secondary: { container: 'bg-primary-50 border border-primary-100',    text: 'text-primary-700' },
  outline:   { container: 'bg-white border border-neutral-200',          text: 'text-neutral-700' },
  ghost:     { container: 'bg-transparent border border-transparent',    text: 'text-primary-600' },
  danger:    { container: 'bg-error-50 border border-error-200',         text: 'text-error-600' },
  success:   { container: 'bg-success-50 border border-success-200',     text: 'text-success-700' },
}

const sizeClasses: Record<Size, { container: string; text: string; indicator: number }> = {
  xs: { container: 'py-1.5 px-3 rounded-lg',   text: 'text-xs font-semibold',    indicator: 12 },
  sm: { container: 'py-2 px-4 rounded-xl',      text: 'text-sm font-semibold',    indicator: 14 },
  md: { container: 'py-3 px-5 rounded-xl',      text: 'text-sm font-semibold',    indicator: 16 },
  lg: { container: 'py-3.5 px-6 rounded-xl',    text: 'text-base font-semibold',  indicator: 18 },
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, icon, iconRight, className = '',
}: Props) {
  const v = variantClasses[variant]
  const s = sizeClasses[size]
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center gap-2',
        v.container,
        s.container,
        fullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-50' : 'active:opacity-80',
        className,
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator
          size={s.indicator}
          color={variant === 'primary' ? '#fff' : '#4F6EF7'}
        />
      ) : icon ? (
        <View>{icon}</View>
      ) : null}

      <Text className={[s.text, v.text].join(' ')}>
        {label}
      </Text>

      {iconRight && !loading && <View>{iconRight}</View>}
    </Pressable>
  )
}