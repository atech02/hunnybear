# AGENTS.md — Hunny Bear: Feelings & Friends

This document provides context, architectural guidelines, and strict design constraints for AI coding agents working on the **Hunny Bear** educational game.

---

## 1. Project Overview

**Hunny Bear: Feelings & Friends** is an interactive, voice-enabled educational web and Android application designed for preschool and early-primary children. Children gently touch different parts of Hunny Bear's face and body to learn about emotions, empathy, kindness, and personal boundaries.

- **Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Canvas Confetti, Web Audio API, Web Speech API (`speechSynthesis`), PWA (`vite-plugin-pwa`), Capacitor Android.
- **Live Hosting:** Firebase Hosting (`https://hunnybear-game.web.app`, project ID `hunnybear-game`).
- **Android Build:** Automated via GitHub Actions (`.github/workflows/build-apk.yml`) producing `hunnybear-game.apk`.

---

## 2. Directory Structure

```text
c:\Dev\projects\hunnybear\
├── image/                              # Source character & background assets
│   ├── Joyful Cuddly Teddy Bear.png    # Designated main character source
│   ├── hunnybear_character.png         # Alpha-transparent character asset
│   └── scenery_background.png          # Clean fairytale landscape (no static bear)
├── public/
│   └── image/
│       ├── hunnybear_character.png     # Production transparent character asset
│       └── scenery_background.png      # Production background scenery asset
├── src/
│   ├── App.tsx                         # Main application layout, state & score logic
│   ├── index.css                       # Tailwind imports & organic keyframe animations
│   ├── components/
│   │   ├── InteractiveHunnyBear.tsx    # Layered scene, SVG facial overlays & hitboxes
│   │   ├── HappinessMeter.tsx          # Sleek top HUD bar, score % & audio controls
│   │   ├── EmotionCheckIn.tsx          # "How do you feel today?" modal activity
│   │   └── HelpModal.tsx               # Parent & teacher educational guide modal
│   ├── types/
│   │   └── game.ts                     # TypeScript interfaces & animation state unions
│   └── utils/
│       ├── emotionManager.ts           # Body-part interaction map & dialogue lines
│       ├── voiceManager.ts             # Little-boy voice synthesis & mouth viseme sync
│       └── audio.ts                    # Web Audio API procedural sound effects & lullaby BGM
└── .github/workflows/
    └── build-apk.yml                   # CI workflow to build Capacitor Android debug APK
```

---

## 3. Core Visual & UX Rules (Strict Constraints)

1. **Single Character Only (Zero Duplicates):**
   - Never render a background image that contains a static copy of Hunny Bear behind the interactive character.
   - Always pair `public/image/scenery_background.png` (background layer) with `public/image/hunnybear_character.png` (foreground character layer).

2. **100% Invisible Hitboxes:**
   - All interactive body-part touch targets inside `InteractiveHunnyBear.tsx` must use invisible shape-aware SVG elements (`fill="transparent"`, `stroke="none"`).
   - Never display visible boxes, borders, outlines, debug rectangles, or hover color overlays over Hunny Bear's body parts.

3. **Seamless Scene Presentation:**
   - Avoid heavy rectangular frames or thick borders around the character viewport.
   - Ground Hunny Bear naturally onto the rainbow stone path with a soft radial contact shadow beneath his feet.

4. **Audio-Only Spoken Responses (No Subtitles):**
   - Spoken phrases must be heard via `voiceManager.ts` using a childlike little-boy voice profile.
   - Do **not** render subtitles, captions, speech bubbles, or text transcripts on screen when Hunny Bear speaks.

---

## 4. Body-Part Interaction Specification

