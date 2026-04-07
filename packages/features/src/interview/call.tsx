// packages/features/src/interview/call.tsx
'use client'

import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { getSupabase, endInterview } from '@my-app/supabase'
import { useRoom } from '../index.native'
import { Button, colors, spacing, typography } from '../../../ui/src'

export function CallScreen() {
  const router = useRouter()
  const { applicationId } = useLocalSearchParams()

  const { status, error, connect, disconnect, isConnected, isConnecting } = useRoom()

  const [userId, setUserId] = useState<string | null>(null)

  // ✅ GET USER
  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  // ✅ CONNECT WITH REAL DATA
  useEffect(() => {
    if (!applicationId || !userId) return

    console.log('🚀 Mobile connect:', applicationId)

    connect({
      roomName: applicationId as string,
      participantName: userId,
    })

    return () => {
      disconnect()
    }
  }, [applicationId, userId])

  // 🚪 LEAVE
  async function handleLeave() {
    try {
      await disconnect()

      await endInterview(applicationId as string)

      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <View style={styles.container}>

      {/* STATUS */}
      <View style={styles.statusBox}>
        <Text style={styles.roomName}>
          Room: {applicationId}
        </Text>

        <Text style={styles.participant}>
          You: {userId}
        </Text>

        <View style={styles.statusRow}>
          {isConnecting && <ActivityIndicator color={colors.primary} />}

          <Text
            style={[
              styles.statusText,
              isConnected && styles.statusConnected,
              status === 'error' && styles.statusError,
            ]}
          >
            {status.toUpperCase()}
          </Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        {!isConnected && !isConnecting && (
          <Button
            label="Retry"
            variant="primary"
            onPress={() =>
              connect({
                roomName: applicationId as string,
                participantName: userId!,
              })
            }
            fullWidth
          />
        )}

        <Button
          label="Leave Call"
          variant="danger"
          onPress={handleLeave}
          fullWidth
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  statusBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  roomName: {
    ...typography.styles.h3,
    color: colors.text,
  },
  participant: {
    ...typography.styles.body,
    color: colors.muted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusText: {
    ...typography.styles.label,
    color: colors.muted,
    letterSpacing: 1,
  },
  statusConnected: {
    color: colors.success,
  },
  statusError: {
    color: colors.error,
  },
  errorText: {
    ...typography.styles.bodySmall,
    color: colors.error,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
});