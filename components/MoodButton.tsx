import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MoodType } from '../types';
import { getMoodById } from '../constants/moods';

interface MoodButtonProps {
  mood: MoodType;
  onPress: () => void;
  size?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MoodButton({ mood, onPress, size = 160 }: MoodButtonProps) {
  const scale = useSharedValue(1);
  const moodConfig = getMoodById(mood);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { stiffness: 400, damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 400, damping: 15 });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[
        styles.button,
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: moodConfig?.color || '#ccc',
        },
      ]}
    >
      <Animated.Text style={[styles.emoji, { fontSize: size * 0.4 }]}>
        {moodConfig?.emoji}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  emoji: {
    textAlign: 'center',
  },
});
