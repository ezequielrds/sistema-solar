import { ArrowRight, Check, Flag, Sparkles } from 'lucide-react';
import { useStore } from '../state';
import { completedMissions, missionProgress, missions, type Mission } from './rules';

export function MissionBoard() {
  const progress = useStore(s => s.progress);
  const completed = completedMissions(progress);
  function start(mission: Mission) {
    const items = mission.kind === 'quiz' ? progress.correct : mission.kind === 'visit' ? progress.visited : progress.speeds;
    const next = mission.target.find(id => !items.includes(id));
    if (mission.kind === 'quiz') useStore.getState().startQuiz(next);
    else if (mission.kind === 'visit' && next) useStore.getState().select(next);
    else { useStore.getState().setSection('explore'); useStore.getState().setModal('help'); }
  }
  return <section className="collection-page">
    <div className="page-eyebrow"><Flag size={16} /> UM UNIVERSO DE CONQUISTAS</div><h1>Cada descoberta é uma aventura<span>.</span></h1><p className="page-lead">Escolha uma missão. Explore no seu ritmo. Você consegue!</p>
    <div className="mission-summary"><div><Sparkles size={25} /><span><strong>{completed.length} de {missions.length}</strong> missões concluídas</span></div><div className="progress-track"><i style={{ width: `${completed.length / missions.length * 100}%` }} /></div><span>{Math.round(completed.length / missions.length * 100)}%</span></div>
    <div className="mission-grid">{missions.map((mission, index) => {
      const count = missionProgress(mission, progress), done = count === mission.target.length;
      return <article className={`mission-card ${done ? 'mission-complete' : ''}`} key={mission.id}><div className="mission-card-top"><span className="mission-emoji" aria-hidden="true">{mission.icon}</span><span className="reward"><Sparkles size={14} /> +{mission.reward}</span></div><span className="eyebrow">MISSÃO {String(index + 1).padStart(2, '0')}</span><h2>{mission.title}</h2><p>{mission.description}</p><div className="mission-progress"><div className="progress-track"><i style={{ width: `${count / mission.target.length * 100}%` }} /></div><span>{count}/{mission.target.length}</span></div><button className={done ? 'completed-button' : 'secondary-button'} disabled={done} onClick={() => start(mission)}>{done ? <><Check size={17} /> Missão cumprida!</> : <>Vamos nessa <ArrowRight size={17} /></>}</button></article>;
    })}</div>
    <button className="primary-button quiz-board-button" onClick={() => useStore.getState().startQuiz()}><Sparkles size={18} /> Jogar desafios de nomes</button>
  </section>;
}
