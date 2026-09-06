import { RingGeometry } from 'three';

export function createSaturnRingGeometry(radius: number, segments = 256) {
  const inner = radius * 1.35, outer = radius * 2.3;
  const geometry = new RingGeometry(inner, outer, segments, 8);
  const uv = geometry.attributes.uv, positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const radial = Math.hypot(positions.getX(i), positions.getY(i));
    uv.setXY(i, Math.max(0, Math.min(1, (radial - inner) / (outer - inner))), .5);
  }
  return geometry;
}
