import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as Controls } from 'three-stdlib';
import { Vector3 } from 'three';
import { bodyById, moonsOf } from '../content/bodies';
import { positions } from '../scene/positions';
import { useStore } from '../state';

const origin = new Vector3();
export function CameraRig() {
  const ref = useRef<Controls>(null);
  const { camera, size } = useThree();
  const selected = useStore(s => s.selected), view = useStore(s => s.view), reset = useStore(s => s.resetCamera);
  const zoom = useStore(s => s.zoomRequest);
  const lastZoom = useRef(zoom);
  const transition = useRef(2);
  const offset = useRef(new Vector3());
  const lastTarget = useRef(new Vector3());
  const desired = useRef(new Vector3());
  useEffect(() => {
    const portrait = Math.max(1, size.height / size.width);
    let distance = 90 * portrait;
    if (view === 'system' && selected !== 'sun') distance = selected === 'belt' ? 33 : Math.max(12, (bodyById[selected]?.radius ?? 1) * 10);
    if (view === 'local') distance = Math.max(22, (moonsOf(selected).at(-1)?.distance ?? 5) * 3.1) * portrait;
    if (view === 'moon') distance = 13 * portrait;
    offset.current.set(distance * .1, distance * .64, distance * .77);
    transition.current = 1.6;
  }, [selected, view, reset, size.width, size.height]);
  useEffect(() => {
    if (zoom !== lastZoom.current && ref.current) camera.position.sub(ref.current.target).multiplyScalar(zoom > lastZoom.current ? .76 : 1.32).add(ref.current.target);
    lastZoom.current = zoom;
  }, [zoom, camera]);
  useFrame((_, dt) => {
    const controls = ref.current;
    if (!controls) return;
    const target = view === 'system' ? (positions.get(selected) ?? origin) : origin;
    if (transition.current > 0) {
      desired.current.copy(target).add(offset.current);
      camera.position.lerp(desired.current, 1 - Math.exp(-4.8 * dt));
      controls.target.lerp(target, 1 - Math.exp(-5 * dt));
      transition.current -= dt;
    } else if (selected !== 'sun' && view === 'system') {
      desired.current.copy(target).sub(lastTarget.current);
      camera.position.add(desired.current);
      controls.target.add(desired.current);
    }
    lastTarget.current.copy(target);
  }, -10);
  return <OrbitControls ref={ref} makeDefault enableDamping dampingFactor={.09} enablePan minDistance={4} maxDistance={320} rotateSpeed={.5} zoomSpeed={.8} maxPolarAngle={Math.PI * .95} onStart={() => { transition.current = 0; }} />;
}
