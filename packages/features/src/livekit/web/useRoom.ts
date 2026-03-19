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

      // browser handles permissions via getUserMedia automatically
      const { token, url } = await fetchToken(options);

      const newRoom = new Room();
      roomRef.current = newRoom;
      setRoom(newRoom);

      newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        console.log('[LiveKit web] state:', state);
        if (state === ConnectionState.Connected)    setStatus('connected');
        if (state === ConnectionState.Disconnected) setStatus('disconnected');
        if (state === ConnectionState.Reconnecting) setStatus('connecting');
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setStatus('disconnected');
        roomRef.current = null;
        setRoom(null);
      });

      await newRoom.connect(url, token, {
        autoSubscribe: true,
      });

      // enable cam + mic after connect
      await newRoom.localParticipant.enableCameraAndMicrophone();

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[LiveKit web] Connect failed:', msg);
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