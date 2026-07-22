export type ThreeViewportTransform = Readonly<{
  layoutX: number;
  pointerX: number;
  pointerY: number;
  rotationX: number;
  rotationY: number;
}>;

export function initThreeViewportController(options?: { eventTarget?: Window }): () => void;
export function setTargetX(normalizedX?: number, duration?: number): void;
export function updateThreeViewport(delta?: number): ThreeViewportTransform;
export function destroyThreeViewportController(): void;
