import { moonsOf, type CelestialBody } from '../content/bodies';

export const systemPlanetRadius = (planet: CelestialBody) => planet.radius * 1.15;

/** Separate educational scale: compact moon systems, with clearance for Saturn's rings. */
export function systemMoonsOf(planet: CelestialBody) {
  const surface = systemPlanetRadius(planet) * (planet.id === 'saturn' ? 2.3 : 1);
  return moonsOf(planet.id).map((moon, index) => ({
    body: moon,
    radius: Math.max(.16, moon.radius * .36),
    distance: surface + .85 + index * .9,
  }));
}
