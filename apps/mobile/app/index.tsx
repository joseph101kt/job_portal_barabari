import { View } from 'react-native';
import { Button, Text } from '@my-app/ui';
import { useCounter } from '@my-app/features';

export default function HomeScreen() {
  const { count, increment, decrement } = useCounter();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white">
      <Text className="text-2xl font-bold">Count: {count}</Text>
      <Button label="Increment" onPress={increment} />
      <Button label="Decrement" onPress={decrement} variant="secondary" />
    </View>
  );
}