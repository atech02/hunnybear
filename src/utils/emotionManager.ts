import type { BodyRegion, EmotionType, InteractionFeedback, FeelingOption } from '../types/game';

export const INTERACTION_MAP: Record<BodyRegion, InteractionFeedback> = {
  'head': {
    region: 'head',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Hello, you!',
    soundType: 'head-tilt',
    animationState: 'head-tilt',
  },
  'left-eye': {
    region: 'left-eye',
    emotion: 'uncomfortable',
    scoreChange: -2,
    spokenDialogue: 'Oops! Be gentle!',
    soundType: 'eye-gentle',
    animationState: 'eye-blink-left',
  },
  'right-eye': {
    region: 'right-eye',
    emotion: 'uncomfortable',
    scoreChange: -2,
    spokenDialogue: 'Oops! Be gentle!',
    soundType: 'eye-gentle',
    animationState: 'eye-blink-right',
  },
  'nose': {
    region: 'nose',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Boop! Hee-hee!',
    soundType: 'boop',
    animationState: 'nose-boop',
  },
  'left-ear': {
    region: 'left-ear',
    emotion: 'surprised',
    scoreChange: -2,
    spokenDialogue: 'Oh! My ear!',
    soundType: 'ear-surprise',
    animationState: 'ear-surprise-left',
  },
  'right-ear': {
    region: 'right-ear',
    emotion: 'surprised',
    scoreChange: -2,
    spokenDialogue: 'Oh! My ear!',
    soundType: 'ear-surprise',
    animationState: 'ear-surprise-right',
  },
  'mouth': {
    region: 'mouth',
    emotion: 'surprised',
    scoreChange: -2,
    spokenDialogue: 'Oh! Surprise!',
    soundType: 'surprise',
    animationState: 'mouth-surprise',
  },
  'left-cheek': {
    region: 'left-cheek',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'So sweet!',
    soundType: 'sweet',
    animationState: 'cheek-smile-left',
  },
  'right-cheek': {
    region: 'right-cheek',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'So sweet!',
    soundType: 'sweet',
    animationState: 'cheek-smile-right',
  },
  'stomach': {
    region: 'stomach',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'I love you!',
    soundType: 'tummy-love',
    animationState: 'tummy-love',
  },
  'tummy': {
    region: 'tummy',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'I love you!',
    soundType: 'tummy-love',
    animationState: 'tummy-love',
  },
  'left-hand': {
    region: 'left-hand',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Hi, friend!',
    soundType: 'wave',
    animationState: 'wave-left',
  },
  'right-hand': {
    region: 'right-hand',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Hi, friend!',
    soundType: 'wave',
    animationState: 'wave-right',
  },
  'left-foot': {
    region: 'left-foot',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Tap, tap!',
    soundType: 'foot-tap',
    animationState: 'foot-tap-left',
  },
  'right-foot': {
    region: 'right-foot',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Tap, tap!',
    soundType: 'foot-tap',
    animationState: 'foot-tap-right',
  },
};

export const getInteractionFeedback = (region: BodyRegion): InteractionFeedback => {
  const base = INTERACTION_MAP[region];
  if (!base) return INTERACTION_MAP['head'];

  // For stomach/tummy: occasionally add cute giggle variation while keeping "I love you!"
  if (region === 'stomach' || region === 'tummy') {
    const isGiggle = Math.random() < 0.28;
    return {
      ...base,
      spokenDialogue: isGiggle ? 'Hee-hee! I love you!' : 'I love you!',
      animationState: isGiggle ? 'tummy-giggle' : 'tummy-love',
    };
  }

  return base;
};

export const FEELING_OPTIONS: FeelingOption[] = [
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    bearResponse: "I'm happy too! Smiling helps us share our joy!",
    bearEmotion: 'happy',
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    bearResponse: "It's okay to feel sad. Would a gentle breath and a warm hug help?",
    bearEmotion: 'sad',
  },
  {
    id: 'surprised',
    label: 'Surprised',
    emoji: '😮',
    bearResponse: "Whoa! Surprises can be exciting or unexpected. Surprised is a feeling too!",
    bearEmotion: 'surprised',
  },
  {
    id: 'calm',
    label: 'Calm',
    emoji: '😌',
    bearResponse: "I feel calm now too. Let's take a nice gentle breath together.",
    bearEmotion: 'calm',
  },
];

export const EMOTION_BADGES: Record<EmotionType, { label: string; icon: string; bg: string; text: string }> = {
  happy: {
    label: 'Happy',
    icon: '😊',
    bg: 'bg-amber-100 border-amber-300',
    text: 'text-amber-900',
  },
  sad: {
    label: 'Sad',
    icon: '😢',
    bg: 'bg-blue-100 border-blue-300',
    text: 'text-blue-900',
  },
  surprised: {
    label: 'Surprised',
    icon: '😮',
    bg: 'bg-orange-100 border-orange-300',
    text: 'text-orange-900',
  },
  uncomfortable: {
    label: 'Uncomfortable',
    icon: '😟',
    bg: 'bg-rose-100 border-rose-300',
    text: 'text-rose-900',
  },
  calm: {
    label: 'Calm',
    icon: '😌',
    bg: 'bg-emerald-100 border-emerald-300',
    text: 'text-emerald-900',
  },
};
