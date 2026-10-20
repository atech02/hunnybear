import os
import shutil
import sys
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print(
        "[AG-Debug] Missing 'openai' package. Install it first with:\n"
        "  pip install --upgrade openai"
    )
    sys.exit(1)


def load_dotenv_if_present(dotenv_path: Path) -> None:
    """Load key=value pairs from a local .env file without requiring third-party packages."""
    if not dotenv_path.exists():
        return
    for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


# Primary web/PWA asset folder and secondary standalone audio folder
PUBLIC_AUDIO_DIR = Path("public/audio/hunny_bear")
LEGACY_OUTPUT_DIR = Path("hunny_bear_audio")

# Recommended voices for a friendly bear:
# - "fable" (playful, warm, animated storybook tone)
# - "nova" (upbeat, lively)
VOICE_ACTOR = "fable"
SPEECH_MODEL = "tts-1-hd"

# Touch events and dialogue lines (7 core lines + separate Mouth line)
AUDIO_LINES = [
    {
        "filename": "hunny_hand_wave.wav",
        "action": "Hand Click",
        "text": "Hi, friend!",
    },
    {
        "filename": "hunny_feet_tap.wav",
        "action": "Feet Click",
        "text": "Hey, you!",
    },
    {
        "filename": "hunny_cheeks_smile.wav",
        "action": "Cheeks Click",
        "text": "You're funny!",
    },
    {
        "filename": "hunny_eye_hurt.wav",
        "action": "Eye Click",
        "text": "Ouch! That hurts.",
    },
    {
        "filename": "hunny_ears_careful.wav",
        "action": "Ears Click",
        "text": "No, careful!",
    },
    {
        "filename": "hunny_nose_weird.wav",
        "action": "Nose Click",
        "text": "Huh, weird!",
    },
    {
        "filename": "hunny_stomach_love.wav",
        "action": "Stomach Click",
        "text": "I love you!",
    },
    {
        "filename": "hunny_mouth_surprise.wav",
        "action": "Mouth Click",
        "text": "Oh! My mouth!",
    },
]


def generate_voice_files() -> None:
    load_dotenv_if_present(Path(".env"))
    load_dotenv_if_present(Path(".env.local"))

    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key or api_key == "your_openai_api_key_here":
        print(
            "[AG-Debug] OPENAI_API_KEY is not configured.\n"
            "Set it in your terminal before running this script:\n"
            "  PowerShell: $env:OPENAI_API_KEY=\"sk-...\"\n"
            "  Or add OPENAI_API_KEY=sk-... to a local .env file (git-ignored)."
        )
        sys.exit(1)

    PUBLIC_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    LEGACY_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    client = OpenAI(api_key=api_key)
    print(f"[AG-Debug] Generating {len(AUDIO_LINES)} voice lines for Hunny Bear...\n")

    for item in AUDIO_LINES:
        primary_path = PUBLIC_AUDIO_DIR / item["filename"]
        mirror_path = LEGACY_OUTPUT_DIR / item["filename"]
        print(f"[{item['action']}] Generating: \"{item['text']}\" -> {primary_path}")

        # Use non-deprecated streaming response API from openai>=1.14
        with client.audio.speech.with_streaming_response.create(
            model=SPEECH_MODEL,
            voice=VOICE_ACTOR,
            input=item["text"],
            response_format="wav",
        ) as response:
            response.stream_to_file(primary_path)

        shutil.copy2(primary_path, mirror_path)

    print(f"\n[AG-Debug] All WAV files saved to '{PUBLIC_AUDIO_DIR.resolve()}' and '{LEGACY_OUTPUT_DIR.resolve()}'!")


if __name__ == "__main__":
    generate_voice_files()
