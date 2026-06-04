# How Do You Feel?

A playful, social mood-tracking app built with React Native and Expo.

![App Mood Board](https://i.imgur.com/placeholder.png)

## Features

- **Mood Picker** — Tap your current mood to add +1 to the global counter. Moods "die" (reset to 0) if nobody clicks them for 1 hour.
- **Worldwide +1 Animation** — When anyone clicks a mood, a "+1" falls from the top of the screen with sound.
- **Calendar Tracker** — Monthly mood history with cute emoji visuals and statistics.
- **Globe Feel** — A large animated circle filled with moving dots, each representing a person and their emotion.
- **AI Pal** — Journal your thoughts and feelings.

## Tech Stack

- React Native (Expo SDK 52)
- Expo Router (file-based routing)
- Firebase (Auth, Firestore, Cloud Functions)
- React Native Reanimated 3
- Zustand (state management)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable **Authentication** → Sign-in method → **Anonymous** (enable)
3. Enable **Cloud Firestore** → Start in test mode (for development)
4. Add a web app to your Firebase project
5. Copy the configuration values:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 3. Set up Firestore Security Rules

Go to Firestore Database → Rules and paste:

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

### 4. Deploy Cloud Functions (Required for 1-hour expiry)

```bash
cd firebase/functions
npm install
npm run build
firebase deploy --only functions
```

Functions deployed:
- `onMoodClick` — Updates expiry timestamp when a mood is clicked
- `checkMoodExpiry` — Runs every minute to reset expired moods to 0
- `cleanupActiveUsers` — Runs every 5 minutes to remove inactive users

### 5. Run the app

```bash
npx expo start
```

Press `w` for web, `i` for iOS simulator, `a` for Android emulator.

## Customization

### Replace the Font

The app uses **FF Spoken Trial** font. The file is already included in `assets/fonts/`. If you want to replace it:

1. Place your `.ttf` font file in `assets/fonts/`
2. Update `constants/fonts.ts`:

```typescript
export const fontFamily = {
  regular: 'ChildHood-Regular',
  medium: 'ChildHood-Medium',
  semiBold: 'ChildHood-SemiBold',
  bold: 'ChildHood-Bold',
};
```

3. Update `app/_layout.tsx` to load your custom font with `useFonts`.

## Building for Production

### Using EAS Build

```bash
# Login to Expo
npx eas login

# Configure build
npx eas build:configure

# Preview build (internal distribution)
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios

# Production build
npx eas build --profile production --platform all
```

### Manual Build

```bash
# iOS
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

## Project Structure

```
app/
  (tabs)/
    _layout.tsx       # Tab navigation
    index.tsx         # Home / Mood Picker
    calendar.tsx      # Calendar screen
    globe.tsx         # Globe screen
  journal/
    [id].tsx          # Journal entry modal
  _layout.tsx         # Root layout with auth + fonts

components/
  MoodButton.tsx      # Animated mood button
  MoodSelector.tsx    # Horizontal mood selector
  GlobalCounter.tsx   # Real-time counter display
  FallingPlusOne.tsx  # +1 falling animation
  AIPal.tsx           # Journal prompt card

hooks/
  useAuth.ts          # Anonymous Firebase auth
  useGlobalMoods.ts   # Firestore global mood logic
  useSound.ts         # Click sound effects
  useHaptics.ts       # Haptic feedback

firebase/
  config.ts           # Firebase client config
  functions/          # Cloud Functions
    src/
      index.ts        # Functions entry point

store/
  useMoodStore.ts     # Zustand state management

constants/
  colors.ts           # App color palette
  moods.ts            # Mood definitions
  fonts.ts            # Font family references
```

## License

MIT
