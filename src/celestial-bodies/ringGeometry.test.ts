import { describe, expect, it } from 'vitest';
import { createSaturnRingGeometry } from './ringGeometry';

describe('Saturn rings', () => {
  it.each([1.7825, 2.6])('maps texture bands radially with no seam at radius %s', radius => {
    const geometry = createSaturnRingGeometry(radius);
    const p = geometry.attributes.position, uv = geometry.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const distance = Math.hypot(p.getX(i), p.getY(i));
      expect(distance).toBeGreaterThan(radius);
      expect(uv.getX(i)).toBeGreaterThanOrEqual(0);
      expect(uv.getX(i)).toBeLessThanOrEqual(1);
      expect(uv.getX(i)).toBeCloseTo((distance / radius - 1.35) / .95, 5);
      expect(uv.getY(i)).toBe(.5);
      expect(p.getZ(i)).toBe(0);
    }
    for (let row = 0; row <= 8; row++) {
      const start = row * 257, end = start + 256;
      expect(p.getX(start)).toBeCloseTo(p.getX(end), 5);
      expect(p.getY(start)).toBeCloseTo(p.getY(end), 5);
      expect(uv.getX(start)).toBeCloseTo(uv.getX(end), 5);
    }
    geometry.dispose();
  });
  it('keeps the economy geometry lightweight', () => {
    const geometry = createSaturnRingGeometry(2.6, 128);
    expect(geometry.attributes.position.count).toBe(129 * 9);
    geometry.dispose();
  });
});
