import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { WebGLRenderer, ACESFilmicToneMapping } from 'three';
import { bodyById, planets, sun, moonsOf } from '../content/bodies';
import { CelestialBody } from '../celestial-bodies/CelestialBody';
import { OrbitPath } from '../orbits/OrbitPath';
import { AsteroidBelt } from '../asteroid-belt/AsteroidBelt';
import { CameraRig } from '../camera/CameraRig';
import { PerformanceMonitor } from '../performance/PerformanceMonitor';
import { qualityPresets } from '../performance/quality';
import { simulation, useStore } from '../state';
import { StarField } from './StarField';
import { positions } from './positions';
import { RendererLifecycle } from './RendererLifecycle';

class SceneBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return <div className="scene-fallback"><span>🪐</span><h2>O espaço precisa de uma ajudinha</h2><p>Não foi possível iniciar o 3D. Seus desafios e seu passaporte continuam disponíveis.</p><button className="primary-button" onClick={() => { useStore.setState({ renderer: 'webgl', quality: 'low' }); this.setState({ error: false }); }}>Tentar em modo econômico</button></div>;
    return this.props.children;
  }
}

function Worlds() {
  const selected = useStore(s => s.selected), view = useStore(s => s.view);
  const body = bodyById[selected] ?? sun;
  useEffect(() => { positions.clear(); document.body.style.cursor = ''; }, [view, selected]);
  if (view !== 'system') return <>
    <ambientLight intensity={.65} />
    <directionalLight position={[12, 8, 9]} intensity={2.5} color="#fff3df" />
    <CelestialBody key={body.id} body={body} central radius={view === 'moon' ? 2.2 : 2.6} />
    {view === 'local' && moonsOf(body.id).map(moon => <group key={moon.id}>
      <OrbitPath orbit={moon.orbit} radius={moon.distance} color={moon.color} />
      <CelestialBody body={moon} />
    </group>)}
  </>;
  return <>
    <ambientLight intensity={.65} />
    <pointLight position={[0, 0, 0]} intensity={1800} color="#fff3df" decay={2} />
    <CelestialBody body={sun} />
    {planets.map(planet => <group key={planet.id}>
      <OrbitPath orbit={planet.orbit} radius={planet.distance} color={planet.color} highlighted={planet.id === selected} />
      <CelestialBody body={planet} radius={planet.radius * 1.15} />
    </group>)}
    <AsteroidBelt />
  </>;
}

export default function SolarScene() {
  const quality = useStore(s => s.quality === 'auto' ? s.autoQuality : s.quality);
  const renderer = useStore(s => s.renderer);
  const section = useStore(s => s.section);
  const modal = useStore(s => s.modal);
  const [visible, setVisible] = useState(!document.hidden);
  const [lost, setLost] = useState(false);
  useEffect(() => {
    const update = () => { simulation.visible = !document.hidden; setVisible(!document.hidden); };
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return <SceneBoundary><div className="canvas-container" aria-label="Mapa 3D interativo do Sistema Solar">
    <Canvas key={renderer} dpr={qualityPresets[quality].dpr} camera={{ position: [10, 73, 86], fov: 46, near: .1, far: 800 }} frameloop={visible && section === 'explore' && !modal && !lost ? 'always' : 'never'}
      gl={async props => {
        if (renderer === 'webgpu' && 'gpu' in navigator) {
          try {
            const { WebGPURenderer } = await import('three/webgpu');
            const gpu = new WebGPURenderer({ canvas: props.canvas as HTMLCanvasElement, alpha: true, antialias: true });
            await gpu.init();
            gpu.toneMapping = ACESFilmicToneMapping;
            useStore.setState({ rendererActive: gpu.backend.constructor.name.includes('WebGPU') ? 'WebGPU' : 'WebGL 2 (compatibilidade)' });
            return gpu;
          } catch { /* WebGPU is optional; WebGL remains the primary renderer. */ }
        }
        useStore.setState({ rendererActive: 'WebGL 2' });
        return new WebGLRenderer({ canvas: props.canvas as HTMLCanvasElement, alpha: true, antialias: quality !== 'low', powerPreference: 'default' });
      }}
      fallback={<div className="scene-fallback"><h2>Este navegador não oferece WebGL 2.</h2><p>Você ainda pode jogar os desafios e conhecer os planetas pelos cartões.</p></div>}>
      <RendererLifecycle onLost={setLost} />
      <PerformanceMonitor />
      <StarField />
      <Suspense fallback={null}><Worlds /></Suspense>
      <CameraRig />
    </Canvas>
    {lost && <div className="scene-fallback"><h2>A imagem 3D foi interrompida</h2><p>Seu progresso está salvo. Reabra o jogo para recuperar a imagem.</p><button className="primary-button" onClick={() => location.reload()}>Reabrir jogo</button></div>}
  </div></SceneBoundary>;
}
