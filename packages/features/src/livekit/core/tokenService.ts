import { TokenResponse, RoomOptions } from './types';

declare const window: unknown;

const API_BASE =
  typeof window !== 'undefined'
    ? ''
    : (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
      'http://localhost:8081';

export async function fetchToken(options: RoomOptions): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/api/livekit/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomName: options.roomName,
      participantName: options.participantName,
    }),
  });

  if (!res.ok) {
    throw new Error(`Token fetch failed: ${res.status}`);
  }

  return res.json();
}