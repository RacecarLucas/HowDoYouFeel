import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { MoodType } from '../types';
import { getMoodById } from '../constants/moods';
import { useMoodStore } from '../store/useMoodStore';

const { height } = Dimensions.get('window');

interface FallingPlusOneProps {
  id: string;
  mood: MoodType;
  x: number; // percentage 0-100
}

export function FallingPlusOne({ id, mood, x }: FallingPlusOneProps) {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(1);
  const { removePlusOne } = useMoodStore();
  const moodConfig = getMoodById(mood);

  useEffect(() => {
    translateY.value = withTiming(height + 50, { duration: 2500 });
    opacity.value = withTiming(0, { duration: 2500 }, (finished) => {
      if (finished) {
        runOnJS(removePlusOne)(id);
      }
    });
  }, [translateY, opacity, id, removePlusOne]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { left: `${x}%`, backgroundColor: moodConfig?.color || '#ccc' },
      ]}
    >
      <Animated.Text style={styles.text}>+1</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
