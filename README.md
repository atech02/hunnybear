# 🍯 Hunny Bear — Interactive Companion Game

Hunny Bear is a responsive, animated interactive teddy-bear companion game built for web browsers, Progressive Web App (PWA) installation, Firebase Hosting, and Android APK deployment.

---

## 🎮 Features & Interactive Regions

Hunny Bear features smooth animations, expressive reactions, Web Audio sound synthesis, and accessible multi-modal controls:

* **Central Animated Teddy-Bear:**
  * **Idle Animation:** Gentle breathing rhythm, periodic natural eye-blinking, and subtle ear twitches.
  * **Face / Nose Boop:** Triggers a surprised head-turn, curious wide eyes, boop pop sound, and star sparkles.
  * **Tummy Tickle:** Triggers a ticklish laugh animation, jiggling belly, open laughing smile, giggly sound synthesis, and floating hearts/giggles.
  * **Left & Right Hands:** High-paw wave animations, friendly chime arpeggio, and warm greetings.
  * **Left & Right Feet:** Playful foot-tapping dance steps with rhythmic percussion and joyful bell chime.
  * **Honey Treat:** Feeds Hunny Bear a golden honey jar, activating a fanfare chime and celebration confetti.
* **Responsive Across All Devices:**
  * Fluid scaling for mobile phones, tablets, and wide desktop screens.
  * Support for notch viewports (`viewport-fit=cover`) and safe-area insets.
* **Offline Audio Synthesizer:**
  * Built using the Web Audio API with zero external sound file downloads.
  * Features sound effects, master mute toggle, and an optional soothing background lullaby music-box loop.
* **Happiness Meter:**
  * Increases with every interaction, culminating in a celebration confetti burst at 100%.
* **Accessibility:**
  * Full keyboard navigation (Tab through character regions and press Enter or Space).
  * Quick reaction buttons for one-touch interaction.
  * ARIA attributes and labels for screen readers.

---

## 🚀 Quick Start & Development

### Prerequisites
* **Node.js:** v18+ (verified with `v22.23.3`)
* **npm:** v9+ (verified with `v10.9.9`)

### Run Locally
```bash
# Install dependencies (already installed in this repository)
npm install

# Start the local development server with hot-reload
npm run dev
```

Visit the local URL shown in your terminal (typically `http://localhost:5173`).

### Production Build
```bash
# Typecheck and build the optimized production web app and PWA assets
npm run build
```
Output files are generated in `dist/`.

---

## 📱 Progressive Web App (PWA)

Hunny Bear is configured with `vite-plugin-pwa` and meets all criteria for an installable PWA:

* **Web App Manifest:** `dist/manifest.webmanifest`
* **Real Icons:**
  * `public/icons/icon-192.png` (192 × 192)
  * `public/icons/icon-512.png` (512 × 512)
  * `public/icons/icon-maskable-512.png` (512 × 512 maskable)
  * `public/favicon.svg` (vector badge)
* **Service Worker:** `dist/sw.js` precaches all assets for offline gameplay.
* **In-App Install Prompt:** Captures `beforeinstallprompt` and displays an "Install App" button on supported browsers (Chrome, Edge, Android).

---

## 🔥 Firebase Hosting

Firebase configuration is included in `firebase.json` with SPA routing and optimal asset caching headers.

### Deployment Steps:
1. Re-authenticate Firebase CLI:
   ```bash
   firebase login --reauth
   ```
2. Link your Firebase project (or verify active project):
   ```bash
   firebase use --add
   ```
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 🤖 Android APK Generation

Two paths are available for generating an Android APK:

### Path A: Automated Cloud Build via GitHub Actions (Recommended)
Because local Android SDK and Java are not required on your machine, a pre-configured workflow is included in `.github/workflows/build-apk.yml`.
1. Push your repository to GitHub.
2. Under the **Actions** tab, the **Build Android APK** workflow will run automatically.
3. Download the built `HunnyBear-Debug-APK` directly from the workflow artifacts.

### Path B: Local Capacitor Build
If you install Android Studio and JDK 17 locally:
```bash
npm install -D @capacitor/cli @capacitor/core @capacitor/android
npx cap add android
npx cap sync
npx cap open android
```
In Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🔒 Security & Privacy

* Core gameplay runs 100% locally on the device with zero cloud dependency.
* No API keys or user credentials are embedded in the client code.
* `.gitignore` protects all local environment files (`.env`, `.env.local`) and Firebase logs.
