import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { fontFamily } from '../../constants/fonts';
import { moods } from '../../constants/moods';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  const handleStart = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>😊</Text>
        <Text style={styles.title}>How Do You Feel?</Text>
        <Text style={styles.subtitle}>
          Share your mood with the world, track your emotions, and see how the
          globe feels right now.
        </Text>

        <View style={styles.moodPreview}>
          {moods.slice(0, 4).map((mood) => (
            <View
              key={mood.id}
              style={[styles.moodBubble, { backgroundColor: mood.color }]}
            >
              <Text style={styles.moodBubbleEmoji}>{mood.emoji}</Text>
            </View>
          ))}
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🌍</Text>
            <Text style={styles.featureText}>
              See how people around the world feel in real-time
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📅</Text>
            <Text style={styles.featureText}>
              Track your mood history with a beautiful calendar
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>✨</Text>
            <Text style={styles.featureText}>
              Moods "die" after 1 hour of no clicks — keep them alive!
            </Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  content: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: fontFamily.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  moodPreview: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  moodBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodBubbleEmoji: {
    fontSize: 24,
  },
  features: {
    width: '100%',
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.text,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#F4A261',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
});
