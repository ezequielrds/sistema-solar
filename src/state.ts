import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { bodyById } from './content/bodies';
import { emptyProgress, recordProgress, sanitizeProgress, type Progress } from './missions/rules';
import { detectQuality, type Quality, type QualitySetting } from './performance/quality';

export const speeds = [
  { name: 'Observar', rate: .01, label: '14 min / segundo', short: 'Devagar' },
  { name: 'Girar', rate: .25, label: '6 horas / segundo', short: 'Rotação' },
  { name: 'Viajar', rate: 2, label: '2 dias / segundo', short: 'Luas' },
  { name: 'Acelerar', rate: 30, label: '30 dias / segundo', short: 'Planetas' },
  { name: 'Disparar', rate: 365.256, label: '1 ano / segundo', short: 'Anos' },
] as const;

// Mutable simulation clock stays outside React renders and persistent storage.
export const simulation = { days: 0, visible: true };

interface Store {
  selected: string;
  view: 'system' | 'local' | 'moon';
  section: 'explore' | 'missions' | 'passport';
  modal: 'help' | 'settings' | 'credits' | 'quiz' | null;
  quizId: string | null;
  speed: number;
  paused: boolean;
  labels: boolean;
  paths: boolean;
  sound: boolean;
  quality: QualitySetting;
  autoQuality: Quality;
  renderer: 'webgl' | 'webgpu';
  rendererActive: string;
  resetCamera: number;
  zoomRequest: number;
  progress: Progress;
  storageError: boolean;
  select: (id: string, close?: boolean) => void;
  overview: () => void;
  setSpeed: (speed: number) => void;
  setSection: (section: Store['section']) => void;
  setModal: (modal: Store['modal']) => void;
  startQuiz: (id?: string) => void;
  answer: (id: string) => void;
  setQuality: (quality: QualitySetting) => void;
}

const storage = {
  getItem: (key: string) => { try { return localStorage.getItem(key); } catch { return null; } },
  setItem: (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { queueMicrotask(() => { if (!useStore.getState().storageError) useStore.setState({ storageError: true }); }); } },
  removeItem: (key: string) => { try { localStorage.removeItem(key); } catch { /* Volatile mode remains playable. */ } },
};

export const useStore = create<Store>()(persist((set, get) => ({
  selected: 'sun', view: 'system', section: 'explore', modal: null, quizId: null,
  speed: 2, paused: matchMedia('(prefers-reduced-motion: reduce)').matches,
  labels: true, paths: true, sound: false, quality: 'auto', autoQuality: detectQuality(),
  renderer: 'webgl', rendererActive: 'WebGL 2', resetCamera: 0, zoomRequest: 0, progress: emptyProgress(), storageError: false,
  select: (id, close = false) => {
    if (!bodyById[id] && id !== 'belt') return;
    set(s => ({ selected: id, section: 'explore', view: close ? (bodyById[id]?.kind === 'moon' ? 'moon' : 'local') : 'system', resetCamera: s.resetCamera + 1, progress: recordProgress(s.progress, 'visited', id) }));
  },
  overview: () => set(s => ({ view: 'system', selected: 'sun', section: 'explore', resetCamera: s.resetCamera + 1 })),
  setSpeed: (speed) => { if (Number.isInteger(speed) && speed >= 0 && speed < speeds.length) set(s => ({ speed, progress: recordProgress(s.progress, 'speeds', String(speed)) })); },
  setSection: (section) => set({ section }),
  setModal: (modal) => set({ modal }),
  startQuiz: (id) => set({ quizId: id ?? null, modal: 'quiz' }),
  answer: (id) => set(s => ({ progress: recordProgress(s.progress, 'correct', id) })),
  setQuality: (quality) => set({ quality, autoQuality: quality === 'auto' ? detectQuality() : get().autoQuality }),
}), {
  name: 'orbita-explorador-v1',
  version: 1,
  storage: createJSONStorage(() => storage),
  partialize: (s) => ({ progress: s.progress, sound: s.sound, quality: s.quality, labels: s.labels, paths: s.paths }),
  merge: (saved, current) => {
    const data = (saved ?? {}) as Partial<Store>;
    return { ...current, progress: sanitizeProgress(data.progress), sound: data.sound === true, labels: data.labels !== false, paths: data.paths !== false, quality: ['auto', 'low', 'medium', 'high'].includes(data.quality ?? '') ? data.quality! : 'auto' };
  },
}));
