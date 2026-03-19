import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { Track } from 'livekit-client';
import { MicOff, Volume2, Mic } from 'lucide-react-native';
import { Icon } from './Icon';

interface Props {
  participant: any;
  isLocal: boolean;
}

export function ParticipantTile({ participant, isLocal }: Props) {
  const videoRef = useRef<any>(null);
  const audioRef = useRef<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
  const attach = () => {
    const videoPub = participant.getTrackPublication(Track.Source.Camera);
    if (videoPub?.track && videoRef.current) {
      videoPub.track.attach(videoRef.current);
    }
    if (!isLocal) {
      const audioPub = participant.getTrackPublication(Track.Source.Microphone);
      if (audioPub?.track && audioRef.current) {
        audioPub.track.attach(audioRef.current);
      }
    }
    const micPub = participant.getTrackPublication(Track.Source.Microphone);
    setIsMuted(micPub?.isMuted ?? false);
  };

  // small delay so track is fully ready before attaching
  const timer = setTimeout(attach, 100);

  participant.on('trackSubscribed', attach);
  participant.on('trackPublished', attach);
  participant.on('trackMuted', attach);
  participant.on('trackUnmuted', attach);
  participant.on('localTrackPublished', attach); // ← add this

  return () => {
    clearTimeout(timer);
    participant.off('trackSubscribed', attach);
    participant.off('trackPublished', attach);
    participant.off('trackMuted', attach);
    participant.off('trackUnmuted', attach);
    participant.off('localTrackPublished', attach);
  };
}, [participant, isLocal]);

  useEffect(() => {
    const attach = () => {
      const videoPub = participant.getTrackPublication(Track.Source.Camera);
      if (videoPub?.track && videoRef.current) {
        videoPub.track.attach(videoRef.current);
      }
      if (!isLocal) {
        const audioPub = participant.getTrackPublication(Track.Source.Microphone);
        if (audioPub?.track && audioRef.current) {
          audioPub.track.attach(audioRef.current);
        }
      }
      const micPub = participant.getTrackPublication(Track.Source.Microphone);
      setIsMuted(micPub?.isMuted ?? false);
    };

    attach();
    participant.on('trackSubscribed', attach);
    participant.on('trackPublished', attach);
    participant.on('trackMuted', attach);
    participant.on('trackUnmuted', attach);

    return () => {
      participant.off('trackSubscribed', attach);
      participant.off('trackPublished', attach);
      participant.off('trackMuted', attach);
      participant.off('trackUnmuted', attach);
    };
  }, [participant, isLocal]);

  useEffect(() => {
    const interval = setInterval(() => {
      const level = participant.audioLevel ?? 0;
      setAudioLevel(level);
      setIsSpeaking(level > 0.05);
    }, 200);
    return () => clearInterval(interval);
  }, [participant]);

  const barWidth = Math.min(audioLevel * 300, 100);

  return (
    <View
      className={`rounded-xl overflow-hidden bg-neutral-900 border-2 ${
        isSpeaking ? 'border-green-400' : 'border-neutral-800'
      }`}
      style={{ width: '48%', aspectRatio: 4 / 3 }}
    >
      {/* Video */}
      {/* @ts-ignore */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Remote audio */}
      {/* @ts-ignore */}
      {!isLocal && <audio ref={audioRef} autoPlay style={{ display: 'none' }} />}

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center px-2 py-1.5 bg-black/60">
        <Text className="text-white text-xs font-semibold" numberOfLines={1}>
          {isLocal ? 'You' : participant.identity}
        </Text>
            {isMuted
            ? <Icon name="mic-off" size={14} color="#ef4444" />
            : isSpeaking
            ? <Icon name="volume" size={14} color="#4ade80" />
            : <Icon name="mic" size={14} color="#9ca3af" />}
      </View>

      {/* Audio level bar */}
      <View className="absolute bottom-8 left-1.5 right-1.5 h-0.5 bg-white/10 rounded-full">
        <View
          className="h-full bg-green-400 rounded-full"
          style={{ width: `${barWidth}%` }}
        />
      </View>
    </View>
  );
}