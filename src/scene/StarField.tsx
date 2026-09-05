import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { useStore } from '../state';
import { qualityPresets } from '../performance/quality';

export function StarField() {
  const quality = useStore(s => s.quality === 'auto' ? s.autoQuality : s.quality);
  const geometry = useMemo(() => {
    let seed = 90210;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const points = [];
    for (let i = 0; i < qualityPresets[quality].stars; i++) {
      const phi = random() * Math.PI * 2, z = random() * 2 - 1, r = 170 + random() * 100;
      points.push(r * Math.sqrt(1 - z * z) * Math.cos(phi), r * z, r * Math.sqrt(1 - z * z) * Math.sin(phi));
    }
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(points, 3));
  }, [quality]);
  return <points geometry={geometry}><pointsMaterial size={.28} color="#bfcce5" transparent opacity={.75} sizeAttenuation depthWrite={false} /></points>;
}
