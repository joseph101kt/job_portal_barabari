import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Card } from './Card'
import { Badge } from '../atoms/Badge'

type Status = 'applied' | 'shortlisted' | 'rejected' | 'hired'

type Props = {
  title: string
  company?: string
  location?: string
  isRemote?: boolean
  salaryMin?: number | null
  salaryMax?: number | null
  employmentType?: string | null
  appliedAt?: string
  status: Status
  onPress?: () => void
}

const statusConfig: Record<
  Status,
  { label: string; style: string }
> = {
  applied: {
    label: 'Applied',
    style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  shortlisted: {
    label: 'Shortlisted',
    style: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  rejected: {
    label: 'Rejected',
    style: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  hired: {
    label: 'Hired',
    style: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
}

export function ApplicationCard({
  title,
  company,
  location,
  isRemote,
  salaryMin,
  salaryMax,
  employmentType,
  appliedAt,
  status,
  onPress,
}: Props) {
  const config = statusConfig[status]

  return (
    <Card elevation="raised" noPad>
      <Pressable
        onPress={onPress}
        className="p-4 gap-3 active:bg-neutral-50 dark:active:bg-neutral-800"
      >
        {/* Title */}
        <Text className="text-base font-semibold text-neutral-900 dark:text-white">
          {title}
        </Text>

        {/* Company */}
        {company && (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {company}
          </Text>
        )}

        {/* Meta */}
        <View className="flex-row flex-wrap gap-2 mt-1">
          {employmentType && (
            <Badge label={employmentType.replace('_', '-')} />
          )}

          {isRemote && <Badge label="Remote" variant="success" />}

          {location && !isRemote && (
            <Text className="text-xs text-neutral-400">📍 {location}</Text>
          )}
        </View>

        {/* Salary */}
        {(salaryMin || salaryMax) && (
          <Text className="text-sm text-green-600 dark:text-green-400">
            ₹{salaryMin ? `${Math.round(salaryMin / 1000)}k` : ''}
            {salaryMin && salaryMax ? ' - ' : ''}
            {salaryMax ? `${Math.round(salaryMax / 1000)}k` : ''}
          </Text>
        )}

        {/* Footer */}
        <View className="flex-row justify-between items-center mt-2">
          <View className={`px-3 py-1 rounded-full ${config.style}`}>
            <Text className="text-xs font-medium">{config.label}</Text>
          </View>

          {appliedAt && (
            <Text className="text-xs text-neutral-400">
              {appliedAt}
            </Text>
          )}
        </View>
      </Pressable>
    </Card>
  )
}