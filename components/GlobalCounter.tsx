import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMoodStore } from '../store/useMoodStore';
import { getMoodById } from '../constants/moods';
import { fontFamily } from '../constants/fonts';

export function GlobalCounter() {
  const { selectedMood, globalMoods } = useMoodStore();

  if (!selectedMood) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>Select a mood to see the world</Text>
      </View>
    );
  }

  const moodConfig = getMoodById(selectedMood);
  const count = globalMoods[selectedMood]?.count || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{moodConfig?.emoji}</Text>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.label}>people feel {moodConfig?.label.toLowerCase()} right now</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  count: {
    fontSize: 36,
    fontFamily: fontFamily.bold,
    color: '#2D2D2D',
  },
  label: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: '#6B6B6B',
    marginTop: 2,
  },
  placeholder: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: '#6B6B6B',
    fontStyle: 'italic',
  },
});
