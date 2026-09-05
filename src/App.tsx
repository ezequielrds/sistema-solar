import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Compass, Expand, Flag, HelpCircle, Info, Menu, Minus, Orbit, Plus, Rocket, Settings2, Sparkles, Target, Volume2, VolumeX, X } from 'lucide-react';
import { Sidebar } from './ui/Sidebar';
import { BodyCard } from './ui/BodyCard';
import { TimeControls } from './ui/TimeControls';
import { Settings, Help, Credits } from './ui/Settings';
import { MissionBoard } from './missions/MissionBoard';
import { Passport } from './missions/Passport';
import { Quiz } from './missions/Quiz';
import { Toast } from './ui/Toast';
import { usePWA } from './ui/PWA';
import { useStore } from './state';
import { bodyById, planets } from './content/bodies';
import { calculateXP, completedMissions } from './missions/rules';
import { qualityNames } from './performance/quality';
import { playSound } from './audio/sounds';

const SolarScene = lazy(() => import('./scene/SolarScene'));

export default function App() {
  const [menu, setMenu] = useState(false);
  const selected = useStore(s => s.selected), section = useStore(s => s.section), modal = useStore(s => s.modal), view = useStore(s => s.view);
  const progress = useStore(s => s.progress), labels = useStore(s => s.labels), paths = useStore(s => s.paths), sound = useStore(s => s.sound);
  const quality = useStore(s => s.quality === 'auto' ? s.autoQuality : s.quality), rendererActive = useStore(s => s.rendererActive), storageError = useStore(s => s.storageError);
  const pwa = usePWA();
  const visited = planets.filter(p => progress.visited.includes(p.id)).length;
  const isHome = selected === 'sun' && view === 'system';
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName) || e.target.isContentEditable)) return;
      if (useStore.getState().modal) return;
      if (e.key === ' ') { e.preventDefault(); useStore.setState(s => ({ paused: !s.paused })); }
      else if (/^[1-5]$/.test(e.key)) useStore.getState().setSpeed(Number(e.key) - 1);
      else if (e.key === 'Home') { e.preventDefault(); useStore.getState().overview(); }
      else if (e.key === '+' || e.key === '=') useStore.setState(s => ({ zoomRequest: s.zoomRequest + 1 }));
      else if (e.key === '-') useStore.setState(s => ({ zoomRequest: s.zoomRequest - 1 }));
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);
  return <div className="app-shell" inert={modal !== null}>
    <a className="skip-link" href="#main-content">Ir para a exploração</a>
    <Sidebar open={menu} onClose={() => setMenu(false)} />
    <main className="main-area" id="main-content" inert={menu}>
      <header className="topbar"><div className="breadcrumb"><button className="icon-button menu-button" aria-label="Abrir menu de astros" onClick={() => setMenu(true)}><Menu size={21} /></button><span className="breadcrumb-icon"><Orbit size={18} /></span><span>Central de exploração</span><span className="breadcrumb-divider">/</span><strong>{section === 'missions' ? 'Missões' : section === 'passport' ? 'Meu passaporte' : 'Sistema Solar'}</strong></div><div className="topbar-actions"><span className="xp-chip"><Sparkles size={15} /> {calculateXP(progress)} <span>estrelas</span></span><button className="icon-button" aria-label={sound ? 'Desligar sons' : 'Ligar sons'} onClick={() => { useStore.setState({ sound: !sound }); playSound('tap', !sound); }}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button><button className="icon-button" aria-label="Abrir configurações" onClick={() => useStore.getState().setModal('settings')}><Settings2 size={19} /></button><span className="topbar-avatar" aria-hidden="true">🧑‍🚀</span></div></header>
      <div className={`explorer-workspace ${section !== 'explore' ? 'workspace-hidden' : ''}`}>
        <div className="explore-heading"><div><div className="page-eyebrow"><span className="live-dot" /> SUA VIAGEM PELO SISTEMA SOLAR</div><h1>{isHome ? <>O universo é seu<span>.</span></> : <>{selected === 'belt' ? 'Entre mundos' : bodyById[selected]?.name}<span>.</span></>}</h1><p>{isHome ? 'Pequenos exploradores. Grandes descobertas.' : view === 'moon' ? 'Uma nova companheira para conhecer.' : view === 'local' ? 'Chegue mais perto. A curiosidade é sua bússola.' : 'Um novo ponto de vista para a sua aventura.'}</p></div><button className="help-pill" onClick={() => useStore.getState().setModal('help')}><HelpCircle size={15} /> Como explorar</button></div>
        <div className="space-stage"><Suspense fallback={<div className="scene-loading"><Orbit size={36} /><p>Preparando o universo…</p></div>}><SolarScene /></Suspense>
          <div className="scene-top-controls"><button className="view-chip" onClick={() => useStore.getState().overview()}><Orbit size={15} />{view === 'system' ? 'Sistema Solar' : view === 'local' ? 'Planeta e luas' : 'Visita à lua'}<ChevronDown size={14} /></button><button className="scale-chip" onClick={() => useStore.getState().setModal('help')}><Info size={13} /> Escalas educativas</button></div>
          {!isHome && <button className="back-to-system" onClick={() => useStore.getState().overview()}><ArrowLeft size={15} /> Ver todo o sistema</button>}
          <div className="scene-tools"><button className="icon-button" aria-label="Aproximar câmera" onClick={() => useStore.setState(s => ({ zoomRequest: s.zoomRequest + 1 }))}><Plus size={20} /></button><button className="icon-button" aria-label="Afastar câmera" onClick={() => useStore.setState(s => ({ zoomRequest: s.zoomRequest - 1 }))}><Minus size={20} /></button><span /><button className="icon-button" aria-label="Centralizar câmera" onClick={() => useStore.setState(s => ({ resetCamera: s.resetCamera + 1 }))}><Target size={19} /></button><button className="icon-button fullscreen-button" aria-label="Alternar tela cheia" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen?.().catch(() => useStore.getState().setModal('help')); }}><Expand size={17} /></button></div>
          <div className="scene-options"><button aria-pressed={paths} onClick={() => useStore.setState({ paths: !paths })}><span className={`small-checkbox ${paths ? 'checked' : ''}`}>{paths && <Check size={10} />}</span> Órbitas</button><button aria-pressed={labels} onClick={() => useStore.setState({ labels: !labels })}><span className={`small-checkbox ${labels ? 'checked' : ''}`}>{labels && <Check size={10} />}</span> Nomes</button></div>
          <div className="scene-gesture-tip"><span className="mouse-outline" /> Arraste para explorar <i /> Aproxime para descobrir</div>
        </div>
        <BodyCard key={selected} />
        {isHome && <div className="starter-mission"><div className="starter-icon"><Rocket size={23} /></div><div><span className="eyebrow">{progress.visited.includes('earth') ? 'CONTINUE SUA AVENTURA' : 'SUA PRIMEIRA MISSÃO'}</span><strong>{progress.visited.includes('earth') ? 'Quantos mundos você conhece?' : 'Um olá para o nosso lar'}</strong><span>{progress.visited.includes('earth') ? 'Teste seus conhecimentos e ganhe estrelas.' : 'Encontre a Terra e ganhe suas primeiras estrelas!'}</span></div><button aria-label={progress.visited.includes('earth') ? 'Jogar primeiro desafio' : 'Começar missão da Terra'} onClick={() => progress.visited.includes('earth') ? useStore.getState().startQuiz('earth') : useStore.getState().select('earth', true)}><ArrowRight size={19} /></button></div>}
        <TimeControls />
        <footer className="explore-footer"><span><span className="live-dot" /> {rendererActive} <i /> {qualityNames[quality]} <i /> <span id="fps-value">Preparando 3D</span></span><span><Orbit size={12} /> Tamanhos e distâncias fora de escala real</span><button onClick={() => useStore.getState().setModal('credits')}>Feito com ciência e curiosidade <ArrowRight size={12} /></button></footer>
      </div>
      {section === 'missions' && <MissionBoard />}
      {section === 'passport' && <Passport />}
      <nav className="mobile-navigation" aria-label="Navegação móvel"><button className={section === 'explore' ? 'active' : ''} onClick={() => useStore.getState().setSection('explore')}><Compass size={19} />Explorar</button><button className={section === 'missions' ? 'active' : ''} onClick={() => useStore.getState().setSection('missions')}><Flag size={19} />Missões {completedMissions(progress).length > 0 && <span>{completedMissions(progress).length}</span>}</button><button className={section === 'passport' ? 'active' : ''} onClick={() => useStore.getState().setSection('passport')}><BookOpen size={19} />Passaporte {visited > 0 && <span>{visited}</span>}</button></nav>
    </main>
    {modal === 'help' && <Help />}{modal === 'settings' && <Settings install={pwa.install} installable={pwa.installable} offlineReady={pwa.offlineReady} />}{modal === 'credits' && <Credits />}{modal === 'quiz' && <Quiz />}
    <Toast />
    {pwa.needRefresh && <div className="update-banner" role="status"><span>Uma nova aventura está pronta!</span><button onClick={() => void pwa.update()}>Atualizar</button><button aria-label="Atualizar mais tarde" onClick={pwa.dismissUpdate}><X size={16} /></button></div>}
    {storageError && <div className="storage-warning" role="alert">Este navegador bloqueou o armazenamento. Você pode jogar, mas o progresso não será salvo.</div>}
  </div>;
}
