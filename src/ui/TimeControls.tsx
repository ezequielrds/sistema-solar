import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { simulation, speeds, useStore } from '../state';

export function TimeControls() {
  const speed = useStore(s => s.speed), paused = useStore(s => s.paused);
  const [day, setDay] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setDay(simulation.days), 350); return () => clearInterval(id); }, []);
  return <section className="time-controls" aria-label="Controle da passagem do tempo">
    <button className={`play-button ${paused ? 'paused' : ''}`} aria-label={paused ? 'Continuar o tempo' : 'Pausar o tempo'} onClick={() => useStore.setState({ paused: !paused })}>{paused ? <Play size={19} fill="currentColor" /> : <Pause size={19} fill="currentColor" />}</button>
    <div className="time-title"><span><Timer size={14} /> MÁQUINA DO TEMPO</span><strong>{paused ? 'Tempo pausado' : speeds[speed].label}</strong></div>
    <div className="speed-selector" role="group" aria-label="Cinco velocidades do tempo">{speeds.map((item, index) => <button key={item.name} aria-label={`Velocidade ${index + 1}: ${item.name}, ${item.label}`} aria-pressed={index === speed} className={speed === index ? 'active' : ''} onClick={() => useStore.getState().setSpeed(index)} title={`${item.name} · ${item.label}`}><span>{index + 1}</span><small>{item.short}</small></button>)}</div>
    <div className="day-counter"><span>TEMPO VIAJADO</span><strong>{day < 1 ? `${Math.floor(day * 24)} h` : `${Math.floor(day).toLocaleString('pt-BR')} ${Math.floor(day) === 1 ? 'dia' : 'dias'}`}</strong></div>
    <button className="icon-button reset-time" aria-label="Reiniciar tempo da simulação" onClick={() => { simulation.days = 0; setDay(0); }} title="Voltar ao início"><RotateCcw size={17} /></button>
  </section>;
}
