import { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { auth, firebaseReady } from '../firebase/config';
import { useMoodStore } from '../store/useMoodStore';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useMoodStore();

  useEffect(() => {
    let mounted = true;

    // Demo mode: if Firebase isn't configured, create a dummy user
    if (!firebaseReady || !auth || typeof (auth as Auth).onAuthStateChanged !== 'function') {
      const demoId = `demo-${Math.random().toString(36).slice(2, 8)}`;
      setUser(demoId, `User ${demoId.slice(0, 6)}`);
      if (mounted) setLoading(false);
      return () => {
        mounted = false;
      };
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
        } catch (err: any) {
          if (!mounted) return;
          console.error('Anonymous auth failed:', err);
          setError(err?.message || 'Auth failed');
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

  return { loading, error };
}
