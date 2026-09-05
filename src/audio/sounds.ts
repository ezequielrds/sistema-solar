let context: AudioContext | null = null;
export function playSound(kind: 'success' | 'tap' | 'try', enabled: boolean) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const notes = kind === 'success' ? [523.25, 659.25, 783.99] : kind === 'tap' ? [440] : [330, 392];
    notes.forEach((frequency, i) => {
      const oscillator = context!.createOscillator(), gain = context!.createGain();
      const now = context!.currentTime + i * .13;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.07, now + .02); gain.gain.exponentialRampToValueAtTime(.001, now + .28);
      oscillator.connect(gain); gain.connect(context!.destination); oscillator.start(now); oscillator.stop(now + .3);
    });
  } catch { /* Browsers without audio remain fully playable. */ }
}
export function readAloud(text: string) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const message = new SpeechSynthesisUtterance(text);
  message.lang = 'pt-BR'; message.rate = .88;
  const voice = speechSynthesis.getVoices().find(v => v.lang === 'pt-BR');
  if (voice) message.voice = voice;
  speechSynthesis.speak(message);
}
