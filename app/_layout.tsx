import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import { fontFamily } from '../constants/fonts';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
  const { loading } = useAuth();
  const [fontsLoaded] = useFonts({
    FFSpokenTrial: require('../assets/fonts/FFSpokenTrial-Regular.ttf'),
  });
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding').then((value) => {
      setHasSeenOnboarding(value === 'true');
      setCheckedOnboarding(true);
    });
  }, []);

  useEffect(() => {
    if (checkedOnboarding && !hasSeenOnboarding && segments[0] !== 'onboarding') {
      router.replace('/onboarding');
    }
  }, [checkedOnboarding, hasSeenOnboarding, segments, router]);

  if (loading || !fontsLoaded || !checkedOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>How Do You Feel?</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="journal/[id]"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
});
