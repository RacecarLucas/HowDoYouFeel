import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

const hasConfig = Object.values(firebaseConfig).every((v) => v && v.length > 0);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let firebaseReady = false;

try {
  if (hasConfig) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    auth = getAuth(app);
    firebaseReady = true;
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase config missing — running in demo mode');
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { db, auth, firebaseReady };
