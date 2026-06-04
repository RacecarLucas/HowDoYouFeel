# Firebase Setup — Complete Beginner's Guide

## What is Firebase?

**Firebase** is Google's backend service. Think of it as the "server" for your app — it stores data, handles user accounts, and runs scheduled tasks. You don't need to build your own server.

**Firestore** is Firebase's database. It's where we store:
- How many people clicked each mood (global counters)
- Your journal entries
- Who's currently active on the Globe screen

**Cloud Functions** are small programs that run on Google's servers. We use them to automatically reset mood counters after 1 hour of no clicks.

---

## Part 1: Create Your Firebase Project

### Step 1: Go to Firebase Console
Open your browser and go to: **https://console.firebase.google.com/**

### Step 2: Click "Create a project"

### Step 3: Name your project
Type: `howdoyoufeel-app`
(or any name you want)

Click **Continue**.

### Step 4: Disable Google Analytics (simpler)
Toggle OFF the Google Analytics switch.

Click **Create project**.

Wait ~30 seconds for it to finish, then click **Continue**.

---

## Part 2: Create a Web App in Firebase

### Step 5: Register a web app
On the project homepage, look for the circle icons under "Get started by adding Firebase to your app"

Click the **</>** icon ("Web")

### Step 6: Name your app
Type: `HowDoYouFeel-Web`

Click **Register app**.

### Step 7: Copy the config values
You'll see a block of code like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyABC123...",
  authDomain: "howdoyoufeel-app.firebaseapp.com",
  projectId: "howdoyoufeel-app",
  storageBucket: "howdoyoufeel-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Copy these 6 values** — you'll paste them into the `.env` file in the next step.

Click **Continue to console**.

---

## Part 3: Set Up the .env File

### Step 8: Open the .env file
In your project folder, find the file named `.env.example`

Make a copy of it and rename the copy to `.env`

### Step 9: Paste your Firebase values
Open `.env` in any text editor and replace the placeholder text with your real values from Step 7:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyABC123...(your real key)
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=howdoyoufeel-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=howdoyoufeel-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=howdoyoufeel-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Save the file.**

---

## Part 4: Enable Anonymous Authentication

Your app lets people use it without creating accounts. We need to turn this on.

### Step 10: Go to Authentication
In the Firebase left sidebar, click **Authentication** (the person icon)

### Step 11: Click "Get started"

### Step 12: Enable Anonymous
Click **Anonymous** in the list of sign-in methods

Toggle the switch to **Enable**

Click **Save**

✅ Done! Users can now sign in anonymously.

---

## Part 5: Create the Firestore Database

### Step 13: Go to Firestore Database
In the left sidebar, click **Firestore Database**

### Step 14: Click "Create database"

### Step 15: Start in test mode
Select **Start in test mode** (this lets the app read/write freely while you develop)

Click **Next**

### Step 16: Choose a location
Pick a location close to you (e.g., `nam5 (us-central)` for US, `europe-west` for Europe)

Click **Enable**

✅ Your database is now live!

---

## Part 6: Set Firestore Security Rules

By default, test mode expires in 30 days. Let's set proper rules now.

### Step 17: Go to Rules tab
In Firestore Database, click the **Rules** tab at the top

### Step 18: Replace the rules
Delete everything in the text box and paste this exact code:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /globalMoods/{mood} {
      allow read: if true;
      allow write: if true;
    }
    match /userMoods/{userId}/history/{doc} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /activeUsers/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 19: Publish the rules
Click **Publish**

✅ Rules are now active!

---

## Part 7: Deploy Cloud Functions (The 1-Hour Timer)

This is the magic that resets mood counters to 0 after nobody clicks for 1 hour.

### Step 20: Install Firebase CLI
Open a terminal/command prompt and run:

```bash
npm install -g firebase-tools
```

### Step 21: Log in to Firebase
Run:

```bash
firebase login
```

This opens a browser. Sign in with the same Google account you used to create the Firebase project. Click **Allow** when asked for permissions.

### Step 22: Go to the functions folder
In your terminal, navigate to the functions folder inside the project:

```bash
cd firebase/functions
```

### Step 23: Install dependencies
```bash
npm install
```

### Step 24: Build the functions
```bash
npm run build
```

### Step 25: Initialize Firebase in the functions folder
```bash
firebase init
```
You'll see a menu. Use arrow keys to select:
- ✅ **Functions** (press Space to check it, Enter to continue)
- Select your Firebase project from the list
- Choose **TypeScript** when asked for language
- Say **No** to ESLint
- Say **Yes** to install dependencies

### Step 26: Deploy the functions
```bash
firebase deploy --only functions
```

Wait for it to finish. You should see green checkmarks.

✅ Cloud Functions are now live! Your 1-hour mood expiry is working.

---

## Part 8: Test Your App

### Step 27: Run the app
Go back to your main project folder and run:

```bash
npx expo start
```

Press **w** to open in web browser.

### Step 28: Click a mood
Select a mood and tap the big button. Check Firebase Console → Firestore Database → Data. You should see a `globalMoods` collection with your mood and count = 1.

---

## You're Done! 🎉

If anything breaks, tell me:
1. Which step you were on
2. What error message you see (copy/paste it)
3. Screenshot if possible
