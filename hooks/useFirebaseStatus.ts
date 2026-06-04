import { useEffect, useState, useCallback } from 'react';
import { onValue, ref } from 'firebase/database';
import { db, firebaseReady, firebaseInitError } from '../firebase/config';

export function useFirebaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'demo'>('checking');
  const [error, setError] = useState<string | null>(firebaseInitError);

  const checkConnection = useCallback(() => {
    if (!firebaseReady || !db) {
      setStatus('demo');
      setError(firebaseInitError || 'Firebase not initialized');
      return;
    }

    // Use onValue on .info/connected to monitor actual connection state
    const connectedRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      const connected = snap.val() === true;
      if (connected) {
        setStatus('connected');
        setError(null);
      } else {
        // Don't flip to demo immediately — client may still be connecting
        setError('Connecting...');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cleanup = checkConnection();
    return cleanup;
  }, [checkConnection]);

  return { status, isConnected: status === 'connected', isDemo: status === 'demo', error, recheck: checkConnection };
}
