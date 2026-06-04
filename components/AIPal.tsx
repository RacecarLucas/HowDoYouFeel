import React from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { fontFamily } from '../constants/fonts';

export function AIPal() {
  const router = useRouter();

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push('/journal/new')}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Want to share what's on your mind?</Text>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Journal my mood</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: '#6B6B6B',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#E8A0A0',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
  },
});
