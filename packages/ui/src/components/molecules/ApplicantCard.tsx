// packages/ui/src/components/molecules/ApplicantCard.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Card } from './Card'
import { Avatar } from '../atoms/Avatar'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'

type Status = 'applied' | 'shortlisted' | 'rejected' | 'hired'

type Props = {
  name:          string
  avatarUri?:    string
  headline?:     string
  location?:     string
  appliedAt?:    string
  status:        Status
  onView?:       () => void
  onShortlist?:  () => void
  onReject?:     () => void
  onHire?:       () => void
}

const statusLabel: Record<Status, string> = {
  applied:     'Applied',
  shortlisted: 'Shortlisted',
  rejected:    'Rejected',
  hired:       'Hired',
}

export function ApplicantCard({
  name, avatarUri, headline, location, appliedAt,
  status, onView, onShortlist, onReject, onHire,
}: Props) {
  return (
    <Card elevation="raised" noPad>
      <Pressable onPress={onView} className="p-4 active:bg-neutral-50 dark:active:bg-neutral-700">
        <View className="flex-row items-start gap-3">
          <Avatar uri={avatarUri} name={name} size="md" />

          <View className="flex-1 gap-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                {name}
              </Text>
              <Badge label={statusLabel[status]} variant={status} size="sm" />
            </View>

            {headline && (
              <Text className="text-sm text-neutral-500" numberOfLines={1}>
                {headline}
              </Text>
            )}

            <View className="flex-row gap-3">
              {location && (
                <Text className="text-xs text-neutral-400">📍 {location}</Text>
              )}
              {appliedAt && (
                <Text className="text-xs text-neutral-400">Applied {appliedAt}</Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>

      {/* Actions */}
      {(onShortlist || onReject || onHire) && status === 'applied' && (
        <View className="flex-row gap-2 px-4 pb-3">
          {onShortlist && (
            <Button label="Shortlist" variant="secondary" size="sm" onPress={onShortlist} />
          )}
          {onReject && (
            <Button label="Reject" variant="danger" size="sm" onPress={onReject} />
          )}
          {onHire && (
            <Button label="Hire" variant="success" size="sm" onPress={onHire} />
          )}
        </View>
      )}
    </Card>
  )
}