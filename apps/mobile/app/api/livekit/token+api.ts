/**
 * POST /api/livekit/token
 *
 * Generates a LiveKit JWT for the requested room + participant.
 * Runs server-side only — LIVEKIT_API_KEY and LIVEKIT_API_SECRET
 * are never exposed to the client.
 *
 * ─── Required environment variables ─────────────────────────────────
 * LIVEKIT_API_KEY      Your LiveKit Cloud project API key
 * LIVEKIT_API_SECRET   Your LiveKit Cloud project API secret
 * LIVEKIT_URL          wss://your-project.livekit.cloud (optional here,
 *                      used by the client via EXPO_PUBLIC_LIVEKIT_URL)
 *
 * ─── Request body ───────────────────────────────────────────────────
 * { "roomName": "my-room", "participantName": "User_ABC" }
 *
 * ─── Response ───────────────────────────────────────────────────────
 * { "token": "<jwt>" }
 */

import { AccessToken } from 'livekit-server-sdk';

export async function POST(request: Request) {
  // ── Validate env ────────────────────────────────────────────────────

  const apiKey    = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return Response.json(
      { error: 'LiveKit credentials not configured on server' },
      { status: 500 },
    );
  }

  // ── Parse body ──────────────────────────────────────────────────────

  let body: { roomName?: string; participantName?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { roomName, participantName } = body;

  if (!roomName || !participantName) {
    return Response.json(
      { error: 'roomName and participantName are required' },
      { status: 400 },
    );
  }

  // ── Generate token ──────────────────────────────────────────────────

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    // Token expires after 2 hours — enough for a typical call
    ttl: '2h',
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    // Publish cam + mic
    canPublish: true,
    // Subscribe to others
    canSubscribe: true,
    // Allow camera/mic toggle at runtime
  canPublishSources: ['camera', 'microphone'] as any,  });

  const jwt = await token.toJwt();

  return Response.json({ token: jwt });
}