import { useEffect, useState, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { db, firebaseReady, firebaseInitError } from '../firebase/config';

export function useFirebaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'demo'>('checking');
  const [error, setError] = useState<string | null>(firebaseInitError);

  const checkConnection = useCallback(async () => {
    if (!firebaseReady || !db) {
      setStatus('demo');
      setError(firebaseInitError || 'Firebase not initialized');
      return;
    }
    try {
      const testRef = ref(db, '.info/connected');
      await get(testRef);
      setStatus('connected');
      setError(null);
    } catch (err: any) {
      setStatus('demo');
      setError(err?.message || 'Database connection failed');
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return { status, isConnected: status === 'connected', isDemo: status === 'demo', error, recheck: checkConnection };
}
