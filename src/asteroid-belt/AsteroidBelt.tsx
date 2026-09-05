import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { BufferGeometry, IcosahedronGeometry, InstancedMesh, Mesh, Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { qualityPresets } from '../performance/quality';
import { simulation, useStore } from '../state';
import { TAU } from '../orbits/kepler';
import { positions } from '../scene/positions';
import { Vector3 } from 'three';

function RockInstances({ geometry }: { geometry: BufferGeometry }) {
  const ref = useRef<InstancedMesh>(null);
  const quality = useStore(s => s.quality === 'auto' ? s.autoQuality : s.quality);
  const count = qualityPresets[quality].asteroids;
  const dummy = useMemo(() => new Object3D(), []);
  const rocks = useMemo(() => {
    let seed = 42;
    const rand = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
    return Array.from({ length: count }, () => ({ angle: rand() * TAU, distance: 18.1 + rand() * 2.7, height: (rand() - .5) * 1.0, size: .025 + rand() * .075, spin: rand() * TAU, period: 1200 + rand() * 700 }));
  }, [count]);
  useLayoutEffect(() => { positions.set('belt', new Vector3(0, 0, 19.5)); }, []);
  useFrame(() => {
    if (!ref.current) return;
    rocks.forEach((rock, i) => {
      const angle = rock.angle + TAU * (simulation.days % rock.period) / rock.period;
      dummy.position.set(Math.cos(angle) * rock.distance, rock.height, Math.sin(angle) * rock.distance);
      dummy.rotation.set(rock.spin, angle, rock.spin * 2);
      dummy.scale.set(rock.size, rock.size * .7, rock.size * 1.3);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, -25);
  return <instancedMesh ref={ref} args={[geometry, undefined, count]} frustumCulled={false} onClick={e => { e.stopPropagation(); useStore.getState().select('belt'); }}>
    <meshStandardMaterial color="#ad9d89" roughness={1} />
  </instancedMesh>;
}

function ModelBelt() {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}assets/asteroid.glb`, loader => loader.setMeshoptDecoder(MeshoptDecoder));
  const geometry = useMemo(() => {
    let result: BufferGeometry = new IcosahedronGeometry(1, 0);
    gltf.scene.traverse(obj => { if (obj instanceof Mesh) result = obj.geometry; });
    return result;
  }, [gltf]);
  return <RockInstances geometry={geometry} />;
}

export function AsteroidBelt() {
  const fallback = useMemo(() => new IcosahedronGeometry(1, 0), []);
  return <Suspense fallback={<RockInstances geometry={fallback} />}><ModelBelt /></Suspense>;
}
