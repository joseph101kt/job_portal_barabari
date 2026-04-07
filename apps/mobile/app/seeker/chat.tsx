// apps/mobile/app/seeker/chat.tsx
import { ChatPage } from "@my-app/features";
import { Stack } from "expo-router";

export default function Chat() {
  return (
    <>
    <Stack.Screen options={{ title: 'Chat' }} />
    <ChatPage/>
    </>
    
  );
}