import { MOUSE, TOUCH, Vector3 } from 'three';

export type CameraMode = 'orbit' | 'pan';
export function navigationBindings(mode: CameraMode) {
  return {
    mouseButtons: { LEFT: mode === 'pan' ? MOUSE.PAN : MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN },
    touches: { ONE: mode === 'pan' ? TOUCH.PAN : TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN },
  };
}

/** Toolbar zoom preserves the user's panned center, not the selected body's position. */
export function zoomAroundTarget(position: Vector3, target: Vector3, factor: number) {
  const distance = position.distanceTo(target);
  if (!distance) return;
  position.sub(target).multiplyScalar(Math.max(4, Math.min(320, distance * factor)) / distance).add(target);
}
