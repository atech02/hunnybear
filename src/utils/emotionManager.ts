import type { BodyRegion, EmotionType, InteractionFeedback, FeelingOption } from '../types/game';

export const INTERACTION_MAP: Record<BodyRegion, InteractionFeedback> = {
  'head': {
    region: 'head',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Hi, friend!',
    soundType: 'head-tilt',
    animationState: 'head-tilt',
  },
  'left-eye': {
    region: 'left-eye',
    emotion: 'uncomfortable',
    scoreChange: -2,
    spokenDialogue: 'That hurts!',
    soundType: 'eye-gentle',
    animationState: 'leftEyeReaction',
  },
  'right-eye': {
    region: 'right-eye',
    emotion: 'uncomfortable',
    scoreChange: -2,
    spokenDialogue: 'That hurts!',
    soundType: 'eye-gentle',
    animationState: 'rightEyeReaction',
  },
  'nose': {
    region: 'nose',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Boop!',
    soundType: 'boop',
    animationState: 'nose-boop',
  },
  'left-ear': {
    region: 'left-ear',
    emotion: 'uncomfortable',
    scoreChange: -2,
    spokenDialogue: 'No, careful!',
    soundType: 'ear-surprise',
    animationState: 'leftEarGloomy',
  },
  'right-ear': {
    region: 'right-ear',
    emotion: 'uncomfortable',
    scoreChange: -2,
    spokenDialogue: 'No, careful!',
    soundType: 'ear-surprise',
    animationState: 'rightEarGloomy',
  },
  'mouth': {
    region: 'mouth',
    emotion: 'surprised',
    scoreChange: -2,
    spokenDialogue: 'Huh? Weird!',
    soundType: 'surprise',
    animationState: 'mouthShock',
  },
  'left-cheek': {
    region: 'left-cheek',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: "You're funny!",
    soundType: 'sweet',
    animationState: 'leftCheekSmile',
  },
  'right-cheek': {
    region: 'right-cheek',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: "You're funny!",
    soundType: 'sweet',
    animationState: 'rightCheekSmile',
  },
  'stomach': {
    region: 'stomach',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'I love you!',
    soundType: 'giggle',
    animationState: 'tummyHappy',
  },
  'tummy': {
    region: 'tummy',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'I love you!',
    soundType: 'giggle',
    animationState: 'tummyHappy',
  },
  'left-hand': {
    region: 'left-hand',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Hi, friend!',
    soundType: 'wave',
    animationState: 'leftHandWave',
  },
  'right-hand': {
    region: 'right-hand',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Hi, friend!',
    soundType: 'wave',
    animationState: 'rightHandWave',
  },
  'left-foot': {
    region: 'left-foot',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Hey, you!',
    soundType: 'foot-tap',
    animationState: 'leftFootTap',
  },
  'right-foot': {
    region: 'right-foot',
    emotion: 'happy',
    scoreChange: 2,
    spokenDialogue: 'Hey, you!',
    soundType: 'foot-tap',
    animationState: 'rightFootTap',
  },
};

export const getInteractionFeedback = (region: BodyRegion): InteractionFeedback => {
  const base = INTERACTION_MAP[region];
  if (!base) return INTERACTION_MAP['head'];

  if (region === 'stomach' || region === 'tummy') {
    return {
      ...base,
      spokenDialogue: 'I love you!',
      soundType: 'giggle',
      animationState: 'tummyHappy',
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
