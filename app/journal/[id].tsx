import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ref, push, serverTimestamp } from 'firebase/database';
import { colors } from '../../constants/colors';
import { fontFamily } from '../../constants/fonts';
import { useMoodStore } from '../../store/useMoodStore';
import { getMoodById } from '../../constants/moods';
import { db, firebaseReady } from '../../firebase/config';

export default function JournalScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { selectedMood, userId } = useMoodStore();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const moodConfig = selectedMood ? getMoodById(selectedMood) : null;

  const handleSave = async () => {
    if (!selectedMood || !userId) return;
    
    setSaving(true);
    try {
      if (firebaseReady && db) {
        const historyRef = ref(db, `userMoods/${userId}/history`);
        await push(historyRef, {
          mood: selectedMood,
          note: note.trim(),
          createdAt: serverTimestamp(),
        });
      }
      router.back();
    } catch (error) {
      console.error('Failed to save journal:', error);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Journal Entry</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          {moodConfig && (
            <View style={[styles.moodBadge, { backgroundColor: moodConfig.color }]}>
              <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
              <Text style={styles.moodLabel}>I feel {moodConfig.label.toLowerCase()}</Text>
            </View>
          )}

          <Text style={styles.prompt}>Want to share what's on your mind?</Text>

          <TextInput
            style={styles.input}
            multiline
            placeholder="Write about how you're feeling..."
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            textAlignVertical="top"
          />

          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Journal my mood'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.text,
  },
  spacer: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodLabel: {
    color: '#FFFFFF',
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
  },
  prompt: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#E8A0A0',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
  },
});
