import { Vector3, type Object3D } from 'three';
export const positions = new Map<string, Vector3>();
export function writePosition(id: string, position: [number, number, number]) {
  if (!positions.has(id)) positions.set(id, new Vector3());
  positions.get(id)!.set(...position);
}

/** Camera targets must include the parent planet's moving reference frame. */
export function writeWorldPosition(id: string, object: Object3D): Vector3 {
  if (!positions.has(id)) positions.set(id, new Vector3());
  return object.getWorldPosition(positions.get(id)!);
}
