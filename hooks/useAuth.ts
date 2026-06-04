import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { signInAnonymously, onAuthStateChanged, User, Auth, getAuth } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useMoodStore } from '../store/useMoodStore';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { setUser } = useMoodStore();

  useEffect(() => {
    let mounted = true;

    // Demo mode: if auth isn't properly initialized, create a dummy user
    if (!auth || typeof (auth as Auth).onAuthStateChanged !== 'function') {
      const demoId = `demo-${Math.random().toString(36).slice(2, 8)}`;
      setUser(demoId, `User ${demoId.slice(0, 6)}`);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth as Auth, async (user: User | null) => {
      if (!mounted) return;
      if (user) {
        const displayName = `User ${user.uid.slice(0, 6)}`;
        setUser(user.uid, displayName);
      } else {
        try {
          const result = await signInAnonymously(auth as Auth);
          if (!mounted) return;
          const displayName = `User ${result.user.uid.slice(0, 6)}`;
          setUser(result.user.uid, displayName);
        } catch (error) {
          if (!mounted) return;
          console.error('Anonymous auth failed:', error);
          const demoId = `demo-${Math.random().toString(36).slice(2, 8)}`;
          setUser(demoId, `User ${demoId.slice(0, 6)}`);
        }
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setUser]);

  return { loading };
}
