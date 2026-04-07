import { useState, useCallback, useRef } from 'react';
import { Room, RoomEvent, ConnectionState } from 'livekit-client';
import { fetchToken } from '../core/tokenService';
import type { ConnectionStatus, RoomOptions } from '../core/types';

export function useRoom() {
  const roomRef = useRef<Room | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

const connect = useCallback(async (options: RoomOptions) => {
  try {
    setStatus('connecting');
    setError(null);

    const { token, url } = await fetchToken(options);

    const newRoom = new Room();

    // ❗ DO NOT set room yet
    roomRef.current = newRoom;

    newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      console.log('[LiveKit] state:', state);

      if (state === ConnectionState.Connected) {
        console.log('✅ CONNECTED');

        // ✅ NOW it's safe
        setRoom(newRoom);
        setStatus('connected');

        // ✅ NOW localParticipant exists
        newRoom.localParticipant.setCameraEnabled(true);
        newRoom.localParticipant.setMicrophoneEnabled(true);

        console.log(
          '🎥 local video publications:',
          newRoom.localParticipant.videoTrackPublications.size
        );
      }

      if (state === ConnectionState.Disconnected) {
        setStatus('disconnected');
        setRoom(null);
        roomRef.current = null;
      }
    });

    await newRoom.connect(url, token, {
      autoSubscribe: true,
    });

    await newRoom.startAudio();

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[LiveKit] Connect failed:', msg);
    setError(msg);
    setStatus('error');
  }
}, []);
  const disconnect = useCallback(async () => {
    await roomRef.current?.disconnect();
    roomRef.current = null;
    setRoom(null);
    setStatus('disconnected');
  }, []);

  return {
    room,
    status,
    error,
    connect,
    disconnect,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
  };
}