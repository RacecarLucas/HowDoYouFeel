import { useEffect, useRef, useCallback } from 'react';
import { onSnapshot, collection, doc, updateDoc, increment, serverTimestamp, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useMoodStore } from '../store/useMoodStore';
import { MoodType, GlobalMood } from '../types';

const MOOD_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function useGlobalMoods() {
  const { setGlobalMoods, addPlusOne, userId, displayName } = useMoodStore();
  const prevCounts = useRef<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!db) {
      // Fallback for demo without Firebase
      const demoMoods: Record<string, GlobalMood> = {
        happy: { count: 12, lastClickedAt: new Date(), expiresAt: new Date(Date.now() + MOOD_EXPIRY_MS) },
        sad: { count: 3, lastClickedAt: new Date(), expiresAt: new Date(Date.now() + MOOD_EXPIRY_MS) },
        excited: { count: 8, lastClickedAt: new Date(), expiresAt: new Date(Date.now() + MOOD_EXPIRY_MS) },
      };
      setGlobalMoods(demoMoods);
      return;
    }

    const moodsRef = collection(db, 'globalMoods');
    
    const unsubscribe = onSnapshot(moodsRef, (snapshot) => {
      const moods: Record<string, GlobalMood> = {};
      
      snapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const moodId = docSnapshot.id;
        const count = data.count || 0;
        
        // Detect if count increased (someone clicked)
        if (prevCounts.current[moodId] !== undefined && count > prevCounts.current[moodId]) {
          addPlusOne(moodId as MoodType);
        }
        
        prevCounts.current[moodId] = count;
        
        moods[moodId] = {
          count,
          lastClickedAt: data.lastClickedAt?.toDate() || null,
          expiresAt: data.expiresAt?.toDate() || null,
        };
      });
      
      setGlobalMoods(moods);
    });

    // Client-side expiry check every minute
    intervalRef.current = setInterval(() => {
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
      unsubscribe();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setGlobalMoods, addPlusOne]);

  const clickMood = useCallback(async (mood: MoodType) => {
    if (!db) {
      // Demo mode - just update local state
      addPlusOne(mood);
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

    const moodRef = doc(db, 'globalMoods', mood);
    
    try {
      const snap = await getDoc(moodRef);
      if (snap.exists()) {
        await updateDoc(moodRef, {
          count: increment(1),
          lastClickedAt: serverTimestamp(),
          expiresAt: serverTimestamp(),
        });
      } else {
        await setDoc(moodRef, {
          count: 1,
          lastClickedAt: serverTimestamp(),
          expiresAt: serverTimestamp(),
        });
      }
      
      // Update active user for Globe
      if (userId) {
        const activeUserRef = doc(db, 'activeUsers', userId);
        await setDoc(activeUserRef, {
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
