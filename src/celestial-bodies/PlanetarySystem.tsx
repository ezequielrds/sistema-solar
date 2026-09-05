import type { CelestialBody as Body } from '../content/bodies';
import { OrbitPath } from '../orbits/OrbitPath';
import { useStore } from '../state';
import { CelestialBody } from './CelestialBody';
import { systemMoonsOf, systemPlanetRadius } from './scales';

/** Moon orbits follow the planet's translation, never its surface rotation or tilt. */
export function PlanetarySystem({ planet }: { planet: Body }) {
  const highlighted = useStore(s => s.selected === planet.id);
  return <CelestialBody body={planet} radius={systemPlanetRadius(planet)}>
    {systemMoonsOf(planet).map(({ body, radius, distance }) => <group key={body.id}>
      <OrbitPath orbit={body.orbit} radius={distance} color={body.color} highlighted={highlighted} />
      <CelestialBody body={body} radius={radius} distance={distance} />
    </group>)}
  </CelestialBody>;
}
