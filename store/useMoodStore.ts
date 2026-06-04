import { create } from 'zustand';
import { MoodType, PlusOneAnimation, GlobalMood } from '../types';

interface MoodState {
  selectedMood: MoodType | null;
  globalMoods: Record<string, GlobalMood>;
  plusOnes: PlusOneAnimation[];
  userId: string | null;
  displayName: string | null;
  
  setSelectedMood: (mood: MoodType) => void;
  setGlobalMoods: (moods: Record<string, GlobalMood>) => void;
  addPlusOne: (mood: MoodType) => void;
  removePlusOne: (id: string) => void;
  setUser: (userId: string, displayName: string) => void;
}

export const useMoodStore = create<MoodState>((set) => ({
  selectedMood: null,
  globalMoods: {},
  plusOnes: [],
  userId: null,
  displayName: null,

  setSelectedMood: (mood) => set({ selectedMood: mood }),
  
  setGlobalMoods: (moods) => set({ globalMoods: moods }),
  
  addPlusOne: (mood) => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = Math.random() * 80 + 10; // Random x position 10-90%
    set((state) => ({
      plusOnes: [...state.plusOnes, { id, mood, x }],
    }));
    
    // Auto-remove after animation
    setTimeout(() => {
      set((state) => ({
        plusOnes: state.plusOnes.filter((p) => p.id !== id),
      }));
    }, 2500);
  },
  
  removePlusOne: (id) =>
    set((state) => ({
      plusOnes: state.plusOnes.filter((p) => p.id !== id),
    })),
    
  setUser: (userId, displayName) => set({ userId, displayName }),
}));
