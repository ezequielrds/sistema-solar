import { ArrowUpRight, BookOpen, Check, Sparkles } from 'lucide-react';
import { planets, moons } from '../content/bodies';
import { useStore } from '../state';
import { calculateXP, completedMissions } from './rules';
import { PlanetIcon } from '../ui/PlanetIcon';

export function Passport() {
  const progress = useStore(s => s.progress);
  const xp = calculateXP(progress);
  return <section className="collection-page"><div className="page-eyebrow"><BookOpen size={16} /> LEMBRANÇAS DA SUA JORNADA</div><h1>Meu passaporte espacial<span>.</span></h1><p className="page-lead">Cada mundo visitado vira um carimbo. Qual será o próximo?</p>
    <div className="passport-banner"><span className="passport-astronaut" aria-hidden="true">🧑‍🚀</span><div><span className="eyebrow">EXPLORADOR OFICIAL DO UNIVERSO</span><h2>{xp >= 500 ? 'Comandante espacial' : xp >= 150 ? 'Viajante espacial' : 'Pequeno explorador'}</h2><p>Uma grande viagem começa com a curiosidade.</p></div><div className="passport-xp"><Sparkles size={22} /><strong>{xp}</strong><span>estrelas conquistadas</span></div></div>
    <div className="collection-title"><h2>Os oito planetas</h2><span>{planets.filter(p => progress.visited.includes(p.id)).length}/8 visitados</span></div>
    <div className="stamp-grid">{planets.map((planet, index) => {
      const visited = progress.visited.includes(planet.id), known = progress.correct.includes(planet.id);
      return <button key={planet.id} className={`stamp ${visited ? 'stamped' : ''}`} onClick={() => useStore.getState().select(planet.id, true)} aria-label={`Carimbo de ${planet.name}: ${visited ? 'visitado' : 'a descobrir'}`}><span className="stamp-number">{String(index + 1).padStart(2, '0')}</span><PlanetIcon id={planet.id} size={65} /><h3>{planet.name}</h3><span className="stamp-status">{known ? <><Sparkles size={13} /> Nome aprendido</> : visited ? <><Check size={13} /> Mundo visitado</> : <>Vamos visitar <ArrowUpRight size={13} /></>}</span></button>;
    })}</div>
    <div className="collection-title"><h2>Companheiras de viagem</h2><span>{moons.filter(m => progress.visited.includes(m.id)).length}/{moons.length} luas visitadas</span></div><div className="moon-stamps">{moons.map(moon => <button key={moon.id} className={progress.visited.includes(moon.id) ? 'visited' : ''} onClick={() => useStore.getState().select(moon.id, true)}><PlanetIcon id={moon.id} size={25} />{moon.name}{progress.correct.includes(moon.id) && <Sparkles size={13} />}</button>)}</div>
    <div className="collection-title"><h2>Minhas conquistas</h2><span>{completedMissions(progress).length} medalhas</span></div><div className="medals">{completedMissions(progress).length ? completedMissions(progress).map(mission => <div className="medal" key={mission.id}><span>{mission.icon}</span><strong>{mission.title}</strong></div>) : <p>Suas medalhas vão aparecer aqui. Visite a Terra para conquistar a primeira! 🌍</p>}</div><p className="storage-note">Seu passaporte fica salvo somente neste navegador. Limpar os dados do site apaga seu progresso.</p>
  </section>;
}
