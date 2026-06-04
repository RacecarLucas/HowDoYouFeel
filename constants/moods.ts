import { MoodConfig } from '../types';
import { moodColors } from './colors';

export const moods: MoodConfig[] = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: moodColors.happy },
  { id: 'sad', label: 'Sad', emoji: '😢', color: moodColors.sad },
  { id: 'angry', label: 'Angry', emoji: '😠', color: moodColors.angry },
  { id: 'calm', label: 'Calm', emoji: '😌', color: moodColors.calm },
  { id: 'excited', label: 'Excited', emoji: '🤩', color: moodColors.excited },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: moodColors.anxious },
  { id: 'tired', label: 'Tired', emoji: '😴', color: moodColors.tired },
  { id: 'neutral', label: 'Neutral', emoji: '😐', color: moodColors.neutral },
];

export function getMoodById(id: string): MoodConfig | undefined {
  return moods.find((m) => m.id === id);
}
