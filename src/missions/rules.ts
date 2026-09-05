import { bodies, planets } from '../content/bodies';

export type MissionKind = 'visit' | 'quiz' | 'speed';
export interface Mission { id: string; title: string; description: string; kind: MissionKind; target: string[]; reward: number; icon: string }
export const missions: Mission[] = [
  { id: 'hello-earth', title: 'Olá, planeta Terra!', description: 'Visite a Terra e conheça o nosso lar.', kind: 'visit', target: ['earth'], reward: 20, icon: '🌍' },
  { id: 'rocky', title: 'A turma das rochas', description: 'Explore Mercúrio, Vênus, Terra e Marte.', kind: 'visit', target: ['mercury', 'venus', 'earth', 'mars'], reward: 40, icon: '🪨' },
  { id: 'moonwalk', title: 'Um pulinho na Lua', description: 'Visite a Terra e depois a nossa Lua.', kind: 'visit', target: ['earth', 'moon'], reward: 30, icon: '🌙' },
  { id: 'time-traveler', title: 'Piloto do tempo', description: 'Experimente as 5 velocidades do tempo.', kind: 'speed', target: ['0', '1', '2', '3', '4'], reward: 30, icon: '⏱️' },
  { id: 'planet-expert', title: 'Cada planeta tem um nome', description: 'Acerte o desafio de cada um dos 8 planetas.', kind: 'quiz', target: planets.map(p => p.id), reward: 80, icon: '🪐' },
  { id: 'galilean', title: 'As vizinhas de Júpiter', description: 'Conheça Io, Europa, Ganimedes e Calisto.', kind: 'visit', target: ['io', 'europa', 'ganymede', 'callisto'], reward: 50, icon: '🔭' },
  { id: 'moon-expert', title: 'Detetive das luas', description: 'Acerte os nomes de Lua, Titã, Europa e Tritão.', kind: 'quiz', target: ['moon', 'titan', 'europa', 'triton'], reward: 60, icon: '🕵️' },
  { id: 'grand-tour', title: 'Uma grande viagem', description: 'Visite os 8 planetas do Sistema Solar.', kind: 'visit', target: planets.map(p => p.id), reward: 100, icon: '🚀' },
];

export interface Progress { visited: string[]; correct: string[]; speeds: string[] }
export const emptyProgress = (): Progress => ({ visited: [], correct: [], speeds: [] });
export function missionProgress(mission: Mission, progress: Progress): number {
  const items = mission.kind === 'visit' ? progress.visited : mission.kind === 'quiz' ? progress.correct : progress.speeds;
  return mission.target.filter(id => items.includes(id)).length;
}
export function completedMissions(progress: Progress): Mission[] {
  return missions.filter(m => missionProgress(m, progress) === m.target.length);
}
export function calculateXP(progress: Progress): number {
  const visits = new Set(progress.visited.filter(id => bodies.some(b => b.id === id))).size;
  const answers = new Set(progress.correct.filter(id => bodies.some(b => b.id === id))).size;
  return visits * 10 + answers * 15 + completedMissions(progress).reduce((sum, m) => sum + m.reward, 0);
}
export function recordProgress(progress: Progress, kind: 'visited' | 'correct' | 'speeds', id: string): Progress {
  const valid = kind === 'speeds' ? ['0', '1', '2', '3', '4'].includes(id) : bodies.some(b => b.id === id);
  if (!valid || progress[kind].includes(id)) return progress;
  return { ...progress, [kind]: [...progress[kind], id] };
}
export function sanitizeProgress(input: unknown): Progress {
  const clean = emptyProgress();
  if (!input || typeof input !== 'object') return clean;
  for (const kind of ['visited', 'correct', 'speeds'] as const) {
    const values = (input as Partial<Progress>)[kind];
    if (Array.isArray(values)) for (const id of values) if (typeof id === 'string') Object.assign(clean, recordProgress(clean, kind, id));
  }
  return clean;
}
