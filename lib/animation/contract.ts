/** Binding contract v1. Keep these names identical in the Rive editor. */
export const ARTBOARD = 'Clumsy';
export const STATE_MACHINE = 'ClumsyController';
export const coreStates = ['idle','listen','think','speak','investigate','learn','celebrate','unsure'] as const;
export const emotions = ['neutral','curious','encouraging','uncertain'] as const;
export const gestures = ['none','wave','nod','shrug','point'] as const;
export const inputSpec = {
  coreState: { type: 'number', min: 0, max: 7, default: 0 },
  emotion: { type: 'number', min: 0, max: 3, default: 0 },
  gesture: { type: 'number', min: 0, max: 4, default: 0 },
  mouthOpen: { type: 'number', min: 0, max: 1, default: 0 },
  lookX: { type: 'number', min: -1, max: 1, default: 0 },
  lookY: { type: 'number', min: -1, max: 1, default: 0 },
  energy: { type: 'number', min: 0, max: 1, default: .5 },
  motionScale: { type: 'number', min: 0, max: 1, default: 1 },
  reducedMotion: { type: 'boolean', default: false },
  fxSpark: { type: 'trigger' },
  fxQuestion: { type: 'trigger' },
  fxCheck: { type: 'trigger' },
} as const;
export type InputName = keyof typeof inputSpec;
export type NumericName = { [K in InputName]: typeof inputSpec[K]['type'] extends 'number' ? K : never }[InputName];
export type TriggerName = 'fxSpark' | 'fxQuestion' | 'fxCheck';
export const numericNames = Object.keys(inputSpec).filter(k => inputSpec[k as InputName].type === 'number') as NumericName[];
export const triggerNames: TriggerName[] = ['fxSpark','fxQuestion','fxCheck'];
export type CharacterInputs = Record<NumericName, number> & { reducedMotion: boolean } & Record<TriggerName, number>;
export const defaults: CharacterInputs = { coreState:0, emotion:0, gesture:0, mouthOpen:0, lookX:0, lookY:0, energy:.5, motionScale:1, reducedMotion:false, fxSpark:0, fxQuestion:0, fxCheck:0 };
export function clampInput(name: NumericName, value: number) {
  const s = inputSpec[name];
  const v = Number.isFinite(value) ? Math.min(s.max, Math.max(s.min, value)) : s.default;
  return ['coreState','emotion','gesture'].includes(name) ? Math.round(v) : v;
}
export const characterEvents = [
  ...coreStates.map(s => `core_${s}_enter`),
  'core_learn_done', 'core_celebrate_done',
  ...gestures.slice(1).map(s => `gesture_${s}_done`),
  ...triggerNames.map(s => `${s}_done`),
];
