import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';

export async function requestCallPermissions(): Promise<boolean> {
  const [cameraStatus, audioStatus] = await Promise.all([
    Camera.requestCameraPermissionsAsync(),
    Audio.requestPermissionsAsync(),
  ]);

  const granted =
    cameraStatus.status === 'granted' &&
    audioStatus.status === 'granted';

  if (!granted) {
    console.warn('[LiveKit] Permissions not granted', {
      camera: cameraStatus.status,
      audio: audioStatus.status,
    });
  }

  return granted;
}