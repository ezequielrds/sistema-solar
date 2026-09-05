import { useState } from 'react';
import { ArrowRight, Lightbulb, Sparkles, Volume2 } from 'lucide-react';
import { questions } from '../content/questions';
import { useStore } from '../state';
import { playSound, readAloud } from '../audio/sounds';
import { Modal } from '../ui/Modal';

export function Quiz() {
  const requested = useStore(s => s.quizId), correct = useStore(s => s.progress.correct);
  const [questionIndex, setQuestionIndex] = useState(() => Math.max(0, requested ? questions.findIndex(q => q.id === requested) : questions.findIndex(q => !correct.includes(q.id))));
  const [picked, setPicked] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [round, setRound] = useState(1);
  const q = questions[questionIndex];
  const success = picked === q.answer;
  function choose(option: string) {
    if (success) return;
    setPicked(option);
    const sound = useStore.getState().sound;
    playSound(option === q.answer ? 'success' : 'try', sound);
    if (option === q.answer) useStore.getState().answer(q.id);
  }
  function next() {
    setQuestionIndex((questionIndex + 1) % questions.length);
    setPicked(null); setHint(false); setRound(round + 1);
  }
  return <Modal title="Detetive do espaço" className="quiz-modal">
    <div className="quiz-meta"><span><Sparkles size={15} /> DESAFIO {round}</span><span>+15 estrelas por descoberta</span></div>
    <div className={`quiz-illustration ${success ? 'celebrating' : ''}`} aria-hidden="true">{success ? '🌟' : '🧑‍🚀'}<span className="little-star one">✧</span><span className="little-star two">✦</span><span className="little-star three">✧</span></div>
    <h3 className="quiz-question">{q.prompt}</h3>
    {'speechSynthesis' in window && <button className="text-button listen-button" onClick={() => readAloud(q.prompt)}><Volume2 size={16} /> Ouvir a pergunta</button>}
    <div className="quiz-options">{q.options.map((option, i) => <button key={option} onClick={() => choose(option)} disabled={success} className={`quiz-option ${picked === option ? success ? 'correct' : 'incorrect' : ''}`}><span>{String.fromCharCode(65 + i)}</span>{option}{picked === option && success && <Sparkles size={20} />}</button>)}</div>
    <div className="quiz-feedback" aria-live="polite">
      {success ? <div className="success-message"><strong>Boa, explorador! ✨</strong><p>{q.explanation}</p></div> : picked ? <p className="try-message">Ainda não! {q.hint} Você pode tentar de novo.</p> : hint ? <p className="hint-message">💡 {q.hint}</p> : <p>Sem pressa. Descobrir faz parte da aventura!</p>}
    </div>
    {success ? <button className="primary-button full-width" onClick={next}>Próximo desafio <ArrowRight size={18} /></button> : <button className="secondary-button full-width" onClick={() => setHint(true)}><Lightbulb size={18} /> Quero uma pista</button>}
  </Modal>;
}
