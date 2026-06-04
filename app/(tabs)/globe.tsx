import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
  withTiming,
} from 'react-native-reanimated';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getMoodById } from '../../constants/moods';
import { colors } from '../../constants/colors';
import { fontFamily } from '../../constants/fonts';
import { MoodType } from '../../types';

const { width } = Dimensions.get('window');
const GLOBE_SIZE = width * 0.85;
const DOT_SIZE = 16;

interface DotData {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mood: MoodType;
  displayName: string;
}

function GlobeDot({
  dot,
  onPress,
}: {
  dot: DotData;
  onPress: (dot: DotData) => void;
}) {
  const moodConfig = getMoodById(dot.mood);
  const posX = useSharedValue(dot.x);
  const posY = useSharedValue(dot.y);
  const velX = useSharedValue(dot.vx);
  const velY = useSharedValue(dot.vy);

  // Always call hooks in the same order (Rules of Hooks)
  useFrameCallback(() => {
    if (Platform.OS === 'web') return;
    posX.value += velX.value;
    posY.value += velY.value;

    if (posX.value < DOT_SIZE / 2 || posX.value > GLOBE_SIZE - DOT_SIZE / 2) {
      velX.value *= -1;
      posX.value = Math.max(
        DOT_SIZE / 2,
        Math.min(posX.value, GLOBE_SIZE - DOT_SIZE / 2)
      );
    }
    if (posY.value < DOT_SIZE / 2 || posY.value > GLOBE_SIZE - DOT_SIZE / 2) {
      velY.value *= -1;
      posY.value = Math.max(
        DOT_SIZE / 2,
        Math.min(posY.value, GLOBE_SIZE - DOT_SIZE / 2)
      );
    }
  });

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // Web fallback: simple oscillating animation
    const interval = setInterval(() => {
      posX.value = withTiming(
        dot.x + Math.sin(Date.now() / 1000) * 20,
        { duration: 1000 }
      );
      posY.value = withTiming(
        dot.y + Math.cos(Date.now() / 1000) * 20,
        { duration: 1000 }
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value - DOT_SIZE / 2 },
      { translateY: posY.value - DOT_SIZE / 2 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
        { backgroundColor: moodConfig?.color || '#ccc' },
      ]}
    >
      <Pressable style={styles.dotPressable} onPress={() => onPress(dot)}>
        <Text style={styles.dotEmoji}>{moodConfig?.emoji}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function GlobeScreen() {
  const [dots, setDots] = useState<DotData[]>([]);
  const [selectedDot, setSelectedDot] = useState<DotData | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!db) {
      const demoDots: DotData[] = Array.from({ length: 15 }, (_, i) => ({
        id: `demo-${i}`,
        x: Math.random() * GLOBE_SIZE,
        y: Math.random() * GLOBE_SIZE,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        mood: ['happy', 'sad', 'angry', 'calm', 'excited', 'anxious', 'tired', 'neutral'][i % 8] as MoodType,
        displayName: `User ${Math.random().toString(36).slice(2, 6)}`,
      }));
      setDots(demoDots);
      return;
    }

    const activeUsersRef = collection(db, 'activeUsers');

    const unsubscribe = onSnapshot(activeUsersRef, (snapshot) => {
      if (!mounted) return;
      const newDots: DotData[] = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        newDots.push({
          id: doc.id,
          x: (data.x || Math.random()) * GLOBE_SIZE,
          y: (data.y || Math.random()) * GLOBE_SIZE,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          mood: data.mood || 'neutral',
          displayName: data.displayName || 'Anonymous',
        });
      });
      setDots(newDots);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>How does the Globe feel?</Text>

      <View style={styles.globeContainer}>
        <View style={[styles.globe, { width: GLOBE_SIZE, height: GLOBE_SIZE }]}>
          {dots.map((dot) => (
            <GlobeDot key={dot.id} dot={dot} onPress={setSelectedDot} />
          ))}
        </View>
      </View>

      <Text style={styles.subtitle}>
        {dots.length} people sharing their mood right now
      </Text>

      {selectedDot && (
        <View style={styles.personCard}>
          <Pressable
            style={styles.closeCard}
            onPress={() => setSelectedDot(null)}
          >
            <Text>✕</Text>
          </Pressable>
          {(() => {
            const moodConfig = getMoodById(selectedDot.mood);
            return (
              <>
                <Text style={styles.personEmoji}>{moodConfig?.emoji}</Text>
                <Text style={styles.personName}>{selectedDot.displayName}</Text>
                <Text style={styles.personMood}>
                  Feeling {moodConfig?.label.toLowerCase()}
                </Text>
              </>
            );
          })()}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  globeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  globe: {
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  dotPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotEmoji: {
    fontSize: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    marginTop: 20,
  },
  personCard: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  closeCard: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  personEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  personName: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.text,
  },
  personMood: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
