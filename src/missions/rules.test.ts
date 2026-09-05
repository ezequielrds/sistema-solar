import { describe, expect, it } from 'vitest';
import { calculateXP, completedMissions, emptyProgress, missionProgress, missions, recordProgress, sanitizeProgress } from './rules';
import { bodies, planets, moons } from '../content/bodies';
import { questions } from '../content/questions';

describe('Mission and reward rules', () => {
  it('starts without rewards or achievements', () => {
    expect(calculateXP(emptyProgress())).toBe(0); expect(completedMissions(emptyProgress())).toEqual([]);
  });
  it('awards the first Earth visit and its mission once', () => {
    const progress = recordProgress(emptyProgress(), 'visited', 'earth');
    expect(calculateXP(progress)).toBe(30);
    expect(recordProgress(progress, 'visited', 'earth')).toBe(progress);
    expect(completedMissions(progress).map(m => m.id)).toEqual(['hello-earth']);
  });
  it('does not mutate input progress', () => {
    const original = emptyProgress(); recordProgress(original, 'visited', 'earth'); expect(original.visited).toEqual([]);
  });
  it('requires every distinct target, irrespective of visit order', () => {
    const rocky = missions.find(m => m.id === 'rocky')!;
    let progress = emptyProgress();
    for (const id of ['mars', 'venus', 'earth', 'earth']) progress = recordProgress(progress, 'visited', id);
    expect(missionProgress(rocky, progress)).toBe(3); expect(completedMissions(progress)).not.toContain(rocky);
    progress = recordProgress(progress, 'visited', 'mercury'); expect(completedMissions(progress)).toContain(rocky);
  });
  it('requires all five speeds and does not reward repeated toggles', () => {
    let progress = emptyProgress();
    for (const id of ['0', '1', '2', '3', '3']) progress = recordProgress(progress, 'speeds', id);
    expect(completedMissions(progress)).toHaveLength(0);
    progress = recordProgress(progress, 'speeds', '4');
    expect(completedMissions(progress).map(m => m.id)).toEqual(['time-traveler']);
    expect(calculateXP(progress)).toBe(30);
  });
  it('treats moon and planet name learning as independent achievements', () => {
    let progress = emptyProgress();
    for (const planet of planets) progress = recordProgress(progress, 'correct', planet.id);
    expect(completedMissions(progress).map(m => m.id)).toEqual(['planet-expert']);
    expect(calculateXP(progress)).toBe(8 * 15 + 80);
    for (const id of ['moon', 'titan', 'europa', 'triton']) progress = recordProgress(progress, 'correct', id);
    expect(completedMissions(progress).map(m => m.id)).toContain('moon-expert');
  });
  it('ignores invalid progress keys, IDs, and duplicate rewards', () => {
    const progress = emptyProgress();
    expect(recordProgress(progress, 'visited', 'pluto')).toBe(progress);
    expect(recordProgress(progress, 'speeds', '5')).toBe(progress);
    expect(calculateXP({ visited: ['earth', 'earth', 'invalid'], correct: ['mars', 'mars'], speeds: [] })).toBe(45);
  });
  it.each([null, false, 'bad', 123, [], { visited: 'earth' }])('recovers safely from malformed saved progress %s', value => expect(sanitizeProgress(value)).toEqual(emptyProgress()));
  it('sanitizes persisted data without trusting stored stars', () => {
    expect(sanitizeProgress({ visited: ['earth', 'earth', null, 'hacked'], correct: ['mars', 100], speeds: ['0', '10'], xp: 999999 })).toEqual({ visited: ['earth'], correct: ['mars'], speeds: ['0'] });
  });
  it('can complete all missions with valid play', () => {
    const progress = { visited: bodies.map(b => b.id), correct: questions.map(q => q.id), speeds: ['0', '1', '2', '3', '4'] };
    expect(completedMissions(progress)).toHaveLength(missions.length);
  });
});
describe('Content integrity', () => {
  it('has a unique valid answer and question for every playable planet and moon', () => {
    expect(new Set(questions.map(q => q.id)).size).toBe(questions.length);
    for (const body of [...planets, ...moons]) {
      const q = questions.find(q => q.id === body.id)!;
      expect(q).toBeDefined(); expect(q.options.filter(o => o === q.answer)).toHaveLength(1);
      expect(new Set(q.options).size).toBe(q.options.length); expect(q.answer).toBe(body.name);
    }
  });
  it('has eight planets and known parents for every moon', () => {
    expect(planets).toHaveLength(8);
    for (const moon of moons) expect(planets.some(p => p.id === moon.parent)).toBe(true);
  });
});
