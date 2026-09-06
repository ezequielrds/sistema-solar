import { SRGBColorSpace, Texture } from 'three';

/** Our asset pipeline preserves top-to-bottom image rows in both formats.
 * WebP can flip on upload; compressed KTX2 cannot, so invert its V coordinates.
 * Keep geometry, axial tilt and rotation untouched (including retrograde bodies).
 */
export function prepareSurfaceTexture(map: Texture, format: 'webp' | 'ktx2'): Texture {
  map.flipY = format === 'webp';
  map.repeat.y = format === 'ktx2' ? -1 : 1;
  map.offset.y = format === 'ktx2' ? 1 : 0;
  map.updateMatrix();
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 2;
  return map;
}
