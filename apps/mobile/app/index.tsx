import { router } from 'expo-router';
import { Text, View } from 'react-native';

export default function Home() {
  router.reload()
  return (
    <View>
      <Text>Hello World</Text>
    </View>
  );
}