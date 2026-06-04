// Run this with Node.js to seed initial data into Realtime Database
// Usage: node firebase/seed.js
// Make sure you have firebase-admin installed and a service account key

const admin = require('firebase-admin');

// Replace with your service account JSON path or use Application Default Credentials
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`,
});

const db = admin.database();

async function seed() {
  const moods = ['happy', 'sad', 'angry', 'calm', 'excited', 'anxious', 'tired', 'neutral'];

  // Seed global moods with 0 counts
  const globalMoods = {};
  for (const mood of moods) {
    globalMoods[mood] = {
      count: 0,
      lastClickedAt: admin.database.ServerValue.TIMESTAMP,
      expiresAt: admin.database.ServerValue.TIMESTAMP,
    };
  }
  await db.ref('globalMoods').set(globalMoods);
  console.log('Seeded globalMoods');

  // Seed a few demo active users for the globe
  const demoUsers = [
    { displayName: 'Alice', mood: 'happy', x: 0.3, y: 0.4 },
    { displayName: 'Bob', mood: 'calm', x: 0.6, y: 0.5 },
    { displayName: 'Charlie', mood: 'excited', x: 0.5, y: 0.3 },
    { displayName: 'Dana', mood: 'sad', x: 0.2, y: 0.7 },
    { displayName: 'Eli', mood: 'angry', x: 0.8, y: 0.6 },
  ];

  const activeUsers = {};
  for (let i = 0; i < demoUsers.length; i++) {
    activeUsers[`demo-${i}`] = {
      userId: `demo-${i}`,
      ...demoUsers[i],
      updatedAt: admin.database.ServerValue.TIMESTAMP,
    };
  }
  await db.ref('activeUsers').set(activeUsers);
  console.log('Seeded activeUsers');
  console.log('Done!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
