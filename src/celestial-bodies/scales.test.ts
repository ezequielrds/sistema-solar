import { afterEach, describe, expect, it } from 'vitest';
import { Group } from 'three';
import { bodyById, moons, planets } from '../content/bodies';
import { orbitalPosition, rotationAngle } from '../orbits/kepler';
import { positions, writeWorldPosition } from '../scene/positions';
import { systemMoonsOf, systemPlanetRadius } from './scales';

afterEach(() => positions.clear());

describe('Overview moon scale', () => {
  it('includes every curated moon exactly once, under its own planet', () => {
    const displayed = planets.flatMap(planet => systemMoonsOf(planet));
    expect(displayed).toHaveLength(14);
    expect(displayed.map(({ body }) => body.id).sort()).toEqual(moons.map(moon => moon.id).sort());
    for (const planet of planets) for (const { body } of systemMoonsOf(planet)) expect(body.parent).toBe(planet.id);
  });

  it.each(planets.map(planet => [planet.name, planet] as const))('%s keeps moons outside the surface/rings with ordered, separate orbits', (_, planet) => {
    const displayed = systemMoonsOf(planet);
    let previousOuterEdge = systemPlanetRadius(planet) * (planet.id === 'saturn' ? 2.3 : 1);
    for (const { body, radius, distance } of displayed) {
      expect(radius).toBeGreaterThanOrEqual(.16);
      expect(radius).toBeLessThan(systemPlanetRadius(planet));
      expect(distance * (1 - body.orbit.eccentricity) - radius).toBeGreaterThan(previousOuterEdge);
      previousOuterEdge = distance * (1 + body.orbit.eccentricity) + radius;
      expect(distance).toBeLessThan(body.distance);
      expect(body).toBe(bodyById[body.id]); // Scale overrides never change orbital elements or local views.
    }
  });
});

describe('Moving planetary reference frames', () => {
  it.each(moons.map(moon => [moon.name, moon] as const))('%s travels with its planet while retaining its own period', (_, moon) => {
    const planet = bodyById[moon.parent!];
    const scale = systemMoonsOf(planet).find(item => item.body.id === moon.id)!;
    const planetFrame = new Group(), moonFrame = new Group(), planetSurface = new Group();
    planetFrame.add(planetSurface, moonFrame);
    const initial = orbitalPosition(moon.orbit, 0, scale.distance);
    for (const days of [0, .01, .25, 2, 30, 365.256, moon.orbit.period]) {
      planetFrame.position.set(...orbitalPosition(planet.orbit, days, planet.distance));
      planetSurface.rotation.y = rotationAngle(days, planet.rotationHours);
      moonFrame.position.set(...orbitalPosition(moon.orbit, days, scale.distance));
      const parentPosition = writeWorldPosition(planet.id, planetFrame);
      const world = writeWorldPosition(moon.id, moonFrame);
      expect(world).not.toBe(parentPosition);
      world.toArray().forEach((value, axis) => expect(value).toBeCloseTo(parentPosition.getComponent(axis) + moonFrame.position.getComponent(axis), 10));
      if (days === moon.orbit.period) {
        world.clone().sub(parentPosition).toArray().forEach((value, axis) => expect(value).toBeCloseTo(initial[axis], 10));
        expect(parentPosition.length()).toBeGreaterThan(0);
      }
    }
  });

  it('registers an unparented close-up at the origin after a view change', () => {
    const frame = new Group();
    frame.position.set(10, 0, 5);
    writeWorldPosition('moon', frame);
    frame.position.set(0, 0, 0);
    expect(writeWorldPosition('moon', frame).toArray()).toEqual([0, 0, 0]);
  });
});
