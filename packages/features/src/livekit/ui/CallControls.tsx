import { View, Text, Pressable } from 'react-native';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react-native';
import { Icon } from './Icon';

interface Props {
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onLeave: () => void;
}

export function CallControls({ micOn, camOn, onToggleMic, onToggleCam, onLeave }: Props) {
  return (
    <View className="flex-row justify-center items-center gap-4 py-4 px-6 bg-neutral-900 rounded-2xl mx-4 mb-4">
      <ControlButton onPress={onToggleMic} active={micOn} label={micOn ? 'Mute' : 'Unmute'}>
        <Icon name={micOn ? 'mic' : 'mic-off'} size={22} color={micOn ? '#fff' : '#ef4444'} />
      </ControlButton>

      <ControlButton onPress={onToggleCam} active={camOn} label={camOn ? 'Camera' : 'Off'}>
        <Icon name={camOn ? 'video' : 'video-off'} size={22} color={camOn ? '#fff' : '#ef4444'} />
      </ControlButton>

      <ControlButton onPress={onLeave} active={false} danger label="Leave">
        <Icon name="phone-off" size={22} color="#fff" />
      </ControlButton>
    </View>
  );
}

function ControlButton({
  onPress, active, danger, label, children,
}: {
  onPress: () => void;
  active: boolean;
  danger?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`items-center gap-1.5 py-3 px-4 rounded-xl min-w-[72px] ${
        danger
          ? 'bg-red-600'
          : active
          ? 'bg-neutral-700'
          : 'bg-red-500/20 border border-red-500'
      }`}
    >
      {children}
      <Text className="text-white text-xs font-medium">{label}</Text>
    </Pressable>
  );
}