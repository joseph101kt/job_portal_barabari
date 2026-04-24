import { router } from 'expo-router';
import { Text, View } from 'react-native';

export default function Home() {
  router.replace('/')
  return (
    <View>
      <Text>Hello World</Text>
    </View>
  );
}