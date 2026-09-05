import type { OrbitalElements } from '../content/bodies';

export const TAU = Math.PI * 2;
export const radians = (degrees: number) => degrees * Math.PI / 180;
export const normalizeAngle = (angle: number) => ((angle % TAU) + TAU) % TAU;

/** Newton-Raphson solution to M = E - e sin E. Angles in radians. */
export function solveKepler(meanAnomaly: number, eccentricity: number): number {
  if (!Number.isFinite(meanAnomaly) || !Number.isFinite(eccentricity) || eccentricity < 0 || eccentricity >= 1) throw new RangeError('Uma órbita elíptica exige 0 ≤ e < 1 e valores finitos.');
  const m = normalizeAngle(meanAnomaly);
  let e = eccentricity < .8 ? m : Math.PI;
  for (let i = 0; i < 40; i++) {
    const step = (e - eccentricity * Math.sin(e) - m) / (1 - eccentricity * Math.cos(e));
    e -= step;
    if (Math.abs(step) < 1e-12) break;
  }
  return e;
}

/** AU or educational units in, same units out. Three coordinates: +Y north, XZ orbit plane. */
export function orbitalPosition(elements: OrbitalElements, days: number, semiMajorAxis: number): [number, number, number] {
  if (!Number.isFinite(days) || !Number.isFinite(semiMajorAxis) || semiMajorAxis < 0 || !Number.isFinite(elements.period) || elements.period <= 0) throw new RangeError('Período e distância orbital inválidos.');
  const E = solveKepler(radians(elements.meanAnomaly) + TAU * ((days % elements.period) / elements.period), elements.eccentricity);
  const x = semiMajorAxis * (Math.cos(E) - elements.eccentricity);
  const z = semiMajorAxis * Math.sqrt(1 - elements.eccentricity ** 2) * Math.sin(E);
  const w = radians(elements.periapsis), n = radians(elements.node), i = radians(elements.inclination);
  const cw = Math.cos(w), sw = Math.sin(w), cn = Math.cos(n), sn = Math.sin(n), ci = Math.cos(i), si = Math.sin(i);
  return [
    (cw * cn - sw * sn * ci) * x + (-sw * cn - cw * sn * ci) * z,
    (sw * si) * x + (cw * si) * z,
    -((cw * sn + sw * cn * ci) * x + (-sw * sn + cw * cn * ci) * z),
  ];
}

/** Signed periods handle retrograde Venus; Uranus uses a tilted prograde axis. */
export function rotationAngle(days: number, rotationHours: number): number {
  if (!Number.isFinite(days) || !Number.isFinite(rotationHours) || rotationHours === 0) throw new RangeError('Rotação inválida.');
  return normalizeAngle(TAU * ((days * 24 % rotationHours) / rotationHours));
}

export function orbitPoints(elements: OrbitalElements, radius: number, count = 256): [number, number, number][] {
  return Array.from({ length: count + 1 }, (_, i) => orbitalPosition(elements, (i / count) * elements.period, radius));
}
