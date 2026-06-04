import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

admin.initializeApp();
const db = admin.firestore();

const MOOD_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const MOODS = ['happy', 'sad', 'angry', 'calm', 'excited', 'anxious', 'tired', 'neutral'];

/**
 * Triggered when any globalMood document is written.
 * Updates the expiresAt timestamp to be 1 hour from now.
 */
export const onMoodClick = onDocumentWritten(
  {
    document: 'globalMoods/{moodId}',
    region: 'us-central1',
  },
  async (event) => {
    const moodId = event.params.moodId;
    const data = event.data?.after?.data();

    if (!data) return;

    // Set expiry to 1 hour from the last click
    const expiresAt = admin.firestore.Timestamp.fromMillis(
      Date.now() + MOOD_EXPIRY_MS
    );

    // Only update if the count actually changed (someone clicked)
    const beforeCount = event.data?.before?.data()?.count || 0;
    const afterCount = data.count || 0;

    if (afterCount > beforeCount) {
      await event.data!.after!.ref.update({
        expiresAt,
      });
    }
  }
);

/**
 * Scheduled function that runs every minute to check for expired moods.
 * Resets mood count to 0 if expiresAt has passed.
 */
export const checkMoodExpiry = onSchedule(
  {
    schedule: 'every 1 minutes',
    region: 'us-central1',
    timeZone: 'UTC',
  },
  async () => {
    const now = admin.firestore.Timestamp.now();
    const batch = db.batch();
    let hasUpdates = false;

    for (const moodId of MOODS) {
      const moodRef = db.collection('globalMoods').doc(moodId);
      const doc = await moodRef.get();

      if (!doc.exists) continue;

      const data = doc.data()!;
      const expiresAt = data.expiresAt;
      const count = data.count || 0;

      if (expiresAt && expiresAt.toMillis() < now.toMillis() && count > 0) {
        batch.update(moodRef, {
          count: 0,
          lastClickedAt: data.lastClickedAt || now,
        });
        hasUpdates = true;
      }
    }

    if (hasUpdates) {
      await batch.commit();
    }
  }
);

/**
 * Clean up old activeUsers entries (older than 1 hour)
 */
export const cleanupActiveUsers = onSchedule(
  {
    schedule: 'every 5 minutes',
    region: 'us-central1',
    timeZone: 'UTC',
  },
  async () => {
    const oneHourAgo = admin.firestore.Timestamp.fromMillis(
      Date.now() - MOOD_EXPIRY_MS
    );

    const snapshot = await db
      .collection('activeUsers')
      .where('updatedAt', '<', oneHourAgo)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    if (snapshot.docs.length > 0) {
      await batch.commit();
    }
  }
);
