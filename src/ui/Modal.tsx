import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useStore } from '../state';

export function Modal({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); useStore.getState().setModal(null); }
      if (e.key === 'Tab' && ref.current) {
        const focusable = Array.from(ref.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, [tabindex="0"]')).filter(el => el.getClientRects().length);
        const first = focusable[0], last = focusable.at(-1);
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handle, true);
    return () => { document.removeEventListener('keydown', handle, true); previous?.focus(); if ('speechSynthesis' in window) speechSynthesis.cancel(); };
  }, []);
  return createPortal(<div className="modal-backdrop" onPointerDown={e => { if (e.target === e.currentTarget) useStore.getState().setModal(null); }}>
    <div ref={ref} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1}>
      <div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Fechar janela" onClick={() => useStore.getState().setModal(null)}><X size={21} /></button></div>
      {children}
    </div>
  </div>, document.body);
}
