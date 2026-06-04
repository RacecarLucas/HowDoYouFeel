import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import { fontFamily } from '../constants/fonts';
import { useAuth } from '../hooks/useAuth';
import OnboardingScreen from './onboarding/index';

export default function RootLayout() {
  const { loading } = useAuth();
  const [fontsLoaded, fontError] = useFonts({
    FFSpokenTrial: require('../assets/fonts/FFSpokenTrial-Regular.ttf'),
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem('hasSeenOnboarding').then((value) => {
      if (!mounted) return;
      setShowOnboarding(value !== 'true');
      setChecked(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading || !checked) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>How Do You Feel?</Text>
      </View>
    );
  }

  // If onboarding should show, render it directly instead of navigating
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
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
