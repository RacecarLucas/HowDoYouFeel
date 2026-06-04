import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFirebaseStatus } from '../hooks/useFirebaseStatus';
import { colors } from '../constants/colors';
import { fontFamily } from '../constants/fonts';

export function ConnectionBanner() {
  const { status, recheck } = useFirebaseStatus();

  if (status === 'checking') return null;
  if (status === 'connected') return null;

  return (
    <Pressable style={styles.banner} onPress={recheck}>
      <Text style={styles.text}>🔌 Demo Mode — Firebase not connected. Tap to retry.</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#E9C46A',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});
