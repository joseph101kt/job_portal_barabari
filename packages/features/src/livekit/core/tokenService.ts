//pakages/features/livekit/tokenService.ts
import { TokenResponse, RoomOptions } from './types';

const API_URL =
  "https://wmgdsspjzonfxwurupxt.supabase.co/functions/v1/livekit-token";

export async function fetchToken(options: RoomOptions): Promise<TokenResponse> {
   console.log("🔥 TOKEN FETCH URL:", API_URL);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZ2Rzc3Bqem9uZnh3dXJ1cHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTM4NDMsImV4cCI6MjA4OTk4OTg0M30.WJUThhscW_K7KXzHffE1ZGLNlJxWdeEE0deLYLN-LKE',
    },
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