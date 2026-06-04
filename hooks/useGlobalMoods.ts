import { useEffect, useRef, useCallback } from 'react';
import { ref, onValue, set, update, increment, serverTimestamp, get } from 'firebase/database';
import { db, firebaseReady } from '../firebase/config';
import { useMoodStore } from '../store/useMoodStore';
import { MoodType, GlobalMood } from '../types';

const MOOD_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function useGlobalMoods() {
  const { setGlobalMoods, addPlusOne, userId, displayName } = useMoodStore();
  const prevCounts = useRef<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!firebaseReady || !db) {
      const demoMoods: Record<string, GlobalMood> = {
        happy: { count: 12, lastClickedAt: new Date(), expiresAt: new Date(Date.now() + MOOD_EXPIRY_MS) },
        sad: { count: 3, lastClickedAt: new Date(), expiresAt: new Date(Date.now() + MOOD_EXPIRY_MS) },
        excited: { count: 8, lastClickedAt: new Date(), expiresAt: new Date(Date.now() + MOOD_EXPIRY_MS) },
      };
      setGlobalMoods(demoMoods);
      return () => {
        mounted = false;
      };
    }

    const moodsRef = ref(db, 'globalMoods');
    
    const unsubscribe = onValue(moodsRef, (snapshot) => {
      if (!mounted) return;
      const data = snapshot.val() || {};
      const moods: Record<string, GlobalMood> = {};
      
      Object.keys(data).forEach((moodId) => {
        const entry = data[moodId];
        const count = entry?.count || 0;
        
        if (prevCounts.current[moodId] !== undefined && count > prevCounts.current[moodId]) {
          addPlusOne(moodId as MoodType);
        }
        
        prevCounts.current[moodId] = count;
        
        moods[moodId] = {
          count,
          lastClickedAt: entry?.lastClickedAt ? new Date(entry.lastClickedAt) : null,
          expiresAt: entry?.expiresAt ? new Date(entry.expiresAt) : null,
        };
      });
      
      setGlobalMoods(moods);
    });

    intervalRef.current = setInterval(() => {
      if (!mounted) return;
      const now = Date.now();
      const current = useMoodStore.getState().globalMoods;
      const updated: Record<string, GlobalMood> = { ...current };
      Object.keys(updated).forEach((moodId) => {
        const mood = updated[moodId];
        if (mood.expiresAt && mood.expiresAt.getTime() < now) {
          updated[moodId] = { ...mood, count: 0 };
        }
      });
      setGlobalMoods(updated);
    }, 60000);

    return () => {
      mounted = false;
      unsubscribe();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setGlobalMoods, addPlusOne]);

  const clickMood = useCallback(async (mood: MoodType) => {
    addPlusOne(mood);

    if (!firebaseReady || !db) {
      const current = useMoodStore.getState().globalMoods;
      setGlobalMoods({
        ...current,
        [mood]: {
          count: (current[mood]?.count || 0) + 1,
          lastClickedAt: new Date(),
          expiresAt: new Date(Date.now() + MOOD_EXPIRY_MS),
        },
      });
      return;
    }

    const moodRef = ref(db, `globalMoods/${mood}`);
    
    try {
      const snap = await get(moodRef);
      if (snap.exists()) {
        await update(moodRef, {
          count: increment(1),
          lastClickedAt: serverTimestamp(),
          expiresAt: serverTimestamp(),
        });
      } else {
        await set(moodRef, {
          count: 1,
          lastClickedAt: serverTimestamp(),
          expiresAt: serverTimestamp(),
        });
      }
      
      if (userId) {
        const activeUserRef = ref(db, `activeUsers/${userId}`);
        await set(activeUserRef, {
          userId,
          displayName: displayName || 'Anonymous',
          mood,
          x: Math.random(),
          y: Math.random(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Failed to click mood:', error);
    }
  }, [userId, displayName, addPlusOne, setGlobalMoods]);

  return { clickMood };
}
