export type EmotionType = 'happy' | 'sad' | 'surprised' | 'uncomfortable' | 'calm';

export type BodyRegion = 
  | 'left-eye'
  | 'right-eye'
  | 'nose'
  | 'left-ear'
  | 'right-ear'
  | 'mouth'
  | 'left-cheek'
  | 'right-cheek'
  | 'tummy'
  | 'left-hand'
  | 'right-hand'
  | 'left-foot'
  | 'right-foot';

export type AnimationState = 
  | 'idle'
  | 'speaking'
  | 'eye-hurt'
  | 'nose-wiggle'
  | 'ear-sensitive'
  | 'mouth-surprise'
  | 'cheek-gentle'
  | 'tummy-laugh'
  | 'wave-left'
  | 'wave-right'
  | 'foot-tap-left'
  | 'foot-tap-right'
  | 'calm-breath'
  | 'cuddle';

export type MouthShape = 'closed' | 'slightly-open' | 'wide-open' | 'smile' | 'frown' | 'surprise-o';

export interface InteractionFeedback {
  region: BodyRegion;
  emotion: EmotionType;
  scoreChange: number;
  spokenDialogue: string;
  educationalMessage: string;
  soundType: 'tickle' | 'boop' | 'ear-sensitive' | 'mouth-space' | 'cheek-gentle' | 'wave' | 'foot-tap' | 'celebrate' | 'breath';
  animationState: AnimationState;
}

export interface FeelingOption {
  id: EmotionType;
  label: string;
  emoji: string;
  bearResponse: string;
  bearEmotion: EmotionType;
}
