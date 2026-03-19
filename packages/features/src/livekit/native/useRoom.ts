import { useState, useCallback, useRef } from 'react';
import { Room, RoomEvent, ConnectionState } from 'livekit-client';
import { AudioSession } from '@livekit/react-native';
import { fetchToken } from '../core/tokenService';
import { requestCallPermissions } from './permissions';
import type { ConnectionStatus, RoomOptions } from '../core/types';

export function useRoom() {
  const roomRef = useRef<Room | null>(null);
  const [room, setRoom] = useState<Room | null>(null); // ← state for render
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (options: RoomOptions) => {
    try {
      setStatus('connecting');
      setError(null);

      const granted = await requestCallPermissions();
      if (!granted) {
        setError('Camera and microphone permissions are required');
        setStatus('error');
        return;
      }

      const { token, url } = await fetchToken(options);
      await AudioSession.startAudioSession();

      const newRoom = new Room();
      roomRef.current = newRoom;
      setRoom(newRoom); // ← update state so UI can react

      newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log('[LiveKit] state:', state);
        if (state === ConnectionState.Connected)    setStatus('connected');
        if (state === ConnectionState.Disconnected) setStatus('disconnected');
        if (state === ConnectionState.Reconnecting) setStatus('connecting');
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setStatus('disconnected');
        roomRef.current = null;
        setRoom(null);
        AudioSession.stopAudioSession();
      });

      await newRoom.connect(url, token);

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
    await AudioSession.stopAudioSession();
    setStatus('disconnected');
  }, []);

  return {
    room,   // ← from state, safe to read during render
    status,
    error,
    connect,
    disconnect,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
  };
}