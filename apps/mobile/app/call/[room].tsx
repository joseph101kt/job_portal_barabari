import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { VideoCallScreen } from '@my-app/features'; 

export default function CallRoute() {
  const { room } = useLocalSearchParams<{ room: string }>();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <VideoCallScreen
        serverUrl={process.env.EXPO_PUBLIC_LIVEKIT_URL!}
        tokenApiUrl={process.env.EXPO_PUBLIC_API_URL + '/api/livekit/token'}
        roomName={room ?? 'default-room'}
        onCallEnded={() => router.back()}
      />
    </>
  );
}