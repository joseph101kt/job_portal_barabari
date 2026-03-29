// packages/ui/src/components/molecules/FilterChips.tsx
import React from 'react'
import { ScrollView, View } from 'react-native'
import { Chip } from '../atoms/Chip'

type FilterOption = {
  label:  string
  value:  string
  icon?:  React.ReactNode
}

type Props = {
  options:   FilterOption[]
  selected:  string[]
  onToggle:  (value: string) => void
  className?: string
}

export function FilterChips({ options, selected, onToggle, className = '' }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName={`gap-2 px-5 ${className}`}
    >
      {options.map(opt => (
        <Chip
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          selected={selected.includes(opt.value)}
          onPress={() => onToggle(opt.value)}
        />
      ))}
    </ScrollView>
  )
}