| Body Region | Animation State | Score Delta | Spoken Phrase | Reaction Summary |
| :--- | :--- | :---: | :--- | :--- |
| `left-hand` | `leftHandWave` | `+2` | `"Hi, friend!"` | Raises left hand, waves side-to-side, turns head slightly, cheerful smile |
| `right-hand` | `rightHandWave` | `+2` | `"Hi, friend!"` | Raises right hand, waves side-to-side, turns head slightly, cheerful smile |
| `left-foot` | `leftFootTap` | `+2` | `"Hey, you!"` | Lifts left foot, taps down 3 times with body bounce, playful smile |
| `right-foot` | `rightFootTap` | `+2` | `"Hey, you!"` | Lifts right foot, taps down 3 times with body bounce, playful smile |
| `left-cheek` | `leftCheekSmile` | `+2` | `"You're funny!"` | Leans into left cheek, joyful squint (`^ ^`), rosy blush, gentle giggle |
| `right-cheek` | `rightCheekSmile` | `+2` | `"You're funny!"` | Leans into right cheek, joyful squint (`^ ^`), rosy blush, gentle giggle |
| `stomach` / `tummy` | `tummyHappy` | `+2` | `"I love you!"` | Playful belly bounce, warm smile, rosy cheeks, body sway + soft giggle |
| `left-eye` | `leftEyeReaction` | `-2` | `"That hurts!"` | Immediate left eye blink, knitted confused eyebrows, gentle lean back |
| `right-eye` | `rightEyeReaction` | `-2` | `"That hurts!"` | Immediate right eye blink, knitted confused eyebrows, gentle lean back |
| `left-ear` | `leftEarGloomy` | `-2` | `"No, careful!"` | Tilts head away right, lowered eyebrows, brief gloomy/cautious expression |
| `right-ear` | `rightEarGloomy` | `-2` | `"No, careful!"` | Tilts head away left, lowered eyebrows, brief gloomy/cautious expression |
| `mouth` | `mouthShock` | `-2` | `"Huh? Weird!"` | Round `"O"` surprised mouth, wide eyes, arched eyebrows, head recoil |
| `nose` | `nose-boop` | `+2` | `"Boop!"` | Playful cartoon nose boop recoil and bounce |
| `head` | `head-tilt` | `+2` | `"Hi, friend!"` | Inquisitive, friendly head tilt |

---

## 5. Development, Deployment & Build Commands

- **Install dependencies:**
  ```powershell
  npm install
  ```
- **Start local dev server:**
  ```powershell
  npm run dev
  ```
- **Type-check & build production bundle:**
  ```powershell
  npm run build
  ```
- **Deploy to Firebase Hosting:**
  ```powershell
  firebase deploy --only hosting
  ```
- **Build & download Android APK (via GitHub Actions):**
  Push changes to `main`, wait for the `Build Android APK` workflow to finish, and download the artifact:
  ```powershell
  gh run list --limit 1
  gh run download <RUN_ID> --dir ./apk-download
  Move-Item -Path ./apk-download/*/*.apk -Destination ./hunnybear-game.apk -Force
  Remove-Item -Path ./apk-download -Recurse -Force
  ```

---

# Antigravity 2.0 - Project Configuration

## 1. Global Project Rules
- **Engine/Framework:** Unity 2023.3 (C#)
- **Architecture:** Use Entity Component System (ECS) where possible.
- **Formatting:** Adhere to standard C# naming conventions (PascalCase for classes, camelCase for variables).
- **Restrictions:** Never modify `Core/Physics/` without explicit user approval. Do not add third-party plugins without asking.

## 2. Environment Context
- Scripts are located in `Assets/Scripts/`.
- UI Prefabs are located in `Assets/Prefabs/UI/`.
- All database connections must route through `Assets/Scripts/Services/DatabaseManager.cs`.

## 3. Agent Roster

### Agent: GameplayCoder
- **Role:** Handles player mechanics, movement, and physics interactions.
- **Allowed Directories:** `Assets/Scripts/Player/`, `Assets/Scripts/Mechanics/`
- **Behavior:** Prioritize frame-rate performance. Use Raycasting for collisions instead of rigidbodies where applicable.

### Agent: UISpecialist
- **Role:** Builds menus, HUD elements, and inventory screens.
- **Allowed Directories:** `Assets/Scripts/UI/`, `Assets/Prefabs/UI/`
- **Behavior:** Ensure all UI elements are anchored dynamically for multiple screen resolutions.

### Agent: QA_Bot
- **Role:** Runs automated tests and code reviews on newly generated scripts.
- **Allowed Directories:** `Assets/Tests/`
- **Behavior:** Look for memory leaks in update loops and ensure all public methods have proper null checks.

