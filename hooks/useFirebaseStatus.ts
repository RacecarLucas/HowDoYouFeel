import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, firebaseReady } from '../firebase/config';

export function useFirebaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'demo'>('checking');

  const checkConnection = useCallback(async () => {
    if (!firebaseReady || !db) {
      setStatus('demo');
      return;
    }
    try {
      // Try to read a known doc to verify network + permissions
      const testRef = doc(db, '.info/connected');
      await getDoc(testRef);
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
