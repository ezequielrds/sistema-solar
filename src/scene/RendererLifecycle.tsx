import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { releaseRendererAssets } from '../celestial-bodies/useSurfaceTexture';

export function RendererLifecycle({ onLost }: { onLost: (lost: boolean) => void }) {
  const gl = useThree(s => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); if (canvas.isConnected) onLost(true); };
    const restored = () => onLost(false);
    onLost(false);
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', restored);
    return () => {
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', restored);
      releaseRendererAssets(gl);
    };
  }, [gl, onLost]);
  return null;
}
