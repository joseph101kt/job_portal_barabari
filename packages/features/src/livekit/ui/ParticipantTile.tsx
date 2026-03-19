import { View, Text } from 'react-native';
import { User } from 'lucide-react-native';
import { Icon } from './Icon';

interface Props {
  participant: any;
  isLocal: boolean;
}

export function ParticipantTile({ participant, isLocal }: Props) {
  return (
    <View
      className="rounded-xl overflow-hidden bg-neutral-900 border-2 border-neutral-800 items-center justify-center"
      style={{ width: '48%', aspectRatio: 4 / 3 }}
    >
      <Icon name="user" size={40} color="#4b5563" />
      <Text className="text-neutral-400 text-xs mt-2 font-medium">
        {isLocal ? 'You' : participant.identity}
      </Text>
    </View>
  );
}