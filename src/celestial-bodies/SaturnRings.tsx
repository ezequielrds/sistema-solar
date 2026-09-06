import { useEffect, useMemo } from 'react';
import { DoubleSide } from 'three';
import { useStore } from '../state';
import { useSurfaceTexture } from './useSurfaceTexture';
import { createSaturnRingGeometry } from './ringGeometry';

export function SaturnRings({ radius }: { radius: number }) {
  const quality = useStore(s => s.quality === 'auto' ? s.autoQuality : s.quality);
  const geometry = useMemo(() => createSaturnRingGeometry(radius, quality === 'low' ? 128 : 256), [radius, quality]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const map = useSurfaceTexture('saturn-ring');
  // Educational, evenly lit rings: a grazing point light otherwise makes this flat sheet almost black.
  // Preserve the licensed texture's radial bands/alpha; do not draw both faces as separate transparent layers.
  return <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
    <meshBasicMaterial key={map?.uuid ?? 'ring-placeholder'} color={map ? '#fff5e5' : '#c4b18d'} map={map} side={DoubleSide} transparent opacity={1} alphaTest={.025} depthWrite={false} forceSinglePass toneMapped={false} />
  </mesh>;
}
