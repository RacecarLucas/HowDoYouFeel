import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  databaseURL:
    process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ||
    `https://${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || ''}-default-rtdb.asia-southeast1.firebasedatabase.app`,
};

// Debug logging so we can see exactly what's happening in the browser console
console.log('[Firebase] Config check:');
console.log('[Firebase] API Key present?', !!firebaseConfig.apiKey);
console.log('[Firebase] Project ID:', firebaseConfig.projectId);
console.log('[Firebase] Database URL:', firebaseConfig.databaseURL);

const hasConfig = Object.values(firebaseConfig).every((v) => v && v.length > 0);
console.log('[Firebase] hasConfig =', hasConfig);

let app: FirebaseApp | null = null;
let db: Database | null = null;
let auth: Auth | null = null;
let firebaseReady = false;
let firebaseInitError: string | null = null;

try {
  if (hasConfig) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('[Firebase] App initialized');
    } else {
      app = getApps()[0];
      console.log('[Firebase] Using existing app');
    }
    db = getDatabase(app);
    auth = getAuth(app);
    firebaseReady = true;
    console.log('[Firebase] Ready!');
  } else {
    const missing = Object.entries(firebaseConfig)
      .filter(([, v]) => !v || !v.length)
      .map(([k]) => k);
    firebaseInitError = `Missing config: ${missing.join(', ')}`;
    console.warn('[Firebase]', firebaseInitError);
  }
} catch (error: any) {
  firebaseInitError = error?.message || String(error);
  console.error('[Firebase] Initialization failed:', firebaseInitError);
}

export { db, auth, firebaseReady, firebaseInitError };
