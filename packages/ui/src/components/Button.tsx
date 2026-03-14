import { Pressable, Text } from 'react-native';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
};

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl px-6 py-3 items-center ${
        variant === 'primary' ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <Text
        className={`font-semibold text-base ${
          variant === 'primary' ? 'text-white' : 'text-gray-800'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}