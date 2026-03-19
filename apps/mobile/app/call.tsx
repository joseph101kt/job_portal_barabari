import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoom } from '@my-app/features';
import { Button, colors, typography, spacing } from '@my-app/ui';


const ROOM_NAME = 'test-room';
const PARTICIPANT_NAME = 'user_' + Math.floor(Math.random() * 1000);

export default function CallScreen() {
  const router = useRouter();
  const { status, error, connect, disconnect, isConnected, isConnecting } = useRoom();

  // auto-connect on mount
  useEffect(() => {
    connect({ roomName: ROOM_NAME, participantName: PARTICIPANT_NAME });
    return () => { disconnect(); };
  }, []);

  async function handleLeave() {
    await disconnect();
    router.back();
  }

  return (
    <View style={styles.container}>

      {/* Status */}
      <View style={styles.statusBox}>
        <Text style={styles.roomName}>Room: {ROOM_NAME}</Text>
        <Text style={styles.participant}>You: {PARTICIPANT_NAME}</Text>

        <View style={styles.statusRow}>
          {isConnecting && <ActivityIndicator color={colors.primary} />}
          <Text style={[
            styles.statusText,
            isConnected && styles.statusConnected,
            status === 'error' && styles.statusError,
          ]}>
            {status.toUpperCase()}
          </Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!isConnected && !isConnecting && (
          <Button
            label="Retry"
            variant="primary"
            onPress={() => connect({ roomName: ROOM_NAME, participantName: PARTICIPANT_NAME })}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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