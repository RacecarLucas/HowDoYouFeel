import React, { useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, Animated } from 'react-native';
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
  const translateY = useRef(new Animated.Value(-50)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const { removePlusOne } = useMoodStore();
  const moodConfig = getMoodById(mood);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height + 50,
        duration: 2500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      removePlusOne(id);
    });

    return () => {
      translateY.stopAnimation();
      opacity.stopAnimation();
    };
  }, [translateY, opacity, id, removePlusOne]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: `${x}%`,
          backgroundColor: moodConfig?.color || '#ccc',
          transform: [{ translateY }],
          opacity,
        },
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
