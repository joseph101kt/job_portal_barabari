import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { RoomEvent } from 'livekit-client';
import { useRoomWeb as useRoom } from '@my-app/features';
import { CallControls, ParticipantTile } from '@my-app/features/';

const ROOM_NAME = 'test-room';
const PARTICIPANT_NAME = 'user_' + Math.floor(Math.random() * 1000);

export default function CallScreenWeb() {
  const router = useRouter();
  const { status, error, room, connect, disconnect, isConnected, isConnecting } = useRoom();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    connect({ roomName: ROOM_NAME, participantName: PARTICIPANT_NAME });
    return () => { disconnect(); };
  }, []);

  useEffect(() => {
    if (!room) return;
    const update = () => forceUpdate(n => n + 1);
    room.on(RoomEvent.ParticipantConnected, update);
    room.on(RoomEvent.ParticipantDisconnected, update);
    room.on(RoomEvent.TrackSubscribed, update);
    room.on(RoomEvent.TrackUnsubscribed, update);
    return () => {
      room.off(RoomEvent.ParticipantConnected, update);
      room.off(RoomEvent.ParticipantDisconnected, update);
      room.off(RoomEvent.TrackSubscribed, update);
      room.off(RoomEvent.TrackUnsubscribed, update);
    };
  }, [room]);

  async function toggleMic() {
    if (!room) return;
    const next = !micOn;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
  }

  async function toggleCam() {
    if (!room) return;
    const next = !camOn;
    await room.localParticipant.setCameraEnabled(next);
    setCamOn(next);
  }

  function handleLeave() {
    disconnect();
    // GO_BACK fix — check if there's a screen to go back to
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  const participants = room
    ? [room.localParticipant, ...Array.from(room.remoteParticipants.values())]
    : [];

  return (
    <View className="flex-1 bg-black">

      {/* Video grid */}
      <View className="flex-1 flex-row flex-wrap gap-2 p-3 content-start">
        {participants.map((p: any) => (
          <ParticipantTile key={p.identity} participant={p} isLocal={p.isLocal} />
        ))}
        {participants.length === 0 && isConnected && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-neutral-500">Waiting for others...</Text>
          </View>
        )}
      </View>

      {/* Status */}
      <View className="items-center py-2">
        <Text className="text-neutral-600 text-xs">{ROOM_NAME} · {PARTICIPANT_NAME}</Text>
        <View className="flex-row items-center gap-2 mt-1">
          {isConnecting && <ActivityIndicator size="small" color="#3b82f6" />}
          <Text className={`text-xs font-bold tracking-widest uppercase ${
            isConnected ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-neutral-500'
          }`}>{status}</Text>
        </View>
        {error && <Text className="text-red-400 text-xs mt-1">{error}</Text>}
      </View>

      {/* Controls */}
      <CallControls
        micOn={micOn}
        camOn={camOn}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onLeave={handleLeave}
      />

    </View>
  );
}