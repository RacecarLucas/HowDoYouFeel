import { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useMoodStore } from '../store/useMoodStore';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { setUser } = useMoodStore();

  useEffect(() => {
    // Demo mode: if auth isn't properly initialized, create a dummy user
    if (!auth || typeof (auth as Auth).onAuthStateChanged !== 'function') {
      const demoId = `demo-${Math.random().toString(36).slice(2, 8)}`;
      setUser(demoId, `User ${demoId.slice(0, 6)}`);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth as Auth, async (user: User | null) => {
      if (user) {
        const displayName = `User ${user.uid.slice(0, 6)}`;
        setUser(user.uid, displayName);
      } else {
        try {
          const result = await signInAnonymously(auth as Auth);
          const displayName = `User ${result.user.uid.slice(0, 6)}`;
          setUser(result.user.uid, displayName);
        } catch (error) {
          console.error('Anonymous auth failed:', error);
          const demoId = `demo-${Math.random().toString(36).slice(2, 8)}`;
          setUser(demoId, `User ${demoId.slice(0, 6)}`);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  return { loading };
}
