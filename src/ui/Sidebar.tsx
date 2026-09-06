import { ArrowUpRight, BookOpen, ChevronRight, Compass, Flag, HelpCircle, Orbit, Sparkles, X } from 'lucide-react';
import { bodyById, planets, sun, moonsOf } from '../content/bodies';
import { useStore } from '../state';
import { calculateXP, completedMissions } from '../missions/rules';
import { PlanetIcon } from './PlanetIcon';

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const section = useStore(s => s.section), selected = useStore(s => s.selected), progress = useStore(s => s.progress);
  const setSection = useStore(s => s.setSection);
  const parent = bodyById[selected]?.parent ?? selected;
  const moons = moonsOf(parent);
  const go = (id: string) => { useStore.getState().select(id); onClose(); };
  return <>
    {open && <div className="sidebar-scrim" onClick={onClose} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`} aria-label="Navegação principal">
      <a href="#" className="brand" onClick={e => { e.preventDefault(); useStore.getState().overview(); onClose(); }}><span className="brand-symbol"><Orbit size={34} strokeWidth={1.4} /></span><span>órbita<span className="brand-dot">.</span><small>O UNIVERSO COMEÇA AQUI</small></span></a>
      <button className="icon-button mobile-sidebar-close" aria-label="Fechar menu" onClick={onClose}><X size={22} /></button>
      <div className="nav-label">SUA AVENTURA</div>
      <nav className="main-nav">
        <button className={section === 'explore' ? 'active' : ''} onClick={() => { setSection('explore'); onClose(); }}><Compass size={19} /><span>Explorar</span><ChevronRight size={15} /></button>
        <button className={section === 'missions' ? 'active' : ''} onClick={() => { setSection('missions'); onClose(); }}><Flag size={18} /><span>Missões</span><span className="nav-counter">{8 - completedMissions(progress).length}</span></button>
        <button className={section === 'passport' ? 'active' : ''} onClick={() => { setSection('passport'); onClose(); }}><BookOpen size={18} /><span>Meu passaporte</span></button>
      </nav>
      <div className="sidebar-destinations"><div className="nav-label destinations-label">PRÓXIMA PARADA <span>9 MUNDOS</span></div>
        <nav className="planet-nav" aria-label="Atalhos para os astros">{[sun, ...planets].map(body => <button key={body.id} aria-label={`Visitar ${body.name}`} className={selected === body.id && section === 'explore' ? 'selected' : ''} onClick={() => go(body.id)}><PlanetIcon id={body.id} size={23} /><span>{body.name}</span>{progress.visited.includes(body.id) && <span className="visited-dot" title="Visitado" />}</button>)}
          <button onClick={() => go('belt')} className={selected === 'belt' ? 'selected' : ''}><span className="asteroid-icon">⠿</span><span>Cinturão de asteroides</span></button>
        </nav>
        {moons.length > 0 && <><div className="nav-label moon-nav-label">LUAS DE {bodyById[parent].name.toUpperCase()}</div><nav className="planet-nav moon-nav" aria-label="Atalhos para luas">{moons.map(moon => <button key={moon.id} aria-label={`Visitar ${moon.name}`} className={selected === moon.id ? 'selected' : ''} onClick={() => go(moon.id)}><PlanetIcon id={moon.id} size={17} /><span>{moon.name}</span></button>)}</nav></>}
      </div>
      <div className="sidebar-bottom"><div className="explorer-card"><span className="avatar" aria-hidden="true">🧑‍🚀</span><div><strong>{calculateXP(progress) >= 500 ? 'Comandante espacial' : calculateXP(progress) >= 150 ? 'Viajante espacial' : 'Pequeno explorador'}</strong><span><Sparkles size={12} /> {calculateXP(progress)} estrelas de aventura</span></div></div><button className="sidebar-help" onClick={() => useStore.getState().setModal('help')}><HelpCircle size={17} /> Como jogar <ArrowUpRight size={15} /></button></div>
    </aside>
  </>;
}
