import { describe, expect, it } from 'vitest';
import { MOUSE, TOUCH, Vector3 } from 'three';
import { navigationBindings, zoomAroundTarget } from './navigation';

describe('Camera navigation', () => {
  it('pans with the left mouse button and one finger in hand mode', () => {
    const bindings = navigationBindings('pan');
    expect(bindings.mouseButtons.LEFT).toBe(MOUSE.PAN);
    expect(bindings.touches.ONE).toBe(TOUCH.PAN);
  });
  it('restores rotation without changing right-button pan or two-finger pinch/pan', () => {
    const bindings = navigationBindings('orbit');
    expect(bindings.mouseButtons.LEFT).toBe(MOUSE.ROTATE);
    expect(bindings.touches.ONE).toBe(TOUCH.ROTATE);
    for (const mode of ['pan', 'orbit'] as const) {
      expect(navigationBindings(mode).touches.TWO).toBe(TOUCH.DOLLY_PAN);
      expect(navigationBindings(mode).mouseButtons.RIGHT).toBe(MOUSE.PAN);
    }
  });
  it('zooms toward a panned target instead of the Sun', () => {
    const target = new Vector3(40, 8, -20), position = new Vector3(50, 28, 10);
    const before = position.clone().sub(target);
    zoomAroundTarget(position, target, .76);
    expect(position.clone().sub(target).distanceTo(before.multiplyScalar(.76))).toBeLessThan(1e-10);
    expect(target.toArray()).toEqual([40, 8, -20]);
  });
  it('clamps zoom distance while preserving its direction', () => {
    const target = new Vector3(15, 0, 5), position = new Vector3(15, 0, 15);
    zoomAroundTarget(position, target, .001);
    expect(position.toArray()).toEqual([15, 0, 9]);
    zoomAroundTarget(position, target, 1000);
    expect(position.toArray()).toEqual([15, 0, 325]);
  });
  it('does not create invalid coordinates at a zero-distance target', () => {
    const position = new Vector3(1, 2, 3);
    zoomAroundTarget(position, position.clone(), .76);
    expect(position.toArray()).toEqual([1, 2, 3]);
  });
});
