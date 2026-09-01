# Cam Cow Reports (mobile)

A React Native (Expo) app for management to review LiveStock ERP reports —
herd, batches, finance, sales, health, and feed — on their phone. Read-only:
all data entry stays in the main web app.

## One-time setup

1. **Backend:** in the main project folder (one level up), make sure the
   `.env` there has `JWT_SECRET` set (already added for you) and run the
   password migration once against your database:
   ```
   cd ..
   npm run hash-passwords
   ```
   Then start the backend as usual: `npm run server`.

2. **Find your computer's LAN IP** (the phone needs this — "localhost"
   only means the phone itself):
   - macOS: `ipconfig getifaddr en0` in Terminal, or Wi-Fi settings
   - Windows: `ipconfig`, look for "IPv4 Address"

3. **Configure the app:** edit `mobile-app/.env` and set:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3002/api/v1
   ```
   Your phone and computer must be on the same Wi-Fi network.

4. **Install dependencies** (already done once, but if you pull fresh):
   ```
   cd mobile-app
   npm install
   ```

## Running it

```
npm start
```
This opens Expo's dev tools. Install **Expo Go** from the App Store /
Play Store on your phone, then scan the QR code that appears.

## Logging in

Log in with any active user's email + password from your `users` table.
If you don't know a password, check your backend server's console output —
new/reset accounts get a temporary password printed there once (search for
"assigned temporary password" or "Seeded default user accounts").

## What's in here

- `App.tsx` — root: auth provider + navigation
- `src/context/AuthContext.tsx` — login/logout, session token (stored in
  the device's secure keychain via `expo-secure-store`)
- `src/api/client.ts` — talks to your Express backend at `EXPO_PUBLIC_API_URL`
- `src/screens/` — one file per report screen
- `src/navigation/` — bottom tabs (Dashboard, Herd, Finance, Alerts, More)
  plus a stack for drill-down screens (Animal Detail, Batches, Farms,
  Growth, Sales, Health, Feed, Settings)

## Building an installable APK

An APK can't be built inside this dev session — a real Android build needs
the Android SDK (multi-GB, and Google's servers aren't reachable from here
or from this machine's sandboxed shell), and it needs to be signed with a
key tied to *your* app identity, not something I can generate on your
behalf. The standard, no-local-SDK way to get one is Expo's free **EAS
Build** cloud service — it builds the APK on Expo's servers and hands you a
download link. `eas.json` and `app.json` in this repo are already
configured for it (`android.package: com.camcowreports.app`, a `preview`
build profile that outputs a plain installable `.apk`). From your terminal:

```bash
npx eas-cli login          # free Expo account — sign up at expo.dev if you don't have one
npx eas-cli build --platform android --profile preview
```

(Use `npx eas-cli ...` rather than a global `npm install -g eas-cli` — on
macOS the global npm folder is often owned by root/admin, which makes
`-g` installs fail with an `EACCES` permissions error. `npx` sidesteps
that by installing eas-cli into your own user cache instead.)

The first run asks a couple of yes/no questions (create a project on your
account, generate an Android keystore — say yes, EAS manages it for you)
and then uploads and builds in the cloud, usually 10-20 minutes. When it
finishes it prints a download URL — open it on your phone (or `eas build:list`
to get the link again later) to download and install the `.apk` directly,
or run `eas build:run -p android` to install it on a connected/emulated
device automatically. No Android Studio, SDK, or signing setup needed
locally.

Before your first build, set `EXPO_PUBLIC_API_URL` in `.env` to wherever
your backend will be reachable from the phone that installs the APK (not
`localhost` — a real IP/domain the backend is actually deployed to, since
this won't be running through the Expo Go/Metro dev tunnel anymore).

## Next steps / not yet built

- Export/share (PDF) — the design mockup has an export sheet; not wired up yet
- Push notifications for alerts (currently pull-to-refresh only)
- App Store (iOS) publishing — `eas build --platform ios` works the same
  way once you have an Apple Developer account
