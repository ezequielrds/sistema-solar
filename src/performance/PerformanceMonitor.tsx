import { addAfterEffect, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { simulation, speeds, useStore } from '../state';

export function PerformanceMonitor() {
  const sample = useRef({ frames: 0, duration: 0, slow: 0, warmup: 0 });
  const frameCost = useRef({ start: 0, ms: 0 });
  useEffect(() => addAfterEffect(() => { frameCost.current.ms = performance.now() - frameCost.current.start; }), []);
  useFrame((_, delta) => {
    frameCost.current.start = performance.now();
    const state = useStore.getState();
    if (simulation.visible && !state.paused && state.section === 'explore' && !state.modal) simulation.days += Math.min(delta, .1) * speeds[state.speed].rate;
    const s = sample.current;
    if (!simulation.visible || state.section !== 'explore' || state.modal || delta > 2) { s.frames = 0; s.duration = 0; return; }
    s.warmup += delta;
    s.frames++;
    s.duration += delta;
    if (s.duration >= 3) {
      const fps = s.frames / s.duration;
      const output = document.getElementById('fps-value');
      if (output) {
        output.textContent = `${Math.round(fps)} FPS`;
        output.title = `${document.visibilityState} · ${document.hasFocus() ? 'janela ativa' : 'janela sem foco'} · ${s.frames} quadros / ${s.duration.toFixed(1)} s · CPU ${frameCost.current.ms.toFixed(1)} ms/quadro`;
      }
      if (state.quality === 'auto' && s.warmup > 10 && document.hasFocus()) {
        s.slow = fps < 32 ? s.slow + 1 : 0;
        if (s.slow >= 2 && state.autoQuality !== 'low') {
          useStore.setState({ autoQuality: state.autoQuality === 'high' ? 'medium' : 'low' });
          s.slow = 0;
        }
      }
      s.frames = 0; s.duration = 0;
    }
  }, -100);
  return null;
}
