import { describe, expect, it } from 'vitest';
import { normalizeAngle, orbitalPosition, orbitPoints, rotationAngle, solveKepler, TAU } from './kepler';
import { planets, moons } from '../content/bodies';

const circle = { period: 100, eccentricity: 0, inclination: 0, meanAnomaly: 0, periapsis: 0, node: 0 };
const length = (p: number[]) => Math.hypot(...p);
describe('Kepler solver', () => {
  it.each([0, .0167, .2056, .8, .99, .999])('satisfies Kepler equation at e=%s', eccentricity => {
    for (const mean of [0, 1e-7, .1, 1.2, Math.PI, 6.28, -15, 1000]) {
      const E = solveKepler(mean, eccentricity);
      expect(E - eccentricity * Math.sin(E)).toBeCloseTo(normalizeAngle(mean), 9);
    }
  });
  it.each([-1, 1, 2, NaN, Infinity])('rejects invalid eccentricity %s', e => expect(() => solveKepler(1, e)).toThrow(RangeError));
  it('rejects non-finite anomaly', () => expect(() => solveKepler(Infinity, .2)).toThrow(RangeError));
});
describe('Simplified orbital positions', () => {
  it('uses the north-up Three.js plane and quarter orbit', () => {
    const p = orbitalPosition(circle, 25, 10);
    expect(p[0]).toBeCloseTo(0, 10); expect(p[1]).toBeCloseTo(0, 10); expect(p[2]).toBeCloseTo(-10, 10);
  });
  it('keeps circular distance constant', () => {
    for (let t = 0; t < 100; t++) expect(length(orbitalPosition(circle, t, 4))).toBeCloseTo(4, 10);
  });
  it('places perihelion and aphelion at a(1-e) and a(1+e)', () => {
    const e = { ...circle, eccentricity: .2 };
    expect(length(orbitalPosition(e, 0, 10))).toBeCloseTo(8, 10);
    expect(length(orbitalPosition(e, 50, 10))).toBeCloseTo(12, 10);
  });
  it('moves faster near perihelion', () => {
    const e = { ...circle, eccentricity: .4 };
    const step = (day: number) => { const a = orbitalPosition(e, day, 10), b = orbitalPosition(e, day + .001, 10); return Math.hypot(...a.map((v, i) => v - b[i])); };
    expect(step(0)).toBeGreaterThan(step(50));
  });
  it('preserves 3D distance after inclination, node and periapsis transforms', () => {
    const a = orbitalPosition({ ...circle, eccentricity: .3 }, 33, 10);
    const b = orbitalPosition({ ...circle, eccentricity: .3, inclination: 60, node: 87, periapsis: 23 }, 33, 10);
    expect(length(a)).toBeCloseTo(length(b), 10); expect(Math.abs(b[1])).toBeGreaterThan(.1);
  });
  it.each([...planets, ...moons].map(b => [b.name, b] as const))('%s returns to its starting point after one real period', (_, body) => {
    const a = orbitalPosition(body.orbit, 0, body.distance), b = orbitalPosition(body.orbit, body.orbit.period, body.distance);
    a.forEach((value, i) => expect(b[i]).toBeCloseTo(value, 8));
  });
  it('keeps physical ratios despite educational distance scaling', () => {
    const earth = planets.find(b => b.id === 'earth')!;
    const a = orbitalPosition(earth.orbit, 50, 1), b = orbitalPosition(earth.orbit, 50, 12);
    a.forEach((v, i) => expect(b[i]).toBeCloseTo(v * 12, 10));
  });
  it('handles very long and negative time without drift after whole periods', () => {
    const p = orbitalPosition(circle, 1e8 + 25, 10), expected = orbitalPosition(circle, -75, 10);
    p.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 8));
  });
  it('closes the visual orbit path', () => {
    const points = orbitPoints(planets[0].orbit, 8);
    expect(points).toHaveLength(257);
    points[0].forEach((v, i) => expect(points[256][i]).toBeCloseTo(v, 10));
  });
  it('shows retrograde motion for a >90 degree inclination', () => {
    expect(orbitalPosition({ ...circle, inclination: 156.865 }, 25, 10)[2]).toBeGreaterThan(0);
  });
  it('rejects invalid periods and distances', () => {
    expect(() => orbitalPosition({ ...circle, period: 0 }, 10, 5)).toThrow();
    expect(() => orbitalPosition(circle, NaN, 5)).toThrow();
    expect(() => orbitalPosition(circle, 1, -5)).toThrow();
  });
});
describe('Rotation', () => {
  it('rotates once in the specified sidereal hours', () => {
    expect(rotationAngle(.25, 24)).toBeCloseTo(Math.PI / 2, 10);
    expect(rotationAngle(1, 24)).toBeCloseTo(0, 10);
  });
  it('reverses direction for Venus without reversing the simulation clock', () => {
    expect(rotationAngle(.25, -24)).toBeCloseTo(3 * Math.PI / 2, 10);
  });
  it('uses synchronous lunar spin periods', () => {
    for (const moon of moons) expect(moon.rotationHours / 24).toBeCloseTo(moon.orbit.period, 5);
  });
  it('normalizes and rejects invalid rotations', () => {
    expect(normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI);
    expect(normalizeAngle(TAU)).toBe(0);
    expect(() => rotationAngle(1, 0)).toThrow();
  });
});
