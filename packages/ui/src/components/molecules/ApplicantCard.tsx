// packages/ui/src/components/molecules/ApplicantCard.tsx

import React, { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Card } from './Card'
import { Avatar } from '../atoms/Avatar'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'

type Status = 'applied' | 'shortlisted' | 'rejected' | 'hired'

type Skill = {
  name: string
}

type Props = {
  name: string
  avatarUri?: string
  headline?: string
  location?: string
  appliedAt?: string
  status: Status

  skills?: Skill[]
  experienceLevel?: string

  experiences?: {
    title: string
    company?: string
  }[]

  education?: {
    degree: string
    institution?: string
  }[]

  onView?: () => void
  onShortlist?: () => void
  onReject?: () => void
  onHire?: () => void
}

const statusLabel: Record<Status, string> = {
  applied: 'Applied',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
}

export function ApplicantCard({
  name,
  avatarUri,
  headline,
  location,
  appliedAt,
  status,
  skills,
  experienceLevel,
  experiences,
  education,
  onView,
  onShortlist,
  onReject,
  onHire,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  function handleToggle() {
    setExpanded(prev => !prev)
  }

  return (
    <Card elevation="raised" noPad>
      {/* MAIN CLICK AREA */}
      <Pressable
        onPress={handleToggle}
        className="p-4 active:bg-neutral-50 dark:active:bg-neutral-700"
      >
        <View className="flex-row items-start gap-3">
          <Avatar uri={avatarUri} name={name} size="md" />

          <View className="flex-1 gap-1">
            {/* Name + Status */}
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                {name}
              </Text>
              <Badge label={statusLabel[status]} variant={status} size="sm" />
            </View>

            {/* Headline */}
            {headline && (
              <Text
                className="text-sm text-neutral-500 dark:text-neutral-400"
                numberOfLines={1}
              >
                {headline}
              </Text>
            )}

            {/* Skills Preview */}
            {skills && skills.length > 0 && (
              <View className="flex-row flex-wrap gap-1 mt-1">
                {skills.slice(0, 3).map((s, i) => (
                  <View
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700"
                  >
                    <Text className="text-[10px] text-neutral-600 dark:text-neutral-300">
                      {s.name}
                    </Text>
                  </View>
                ))}

                {skills.length > 3 && (
                  <Text className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    +{skills.length - 3}
                  </Text>
                )}
              </View>
            )}

            {/* Experience */}
            {experienceLevel && (
              <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                {experienceLevel}
              </Text>
            )}

            {/* Location + Date */}
            <View className="flex-row gap-3">
              {location && (
                <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                  📍 {location}
                </Text>
              )}
              {appliedAt && (
                <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                  Applied {appliedAt}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>

      {/* 🔥 EXPANDED SECTION */}
{/* 🔥 EXPANDED SECTION */}
{expanded && (
  <View className="px-4 pb-4 border-t border-neutral-200 dark:border-neutral-800">

    {/* ALL SKILLS (no new heading, just expanded) */}
    {skills && skills.length > 3 && (
      <View className="flex-row flex-wrap gap-1 mt-3">
        {skills.slice(3).map((s, i) => (
          <View
            key={i}
            className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700"
          >
            <Text className="text-[10px] text-neutral-600 dark:text-neutral-300">
              {s.name}
            </Text>
          </View>
        ))}
      </View>
    )}

    {/* EXPERIENCE */}
    {experiences && experiences.length > 0 && (
      <View className="mt-4">
        <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
          Experience
        </Text>

        {experiences.slice(0, 2).map((exp, i) => (
          <View key={i} className="mb-2">
            <Text className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              {exp.title}
            </Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {exp.company}
            </Text>
          </View>
        ))}
      </View>
    )}

    {/* EDUCATION */}
    {education && education.length > 0 && (
      <View className="mt-4">
        <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
          Education
        </Text>

        {education.slice(0, 1).map((edu, i) => (
          <View key={i}>
            <Text className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              {edu.degree}
            </Text>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {edu.institution}
            </Text>
          </View>
        ))}
      </View>
    )}
  </View>
)}

      {/* ACTIONS */}
      {(onShortlist || onReject || onHire) && status === 'applied' && (
        <View className="flex-row gap-2 px-4 pb-3">
          {onShortlist && (
            <Button
              label="Shortlist"
              variant="secondary"
              size="sm"
              onPress={onShortlist}
            />
          )}
          {onReject && (
            <Button
              label="Reject"
              variant="danger"
              size="sm"
              onPress={onReject}
            />
          )}
          {onHire && (
            <Button
              label="Hire"
              variant="success"
              size="sm"
              onPress={onHire}
            />
          )}
        </View>
      )}
    </Card>
  )
}