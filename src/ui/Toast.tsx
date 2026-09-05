import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../state';
import { completedMissions } from '../missions/rules';
import { playSound } from '../audio/sounds';

export function Toast() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    let timeout: number;
    const unsubscribe = useStore.subscribe((state, previous) => {
      if (state.progress === previous.progress) return;
      const oldMissions = completedMissions(previous.progress);
      const unlocked = completedMissions(state.progress).find(m => !oldMissions.some(old => old.id === m.id));
      if (unlocked) {
        setMessage(`Missão cumprida: ${unlocked.title} +${unlocked.reward} estrelas!`);
        playSound('success', state.sound);
      } else if (state.progress.visited.length > previous.progress.visited.length) setMessage('Novo carimbo no passaporte! +10 estrelas');
      else return;
      clearTimeout(timeout); timeout = window.setTimeout(() => setMessage(''), 5000);
    });
    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);
  return <div className={`toast ${message ? 'visible' : ''}`} role="status" aria-live="polite">{message && <><Sparkles size={20} /><span>{message}</span></>}</div>;
}
