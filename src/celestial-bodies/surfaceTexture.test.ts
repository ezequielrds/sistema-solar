import { describe, expect, it } from 'vitest';
import { CompressedTexture, SphereGeometry, SRGBColorSpace, Texture, Vector2 } from 'three';
import { prepareSurfaceTexture } from './surfaceTexture';

describe('Surface image orientation', () => {
  it('maps north to the top source row and south to the bottom in both formats', () => {
    const webp = prepareSurfaceTexture(new Texture(), 'webp');
    const ktx2 = prepareSurfaceTexture(new CompressedTexture([], 4, 4), 'ktx2');
    const sphere = new SphereGeometry(1, 16, 8);
    const uv = sphere.getAttribute('uv'), positions = sphere.getAttribute('position');
    for (let i = 0; i < uv.count; i++) {
      const source = new Vector2(uv.getX(i), uv.getY(i));
      const a = webp.transformUv(source.clone());
      const b = ktx2.transformUv(source.clone());
      expect(a.y).toBeCloseTo(b.y, 10);
      expect(a.x).toBeCloseTo(b.x, 10);
      if (positions.getY(i) === 1) expect(b.y).toBe(0);
      if (positions.getY(i) === -1) expect(b.y).toBe(1);
    }
    expect(ktx2.flipY).toBe(false);
    sphere.dispose();
  });
  it('preserves longitude and ring midline without rotating the body', () => {
    const map = prepareSurfaceTexture(new CompressedTexture([], 4, 4), 'ktx2');
    expect(map.transformUv(new Vector2(.3, .5)).toArray()).toEqual([.3, .5]);
    expect(map.rotation).toBe(0);
    expect(map.colorSpace).toBe(SRGBColorSpace);
  });
  it('is idempotent and keeps the WebP fallback upright', () => {
    const map = new Texture();
    prepareSurfaceTexture(map, 'ktx2');
    prepareSurfaceTexture(map, 'ktx2');
    expect(map.repeat.y).toBe(-1);
    prepareSurfaceTexture(map, 'webp');
    expect(map.flipY).toBe(true);
    expect(map.repeat.y).toBe(1);
    expect(map.offset.y).toBe(0);
  });
});
