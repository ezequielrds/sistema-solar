import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { SRGBColorSpace, Texture, TextureLoader } from 'three';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { useStore } from '../state';

const pending = new WeakMap<object, Map<string, Promise<Texture>>>();
const decoders = new WeakMap<object, KTX2Loader>();

export function releaseRendererAssets(renderer: object) {
  decoders.get(renderer)?.dispose();
  decoders.delete(renderer);
  pending.get(renderer)?.forEach(promise => { void promise.then(texture => texture.dispose()).catch(() => {}); });
  pending.delete(renderer);
}

/** Progressive rendering: a colored sphere appears immediately, then its local surface map. */
export function useSurfaceTexture(name?: string): Texture | null {
  const gl = useThree(s => s.gl);
  const quality = useStore(s => s.quality === 'auto' ? s.autoQuality : s.quality);
  const [texture, setTexture] = useState<Texture | null>(null);
  useEffect(() => {
    if (!name) return;
    let cancelled = false;
    if (!pending.has(gl)) pending.set(gl, new Map());
    const cache = pending.get(gl)!;
    const key = `${name}-${quality}`;
    if (!cache.has(key)) {
      const base = `${import.meta.env.BASE_URL}textures/${name}`;
      const webp = () => new TextureLoader().loadAsync(`${base}-${quality === 'low' ? '512' : '1024'}.webp`);
      let promise: Promise<Texture>;
      if (quality === 'low') promise = webp();
      else {
        if (!decoders.has(gl)) {
          const decoder = new KTX2Loader().setTranscoderPath(`${import.meta.env.BASE_URL}basis/`).setWorkerLimit(2);
          decoder.detectSupport(gl);
          decoders.set(gl, decoder);
        }
        promise = decoders.get(gl)!.loadAsync(`${base}.ktx2`).catch(webp);
      }
      cache.set(key, promise.then(map => { map.colorSpace = SRGBColorSpace; map.anisotropy = 2; return map; }));
    }
    cache.get(key)!.then(map => { if (!cancelled) setTexture(map); }).catch(() => { /* A colored surface remains available even if a texture fails. */ });
    return () => { cancelled = true; };
  }, [name, quality, gl]);
  return texture;
}
