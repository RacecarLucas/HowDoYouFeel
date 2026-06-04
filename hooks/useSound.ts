import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

export function useSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://www.soundjay.com/buttons/sounds/button-09a.mp3' },
          { shouldPlay: false, volume: 0.5, isLooping: false }
        );
        if (isMounted) {
          soundRef.current = sound;
        }
      } catch (error) {
        console.log('Sound preload failed', error);
      }
    };
    
    loadSound();
    
    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playClick = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.log('Sound play failed', error);
    }
  }, []);

  return { playClick };
}
