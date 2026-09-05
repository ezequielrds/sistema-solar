export type Quality = 'low' | 'medium' | 'high';
export type QualitySetting = Quality | 'auto';
export const qualityPresets = {
  low: { dpr: 1, segments: 24, asteroids: 350, stars: 650 },
  medium: { dpr: 1.35, segments: 40, asteroids: 850, stars: 1400 },
  high: { dpr: 1.75, segments: 64, asteroids: 1600, stars: 2400 },
} as const;
export const qualityNames = { low: 'Econômica', medium: 'Equilibrada', high: 'Caprichada', auto: 'Automática' };
export function detectQuality(): Quality {
  if (typeof navigator === 'undefined') return 'medium';
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (memory <= 2 || navigator.hardwareConcurrency <= 2) return 'low';
  if (memory >= 8 && navigator.hardwareConcurrency >= 8 && !matchMedia('(pointer: coarse)').matches) return 'high';
  return 'medium';
}
