import { Vector3 } from 'three';
export const positions = new Map<string, Vector3>();
export function writePosition(id: string, position: [number, number, number]) {
  if (!positions.has(id)) positions.set(id, new Vector3());
  positions.get(id)!.set(...position);
}
