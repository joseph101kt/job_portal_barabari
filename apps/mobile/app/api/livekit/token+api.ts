import { AccessToken } from 'livekit-server-sdk';

export async function POST(request: Request) {
  const { roomName, participantName } = await request.json();

  if (!roomName || !participantName) {
    return Response.json(
      { error: 'roomName and participantName are required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt(); // v2 — must await

  return Response.json({ token, url: livekitUrl });
}