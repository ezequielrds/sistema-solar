import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface InstallEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
export function usePWA() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [controlled, setControlled] = useState(false);
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({ onRegisterError: error => console.warn('O conteúdo offline ainda não está disponível.', error) });
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setEvent(e as InstallEvent); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const check = () => setControlled(!!navigator.serviceWorker.controller);
    check();
    navigator.serviceWorker.addEventListener('controllerchange', check);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', check);
  }, []);
  return { offlineReady: controlled, needRefresh, dismissUpdate: () => setNeedRefresh(false), update: () => updateServiceWorker(true), installable: !!event, install: async () => { if (event) { await event.prompt(); await event.userChoice; setEvent(null); } } };
}
