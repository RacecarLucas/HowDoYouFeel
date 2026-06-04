import React from 'react';
import { StyleSheet, ScrollView, Pressable, Text, View } from 'react-native';
import { MoodType } from '../types';
import { moods } from '../constants/moods';
import { fontFamily } from '../constants/fonts';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
}

export function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {moods.map((mood) => {
        const isSelected = selectedMood === mood.id;
        return (
          <Pressable
            key={mood.id}
            onPress={() => onSelectMood(mood.id)}
            style={[
              styles.moodItem,
              isSelected && { backgroundColor: mood.color },
            ]}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text
              style={[
                styles.label,
                isSelected && styles.labelSelected,
              ]}
            >
              {mood.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  moodItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: '#2D2D2D',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
