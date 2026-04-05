'use client'

import { View, Text, Pressable, ScrollView } from 'react-native'

type ChatItem = {
  id: string
  title: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
}

type Props = {
  activeChats: ChatItem[]
  inactiveChats: ChatItem[]
  selectedId: string | null
  onSelect: (id: string, isInactive?: boolean) => void
  loading?: boolean

  // ✅ NEW PROP
  isPoster: boolean
}

function formatTime(ts?: string) {
  if (!ts) return ''

  const date = new Date(ts)
  const now = new Date()

  const diff = (now.getTime() - date.getTime()) / 1000

  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`

  return date.toLocaleDateString()
}

export function Sidebar({
  activeChats,
  inactiveChats,
  selectedId,
  onSelect,
  loading,
  isPoster, // ✅ receive it
}: Props) {

  // ✅ DO NOT mutate props — create sorted copy
  const sortedActiveChats = [...activeChats].sort((a, b) =>
    (b.lastMessageAt || '').localeCompare(a.lastMessageAt || '')
  )

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">

      {/* HEADER */}
      <View className="h-14 px-4 justify-center border-b border-neutral-200 dark:border-neutral-800">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
          Chats
        </Text>
      </View>

      <ScrollView className="flex-1">

        {/* LOADING */}
        {loading && (
          <View className="p-4">
            <Text className="text-neutral-500">Loading chats...</Text>
          </View>
        )}

        {/* ================= ACTIVE CHATS ================= */}
        {!loading && (
          <>
            <Text className="px-4 pt-4 pb-2 text-xs text-neutral-400 uppercase">
              Active Chats
            </Text>

            {sortedActiveChats.length === 0 ? (
              <View className="px-4 pb-2">
                <Text className="text-xs text-neutral-400">
                  No active chats
                </Text>
              </View>
            ) : (
              sortedActiveChats.map((chat) => {
                const active = selectedId === chat.id

                return (
                  <Pressable
                    key={chat.id}
                    onPress={() => onSelect(chat.id)}
                    className={`px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 ${
                      active ? 'bg-neutral-200 dark:bg-neutral-800' : ''
                    }`}
                  >
                    {/* TOP ROW */}
                    <View className="flex-row justify-between items-center">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-semibold text-neutral-900 dark:text-white"
                      >
                        {chat.title}
                      </Text>

                      {chat.lastMessageAt && (
                        <Text className="text-xs text-neutral-400">
                          {formatTime(chat.lastMessageAt)}
                        </Text>
                      )}
                    </View>

                    {/* MESSAGE PREVIEW */}
                    <View className="flex-row justify-between items-center mt-1">
                      <Text
                        numberOfLines={1}
                        className="text-xs text-neutral-500 flex-1"
                      >
                        {chat.lastMessage || 'No messages yet'}
                      </Text>

                      {!!chat.unreadCount && chat.unreadCount > 0 && (
                        <View className="ml-2 px-2 py-0.5 rounded-full bg-blue-500">
                          <Text className="text-[10px] text-white font-semibold">
                            {chat.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                )
              })
            )}
          </>
        )}

        {/* ================= START CHAT ================= */}
        {!loading && isPoster && (
          <>
            <Text className="px-4 pt-6 pb-2 text-xs text-neutral-400 uppercase">
              Start a chat
            </Text>

            {inactiveChats.length === 0 ? (
              <View className="px-4 pb-2">
                <Text className="text-xs text-neutral-400">
                  No available applications
                </Text>
              </View>
            ) : (
              inactiveChats.map((chat) => (
                <Pressable
                  key={chat.id}
                  onPress={() => onSelect(chat.id, true)}
                  className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800"
                >
                  <Text
                    numberOfLines={1}
                    className="text-sm font-semibold text-neutral-900 dark:text-white"
                  >
                    {chat.title}
                  </Text>

                  <Text className="text-xs text-neutral-500 mt-1">
                    Tap to start chat
                  </Text>
                </Pressable>
              ))
            )}
          </>
        )}

      </ScrollView>
    </View>
  )
}