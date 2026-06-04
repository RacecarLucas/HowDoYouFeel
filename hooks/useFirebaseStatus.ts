import { useEffect, useState, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { db, firebaseReady } from '../firebase/config';

export function useFirebaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'demo'>('checking');

  const checkConnection = useCallback(async () => {
    if (!firebaseReady || !db) {
      setStatus('demo');
      return;
    }
    try {
      const testRef = ref(db, '.info/connected');
      await get(testRef);
      setStatus('connected');
    } catch {
      setStatus('demo');
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return { status, isConnected: status === 'connected', isDemo: status === 'demo', recheck: checkConnection };
}
