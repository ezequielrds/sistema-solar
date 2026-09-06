import { ArrowLeft, ArrowUpRight, ChevronDown, ChevronUp, Lightbulb, MoveUpRight, Orbit, Rocket, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { bodyById, sun, moonsOf, formatNumber, formatPeriod } from '../content/bodies';
import { useStore } from '../state';
import { PlanetIcon } from './PlanetIcon';
import { readAloud } from '../audio/sounds';

export function BodyCard() {
  const selected = useStore(s => s.selected), view = useStore(s => s.view);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<'about' | 'moons'>('about');
  const body = bodyById[selected] ?? sun;
  const moons = moonsOf(body.id);
  if (selected === 'belt') return <aside className="body-card belt-card"><span className="eyebrow">ENTRE MARTE E JÚPITER</span><h2>Cinturão de asteroides</h2><p>Milhões de pedaços de rocha viajam ao redor do Sol nesta região!</p><div className="fun-fact"><Lightbulb size={18} /><p>Na realidade, as rochas ficam muito longe umas das outras. Aqui elas estão maiores e mais próximas para você enxergar.</p></div><button className="primary-button full-width" onClick={() => useStore.getState().overview()}><Orbit size={17} /> Ver o Sistema Solar</button></aside>;
  return <aside className={`body-card ${expanded ? 'card-expanded' : ''}`} aria-label={`Sobre ${body.name}`}>
    <div className="card-kicker"><span className="eyebrow">{body.kind === 'star' ? 'NOSSA ESTRELA' : body.kind === 'moon' ? 'LUA EM DESTAQUE' : 'PLANETA EM DESTAQUE'}</span><span className="tiny-orbit"><Orbit size={17} /></span></div>
    <div className="body-card-title"><PlanetIcon id={body.id} size={60} /><div><h2>{body.name}</h2><span>{body.subtitle}</span></div><button className="icon-button mobile-card-toggle" aria-label={expanded ? 'Recolher informações' : 'Expandir informações'} onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronDown /> : <ChevronUp />}</button></div>
    <div className="card-details">
      <div className="card-tabs"><button className={tab === 'about' ? 'active' : ''} onClick={() => setTab('about')}>Vamos conhecer</button><button className={tab === 'moons' ? 'active' : ''} onClick={() => setTab('moons')}>Luas {moons.length > 0 && <span>{moons.length}</span>}</button></div>
      {tab === 'about' ? <>
        <p className="body-intro">{body.intro}</p>
        <div className="planet-facts"><div><span>DIÂMETRO</span><strong>{formatNumber(body.diameter)} <small>km</small></strong></div><div><span>{body.kind === 'star' ? 'TIPO DE ASTRO' : 'UMA VOLTA COMPLETA'}</span><strong>{body.kind === 'star' ? 'Estrela' : formatPeriod(body.orbit.period)}</strong></div></div>
        <div className="fun-fact"><Lightbulb size={18} /><div><strong>Você sabia?</strong><p>{body.fact}</p></div></div>
        {body.kind !== 'star' && <p className="rotation-note">Uma rotação: {formatNumber(Math.abs(body.rotationHours))} horas{body.rotationHours < 0 || body.id === 'uranus' ? ' · sentido retrógrado' : ''}.</p>}
        {!body.texture && <p className="artistic-note">Cores ilustrativas · superfície simplificada</p>}
      </> : <div className="moon-list">{moons.length ? <><p>Toque em uma companheira de {body.name} para visitá-la.</p>{moons.map(moon => <button key={moon.id} onClick={() => useStore.getState().select(moon.id)}><PlanetIcon id={moon.id} size={27} /><span>{moon.name}<small>Uma volta em {formatPeriod(moon.orbit.period)}</small></span><ArrowUpRight size={17} /></button>)}<p className="artistic-note">Seleção de luas para explorar. Não representa a contagem total.</p></> : <p>{body.kind === 'star' ? 'Os planetas giram ao redor do Sol. As luas giram ao redor dos planetas!' : body.kind === 'moon' ? `Eu mesma sou uma lua de ${bodyById[body.parent!].name}!` : `${body.name} não tem luas naturais. Vamos conhecer as luas de outro planeta?`}</p>}</div>}
    </div>
    <div className="card-actions">{view === 'system' ? <button className="primary-button full-width" onClick={() => useStore.getState().inspect(body.id)}><Rocket size={17} /> Abrir visão isolada <MoveUpRight size={17} /></button> : body.kind === 'moon' ? <button className="primary-button full-width" onClick={() => useStore.getState().select(body.parent!)}><ArrowLeft size={17} /> Voltar para {bodyById[body.parent!].name}</button> : <button className="primary-button full-width" onClick={() => useStore.getState().startQuiz(body.id === 'sun' ? undefined : body.id)}>Jogar um desafio <ArrowUpRight size={17} /></button>}
      {'speechSynthesis' in window && <button className="text-button read-body" onClick={() => readAloud(`${body.name}. ${body.intro} ${body.fact}`)}><Volume2 size={14} /> Ouvir a descoberta</button>}
    </div>
  </aside>;
}
