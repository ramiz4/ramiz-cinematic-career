import type { PerspectiveCamera } from 'three';

export type MatrixController = {
  camera: PerspectiveCamera;
  destroy: () => void;
};

export function initMatrix(options: {
  canvas: HTMLCanvasElement;
  compact?: boolean;
}): MatrixController | null;

export function destroy(): void;
export function getCamera(): PerspectiveCamera | null;
