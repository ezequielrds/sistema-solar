import { Expand, Hand, Minus, Orbit, Plus, Target } from 'lucide-react';
import { useStore } from '../state';

export function CameraTools() {
  const mode = useStore(s => s.cameraMode);
  return <>
    <div className="scene-tools" role="group" aria-label="Navegação da câmera">
      <button className="icon-button" aria-label="Mover câmera (mãozinha)" title="Mãozinha: arraste para mover o mapa" aria-pressed={mode === 'pan'} onClick={() => useStore.setState({ cameraMode: 'pan' })}><Hand size={20} /></button>
      <button className="icon-button" aria-label="Girar câmera" title="Girar: arraste para olhar ao redor" aria-pressed={mode === 'orbit'} onClick={() => useStore.setState({ cameraMode: 'orbit' })}><Orbit size={20} /></button>
      <span />
      <button className="icon-button" aria-label="Aproximar câmera" onClick={() => useStore.setState(s => ({ zoomRequest: s.zoomRequest + 1 }))}><Plus size={20} /></button>
      <button className="icon-button" aria-label="Afastar câmera" onClick={() => useStore.setState(s => ({ zoomRequest: s.zoomRequest - 1 }))}><Minus size={20} /></button>
      <span />
      <button className="icon-button" aria-label="Centralizar câmera" title="Voltar ao astro selecionado" onClick={() => useStore.setState(s => ({ resetCamera: s.resetCamera + 1 }))}><Target size={19} /></button>
      <button className="icon-button fullscreen-button" aria-label="Alternar tela cheia" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen?.().catch(() => useStore.getState().setModal('help')); }}><Expand size={17} /></button>
    </div>
    {mode === 'pan' && <div className="camera-mode-hint" role="status"><Hand size={14} /><span>Arraste para mover · use + ou pinça para aproximar</span></div>}
  </>;
}
