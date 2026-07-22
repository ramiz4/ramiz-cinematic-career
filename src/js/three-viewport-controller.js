const DEFAULT_SHIFT_DURATION = .9;
const POINTER_DAMPING = 7.5;

const output = {
  layoutX: 0,
  pointerX: 0,
  pointerY: 0,
  rotationX: 0,
  rotationY: 0,
};

const state = {
  initialized: false,
  eventTarget: null,
  layoutX: 0,
  shiftStartX: 0,
  shiftTargetX: 0,
  shiftElapsed: 0,
  shiftDuration: 0,
  pointerX: 0,
  pointerY: 0,
  pointerTargetX: 0,
  pointerTargetY: 0,
};

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function smootherStep(progress) {
  const value = clamp(progress, 0, 1);
  return value * value * value * (value * (value * 6 - 15) + 10);
}

function damp(current, target, damping, delta) {
  return current + (target - current) * (1 - Math.exp(-damping * delta));
}

function resetPointerTarget() {
  state.pointerTargetX = 0;
  state.pointerTargetY = 0;
}

function handlePointerMove(event) {
  if (event.pointerType === 'touch') return;

  const width = Math.max(globalThis.innerWidth || 1, 1);
  const height = Math.max(globalThis.innerHeight || 1, 1);
  state.pointerTargetX = clamp((event.clientX / width) * 2 - 1, -1, 1);
  state.pointerTargetY = clamp((event.clientY / height) * 2 - 1, -1, 1);
}

function handlePointerOut(event) {
  if (!event.relatedTarget) resetPointerTarget();
}

/**
 * Starts the pointer input layer used by the persistent Three.js viewport.
 * Calling this function repeatedly is safe; only one listener set is active.
 */
export function initThreeViewportController({ eventTarget = globalThis.window } = {}) {
  if (!eventTarget?.addEventListener) return destroyThreeViewportController;
  if (state.initialized && state.eventTarget === eventTarget) return destroyThreeViewportController;

  destroyThreeViewportController();
  state.initialized = true;
  state.eventTarget = eventTarget;
  eventTarget.addEventListener('pointermove', handlePointerMove, { passive: true });
  eventTarget.addEventListener('pointerout', handlePointerOut, { passive: true });
  eventTarget.addEventListener('blur', resetPointerTarget);

  return destroyThreeViewportController;
}

/**
 * Sets the collision-avoidance offset in normalized viewport coordinates.
 * A value of -0.4 moves the Three.js world 40% of the viewport half-width left.
 */
export function setTargetX(normalizedX = 0, duration = DEFAULT_SHIFT_DURATION) {
  state.shiftStartX = state.layoutX;
  state.shiftTargetX = clamp(Number(normalizedX) || 0, -1, 1);
  state.shiftElapsed = 0;
  state.shiftDuration = Math.max(0, Number(duration) || 0);

  if (state.shiftDuration === 0) state.layoutX = state.shiftTargetX;
}

/**
 * Advances all non-story transforms from the existing WebGL RAF loop.
 * The returned object is reused to avoid per-frame allocations.
 */
export function updateThreeViewport(delta = 1 / 60) {
  const safeDelta = clamp(Number(delta) || 0, 0, .1);

  if (state.shiftDuration > 0 && state.layoutX !== state.shiftTargetX) {
    state.shiftElapsed = Math.min(state.shiftDuration, state.shiftElapsed + safeDelta);
    const progress = smootherStep(state.shiftElapsed / state.shiftDuration);
    state.layoutX = state.shiftStartX + (state.shiftTargetX - state.shiftStartX) * progress;
  }

  state.pointerX = damp(state.pointerX, state.pointerTargetX, POINTER_DAMPING, safeDelta);
  state.pointerY = damp(state.pointerY, state.pointerTargetY, POINTER_DAMPING, safeDelta);

  output.layoutX = state.layoutX;
  output.pointerX = state.pointerX;
  output.pointerY = -state.pointerY;
  output.rotationX = -state.pointerY * .1;
  output.rotationY = state.pointerX * .16;
  return output;
}

export function destroyThreeViewportController() {
  const eventTarget = state.eventTarget;
  if (eventTarget?.removeEventListener) {
    eventTarget.removeEventListener('pointermove', handlePointerMove);
    eventTarget.removeEventListener('pointerout', handlePointerOut);
    eventTarget.removeEventListener('blur', resetPointerTarget);
  }

  state.initialized = false;
  state.eventTarget = null;
  state.pointerX = 0;
  state.pointerY = 0;
  state.layoutX = 0;
  state.shiftStartX = 0;
  state.shiftTargetX = 0;
  state.shiftElapsed = 0;
  state.shiftDuration = 0;
  resetPointerTarget();
}
