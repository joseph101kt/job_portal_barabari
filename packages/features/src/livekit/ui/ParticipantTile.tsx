import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { Track } from 'livekit-client';
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

  // ✅ LOCAL VIDEO (PURE getUserMedia — NO LIVEKIT)
  useEffect(() => {
    if (!isLocal) return;

    let stream: MediaStream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        console.log('🎥 local preview started');
      } catch (err) {
        console.error('❌ camera error:', err);
      }
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [isLocal]);

  // ✅ REMOTE PARTICIPANTS (LIVEKIT ONLY)
  useEffect(() => {
    if (isLocal) return;

    const attach = () => {
      const videoPub = participant.getTrackPublication(Track.Source.Camera);
      const audioPub = participant.getTrackPublication(Track.Source.Microphone);

      if (videoPub?.track && videoRef.current) {
        videoPub.track.attach(videoRef.current);
      }

      if (audioPub?.track && audioRef.current) {
        audioPub.track.attach(audioRef.current);
      }

      setIsMuted(audioPub?.isMuted ?? false);
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

  // 🎧 speaking indicator
  useEffect(() => {
    const interval = setInterval(() => {
      const level = participant.audioLevel ?? 0;
      setIsSpeaking(level > 0.05);
    }, 200);

    return () => clearInterval(interval);
  }, [participant]);

  return (
    <View
      className={`rounded-xl overflow-hidden bg-neutral-900 border-2 ${
        isSpeaking ? 'border-green-400' : 'border-neutral-800'
      }`}
      style={{ width: '48%', aspectRatio: 4 / 3 }}
    >
      {/* 🎥 VIDEO */}
      {/* @ts-ignore */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* 🔊 AUDIO (remote only) */}
      {/* @ts-ignore */}
      {!isLocal && (
        <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
      )}

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center px-2 py-1.5 bg-black/60">
        <Text className="text-white text-xs font-semibold">
          {isLocal ? 'You' : participant.identity}
        </Text>

        {isMuted ? (
          <Icon name="mic-off" size={14} color="#ef4444" />
        ) : isSpeaking ? (
          <Icon name="volume" size={14} color="#4ade80" />
        ) : (
          <Icon name="mic" size={14} color="#9ca3af" />
        )}
      </View>
    </View>
  );
}