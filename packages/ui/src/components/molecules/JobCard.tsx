// packages/ui/src/components/molecules/JobCard.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Card } from './Card'
import { Badge } from '../atoms/Badge'
import { Tag } from '../atoms/Tag'
import { Avatar } from '../atoms/Avatar'

type EmploymentType = 'internship' | 'full_time' | 'part_time' | 'contract'

type Props = {
  id:              string
  title:           string
  company:         string
  companyLogo?:    string
  location?:       string
  isRemote?:       boolean
  salaryMin?:      number
  salaryMax?:      number
  employmentType?: EmploymentType
  skills?:         string[]
  postedAt?:       string
  deadline?:       string
  isNew?:          boolean
  isSaved?:        boolean
  onPress?:        () => void
  onSave?:         () => void
  onApply?:        () => void
}

const typeLabels: Record<EmploymentType, string> = {
  internship: 'Internship',
  full_time:  'Full-time',
  part_time:  'Part-time',
  contract:   'Contract',
}

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`
  if (min && max) return `₹${fmt(min)}–${fmt(max)}/mo`
  if (min) return `₹${fmt(min)}+/mo`
  return null
}

export function JobCard({
  title, company, companyLogo, location, isRemote,
  salaryMin, salaryMax, employmentType, skills = [],
  postedAt, deadline, isNew, isSaved, onPress, onSave, onApply,
}: Props) {
  const salary = formatSalary(salaryMin, salaryMax)
  const visibleSkills = skills.slice(0, 3)
  const extraSkills = skills.length - 3

  return (
    <Card elevation="raised" onPress={onPress} noPad>
      <View className="p-4 gap-3">
        {/* Header row */}
        <View className="flex-row items-start gap-3">
          <Avatar uri={companyLogo} name={company} size="md" />

          <View className="flex-1 gap-0.5">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-neutral-900 dark:text-white flex-1" numberOfLines={1}>
                {title}
              </Text>
              {isNew && <Badge label="New" variant="success" size="sm" />}
            </View>
            <Text className="text-sm text-neutral-500">{company}</Text>
          </View>

          {/* Posted time */}
          {postedAt && (
            <Text className="text-xs text-neutral-400">{postedAt}</Text>
          )}
        </View>

        {/* Meta row */}
        <View className="flex-row flex-wrap gap-2">
          {(location || isRemote) && (
            <Text className="text-xs text-neutral-500">
              {isRemote ? '🏠 Remote' : `📍 ${location}`}
            </Text>
          )}
          {salary && (
            <Text className="text-xs text-neutral-500">💰 {salary}</Text>
          )}
          {deadline && (
            <Text className="text-xs text-warning-600">⏰ {deadline}</Text>
          )}
        </View>

        {/* Employment type + skills */}
        <View className="flex-row flex-wrap gap-1.5 items-center">
          {employmentType && (
            <Badge label={typeLabels[employmentType]} variant={employmentType} size="sm" />
          )}
          {visibleSkills.map(skill => (
            <Tag key={skill} label={skill} muted />
          ))}
          {extraSkills > 0 && (
            <Text className="text-xs text-neutral-400">+{extraSkills} more</Text>
          )}
        </View>
      </View>

      {/* Action bar */}
      {(onApply || onSave) && (
        <View className="flex-row border-t border-neutral-100 dark:border-neutral-700">
          {onSave && (
            <Pressable
              onPress={onSave}
              className="flex-1 py-3 items-center active:bg-neutral-50"
            >
              <Text className={`text-sm font-medium ${isSaved ? 'text-primary-600' : 'text-neutral-500'}`}>
                {isSaved ? '🔖 Saved' : '🔖 Save'}
              </Text>
            </Pressable>
          )}
          {onSave && onApply && (
            <View className="w-px bg-neutral-100 dark:bg-neutral-700" />
          )}
          {onApply && (
            <Pressable
              onPress={onApply}
              className="flex-1 py-3 items-center active:bg-primary-50"
            >
              <Text className="text-sm font-semibold text-primary-600">View Details</Text>
            </Pressable>
          )}
        </View>
      )}
    </Card>
  )
}