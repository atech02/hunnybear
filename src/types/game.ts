export type EmotionType = 'happy' | 'sad' | 'surprised' | 'uncomfortable' | 'calm';

export type BodyRegion = 
  | 'head'
  | 'left-eye'
  | 'right-eye'
  | 'nose'
  | 'left-ear'
  | 'right-ear'
  | 'mouth'
  | 'left-cheek'
  | 'right-cheek'
  | 'stomach'
  | 'tummy'
  | 'left-hand'
  | 'right-hand'
  | 'left-foot'
  | 'right-foot';

export type AnimationState = 
  | 'idle'
  | 'wave-left'
  | 'wave-right'
  | 'foot-tap-left'
  | 'foot-tap-right'
  | 'tummy-love'
  | 'tummy-giggle'
  | 'nose-boop'
  | 'ear-surprise-left'
  | 'ear-surprise-right'
  | 'eye-blink-left'
  | 'eye-blink-right'
  | 'cheek-smile-left'
  | 'cheek-smile-right'
  | 'mouth-surprise'
  | 'head-tilt'
  // Legacy / 2D animation states for full backward compatibility
  | 'eye-hurt'
  | 'nose-wiggle'
  | 'ear-sensitive'
  | 'cheek-gentle'
  | 'tummy-laugh'
  | 'calm-breath';

export type MouthShape = 'closed' | 'slightly-open' | 'wide-open' | 'smile' | 'frown' | 'surprise-o';

export interface InteractionFeedback {
  region: BodyRegion;
  emotion: EmotionType;
  scoreChange: number;
  spokenDialogue: string;
  educationalMessage?: string;
  soundType: 'wave' | 'foot-tap' | 'tummy-love' | 'giggle' | 'boop' | 'ear-surprise' | 'eye-gentle' | 'sweet' | 'surprise' | 'head-tilt' | 'tickle' | 'mouth-space' | 'cheek-gentle';
  animationState: AnimationState;
}

export interface FeelingOption {
  id: string;
  label: string;
  emoji: string;
  bearResponse: string;
  bearEmotion: EmotionType;
}
