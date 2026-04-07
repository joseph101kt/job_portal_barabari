// apps/mobile/app/poster/chat.tsx
import { CallScreen } from "@my-app/features";
import { Stack } from "expo-router";

export default function Chat() {
  return (
    <>
      <Stack.Screen options={{ title: 'Create-Job' }} />
      <CallScreen/>
    </>
  );
}