import type { CSSProperties } from 'react';
import { bodyById } from '../content/bodies';

export function PlanetIcon({ id, size = 28 }: { id: string; size?: number }) {
  const body = bodyById[id];
  const style = { '--planet-color': body?.color ?? '#a89d8c', width: size, height: size, backgroundImage: body?.texture ? `url(${import.meta.env.BASE_URL}textures/${body.texture}-512.webp)` : undefined } as CSSProperties;
  return <span className={`planet-icon ${id === 'saturn' ? 'with-rings' : ''} ${id === 'sun' ? 'sun-icon' : ''}`} style={style} aria-hidden="true" />;
}
