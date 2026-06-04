import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useMoodStore } from '../../store/useMoodStore';
import { useGlobalMoods } from '../../hooks/useGlobalMoods';
import { useSound } from '../../hooks/useSound';
import { useHaptics } from '../../hooks/useHaptics';
import { MoodButton } from '../../components/MoodButton';
import { MoodSelector } from '../../components/MoodSelector';
import { GlobalCounter } from '../../components/GlobalCounter';
import { FallingPlusOne } from '../../components/FallingPlusOne';
import { AIPal } from '../../components/AIPal';
import { colors } from '../../constants/colors';
import { fontFamily } from '../../constants/fonts';
import { getMoodById } from '../../constants/moods';
import { MoodType } from '../../types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { selectedMood, setSelectedMood, plusOnes } = useMoodStore();
  const { clickMood } = useGlobalMoods();
  const { playClick } = useSound();
  const { medium } = useHaptics();

  const handleSelectMood = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const handleMoodClick = async () => {
    if (!selectedMood) return;
    await medium();
    await playClick();
    await clickMood(selectedMood);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How's Your Mood?</Text>

        <View style={styles.buttonContainer}>
          {selectedMood ? (
            <MoodButton
              mood={selectedMood}
              onPress={handleMoodClick}
              size={width * 0.4}
            />
          ) : (
            <View style={[styles.placeholderButton, { width: width * 0.4, height: width * 0.4 }]}>
              <Text style={styles.placeholderEmoji}>🤔</Text>
            </View>
          )}
        </View>

        {selectedMood && (
          <Text style={styles.moodLabel}>
            I feel {getMoodById(selectedMood)?.label.toLowerCase()}.
          </Text>
        )}
        <Text style={styles.subtitle}>
          {selectedMood
            ? 'Tap the button to share your mood'
            : 'Select a mood below'}
        </Text>

        <GlobalCounter />

        <View style={styles.selectorContainer}>
          <MoodSelector
            selectedMood={selectedMood}
            onSelectMood={handleSelectMood}
          />
        </View>

        <AIPal />
      </ScrollView>

      {/* Falling +1 animations */}
      {plusOnes.map((plusOne) => (
        <FallingPlusOne
          key={plusOne.id}
          id={plusOne.id}
          mood={plusOne.mood}
          x={plusOne.x}
        />
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    color: colors.text,
    marginBottom: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderButton: {
    borderRadius: 999,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  moodLabel: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: fontFamily.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  selectorContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
});
