import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export function useSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playClick = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://www.soundjay.com/buttons/sounds/button-09a.mp3' },
          { shouldPlay: true, volume: 0.5 }
        );
        soundRef.current = sound;
      }
    } catch (error) {
      console.log('Sound play failed', error);
    }
  }, []);

  return { playClick };
}
