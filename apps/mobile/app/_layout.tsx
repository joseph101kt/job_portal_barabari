import { Stack } from 'expo-router';
import '../global.css';
import { Platform } from 'react-native';

export default function RootLayout() {
  return <Stack />;
}

if (Platform.OS !== 'web') {
  const { registerGlobals } = require('@livekit/react-native');
  registerGlobals();
}