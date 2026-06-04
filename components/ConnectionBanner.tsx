import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFirebaseStatus } from '../hooks/useFirebaseStatus';
import { colors } from '../constants/colors';
import { fontFamily } from '../constants/fonts';

export function ConnectionBanner() {
  const { status, error, recheck } = useFirebaseStatus();

  if (status === 'checking') return null;
  if (status === 'connected') return null;

  return (
    <Pressable style={styles.banner} onPress={recheck}>
      <Text style={styles.text}>🔌 Demo Mode — {error || 'Firebase not connected'}</Text>
      <Text style={styles.hint}>Tap to retry. Check browser console (F12) for details.</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#E9C46A',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    marginTop: 2,
  },
});
