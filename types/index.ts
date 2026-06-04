export type MoodType = 'happy' | 'sad' | 'angry' | 'calm' | 'excited' | 'anxious' | 'tired' | 'neutral';

export interface MoodConfig {
  id: MoodType;
  label: string;
  emoji: string;
  color: string;
}

export interface GlobalMood {
  count: number;
  lastClickedAt: Date | null;
  expiresAt: Date | null;
}

export interface UserMoodEntry {
  id: string;
  mood: MoodType;
  note: string;
  createdAt: Date;
}

export interface ActiveUser {
  userId: string;
  displayName: string;
  mood: MoodType;
  x: number;
  y: number;
}

export interface PlusOneAnimation {
  id: string;
  mood: MoodType;
  x: number;
}
