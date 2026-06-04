import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const light = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available
    }
  }, []);

  const medium = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not available
    }
  }, []);

  const heavy = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Haptics not available
    }
  }, []);

  return { light, medium, heavy };
}
