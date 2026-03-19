export function getLiveKitUrl(): string {
  // Works in Expo (EXPO_PUBLIC_*) and Next.js (NEXT_PUBLIC_*)
  return (
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_LIVEKIT_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_LIVEKIT_URL) ||
    ''
  );
}