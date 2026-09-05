import { useEffect, useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial } from 'three';
import type { OrbitalElements } from '../content/bodies';
import { orbitPoints } from './kepler';
import { useStore } from '../state';

export function OrbitPath({ orbit, radius, color = '#5c647c', highlighted = false }: { orbit: OrbitalElements; radius: number; color?: string; highlighted?: boolean }) {
  const visible = useStore(s => s.paths);
  const line = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(orbitPoints(orbit, radius).flat(), 3));
    return new Line(geometry, new LineBasicMaterial({ color, transparent: true, opacity: highlighted ? .54 : .24, depthWrite: false }));
  }, [orbit, radius, color, highlighted]);
  useEffect(() => () => { line.geometry.dispose(); line.material.dispose(); }, [line]);
  return <primitive object={line} visible={visible} />;
}
