import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { CanvasTexture, DoubleSide, Group, Mesh, RingGeometry } from 'three';
import type { CelestialBody as Body } from '../content/bodies';
import { orbitalPosition, radians, rotationAngle } from '../orbits/kepler';
import { qualityPresets } from '../performance/quality';
import { simulation, useStore } from '../state';
import { writePosition } from '../scene/positions';
import { useSurfaceTexture } from './useSurfaceTexture';

function SaturnRings({ radius }: { radius: number }) {
  const geometry = useMemo(() => {
    const ring = new RingGeometry(radius * 1.35, radius * 2.3, 96, 6);
    const uv = ring.attributes.uv, pos = ring.attributes.position;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (Math.hypot(pos.getX(i), pos.getY(i)) / radius - 1.35) / .95, .5);
    return ring;
  }, [radius]);
  const map = useSurfaceTexture('saturn-ring');
  return <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
    <meshStandardMaterial key={map?.uuid ?? 'ring-placeholder'} color={map ? '#ffffff' : '#bea986'} map={map} side={DoubleSide} transparent opacity={.88} roughness={1} depthWrite={false} />
  </mesh>;
}

function SunGlow({ radius }: { radius: number }) {
  const glow = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 18, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,193,76,.55)');
    gradient.addColorStop(.35, 'rgba(255,150,36,.22)');
    gradient.addColorStop(1, 'rgba(255,125,20,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(canvas);
  }, []);
  return <sprite scale={[radius * 5, radius * 5, 1]}><spriteMaterial map={glow} transparent depthWrite={false} toneMapped={false} /></sprite>;
}

export function CelestialBody({ body, central = false, radius: radiusOverride, distance: distanceOverride }: { body: Body; central?: boolean; radius?: number; distance?: number }) {
  const group = useRef<Group>(null);
  const surface = useRef<Mesh>(null);
  const radius = radiusOverride ?? body.radius;
  const map = useSurfaceTexture(body.texture);
  const quality = useStore(s => s.quality === 'auto' ? s.autoQuality : s.quality);
  const labels = useStore(s => s.labels);
  const selected = useStore(s => s.selected === body.id);
  const view = useStore(s => s.view);
  const segments = qualityPresets[quality].segments;
  useFrame(() => {
    const p: [number, number, number] = central || body.kind === 'star' ? [0, 0, 0] : orbitalPosition(body.orbit, simulation.days, distanceOverride ?? body.distance);
    group.current?.position.set(...p);
    writePosition(body.id, p);
    if (surface.current) surface.current.rotation.y = rotationAngle(simulation.days, body.rotationHours);
  }, -30);

  const onSelect = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); useStore.getState().select(body.id, body.kind === 'moon' || view !== 'system'); };
  return <group ref={group}>
    {body.kind === 'star' && <SunGlow radius={radius} />}
    <group rotation={[0, 0, radians(body.tilt)]}>
      <mesh ref={surface} onClick={onSelect} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
        <sphereGeometry args={[radius, segments, Math.max(16, segments / 2)]} />
        {body.kind === 'star' ? <meshBasicMaterial key={map?.uuid ?? 'star-placeholder'} map={map} color={map ? '#fff0c5' : body.color} toneMapped={false} /> : <meshStandardMaterial key={map?.uuid ?? 'surface-placeholder'} map={map} color={map ? '#ffffff' : body.color} roughness={1} metalness={0} />}
      </mesh>
      {body.id === 'saturn' && <SaturnRings radius={radius} />}
      {view !== 'system' && central && <mesh>
        <cylinderGeometry args={[.012, .012, radius * 3.1, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={.2} />
      </mesh>}
    </group>
    {labels && <Html position={[0, radius + (body.kind === 'star' ? .6 : .35), 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: 'auto' }}>
      <button className={`body-label ${selected ? 'is-selected' : ''}`} onClick={() => useStore.getState().select(body.id, body.kind === 'moon' || view !== 'system')} aria-label={`Explorar ${body.name}`}>
        <i style={{ background: body.color }} />{body.name}{selected && <span className="label-dot" />}
      </button>
    </Html>}
  </group>;
}
