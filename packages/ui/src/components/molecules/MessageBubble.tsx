// packages/ui/src/components/molecules/MessageBubble.tsx
import React from 'react'
import { View, Text } from 'react-native'
import { Avatar } from '../atoms/Avatar'

type Props = {
  content:    string
  isMine:     boolean
  senderName?: string
  avatarUri?: string
  time?:      string
  showAvatar?: boolean
}

export function MessageBubble({
  content, isMine, senderName, avatarUri, time, showAvatar = true,
}: Props) {
  return (
    <View className={`flex-row gap-2 px-4 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMine && showAvatar && (
        <Avatar uri={avatarUri} name={senderName ?? '?'} size="xs" />
      )}
      {!isMine && !showAvatar && <View className="w-7" />}

      <View className={`max-w-[75%] gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
        {senderName && !isMine && showAvatar && (
          <Text className="text-xs font-medium text-neutral-500 px-1">
            {senderName}
          </Text>
        )}
        <View className={[
          'px-4 py-2.5 rounded-2xl',
          isMine
            ? 'bg-primary-500 rounded-tr-sm'
            : 'bg-neutral-100 dark:bg-neutral-700 rounded-tl-sm',
        ].join(' ')}>
          <Text className={`text-sm leading-relaxed ${isMine ? 'text-white' : 'text-neutral-800 dark:text-neutral-100'}`}>
            {content}
          </Text>
        </View>
        {time && (
          <Text className="text-xs text-neutral-400 px-1">{time}</Text>
        )}
      </View>
    </View>
  )
}