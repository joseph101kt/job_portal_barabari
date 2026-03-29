// packages/ui/src/components/organisms/ProfileHeader.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'

type Props = {
  name:         string
  avatarUri?:   string
  headline?:    string
  location?:    string
  availability?: string
  isOwn?:       boolean
  onEdit?:      () => void
  onMessage?:   () => void
  onInterview?: () => void
  children?:    React.ReactNode  // for extra stats/badges
}

const availabilityLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' | 'error' }> = {
  immediately: { label: 'Available now',    variant: 'success' },
  '2weeks':    { label: 'Available in 2w',  variant: 'warning' },
  '1month':    { label: 'Available in 1mo', variant: 'warning' },
  not_looking: { label: 'Not looking',      variant: 'neutral' },
}

export function ProfileHeader({
  name, avatarUri, headline, location, availability,
  isOwn, onEdit, onMessage, onInterview, children,
}: Props) {
  const avail = availability ? availabilityLabels[availability] : null

  return (
    <View className="bg-white dark:bg-neutral-900 px-5 pt-6 pb-4 gap-4">
      {/* Avatar + info */}
      <View className="flex-row gap-4 items-start">
        <Avatar uri={avatarUri} name={name} size="xl" />

        <View className="flex-1 gap-1.5 pt-1">
          <Text className="text-xl font-bold text-neutral-900 dark:text-white">
            {name}
          </Text>
          {headline && (
            <Text className="text-sm text-neutral-500 leading-snug" numberOfLines={2}>
              {headline}
            </Text>
          )}
          {location && (
            <Text className="text-xs text-neutral-400">📍 {location}</Text>
          )}
        </View>
      </View>

      {/* Availability + custom children */}
      <View className="flex-row flex-wrap gap-2 items-center">
        {avail && (
          <Badge label={avail.label} variant={avail.variant} dot />
        )}
        {children}
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-2">
        {isOwn && onEdit && (
          <Button label="Edit profile" variant="outline" size="sm" onPress={onEdit} />
        )}
        {!isOwn && onMessage && (
          <Button label="Message" variant="secondary" size="sm" onPress={onMessage} />
        )}
        {!isOwn && onInterview && (
          <Button label="Schedule interview" variant="primary" size="sm" onPress={onInterview} />
        )}
      </View>
    </View>
  )
}