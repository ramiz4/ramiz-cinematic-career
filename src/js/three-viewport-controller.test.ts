import { afterEach, describe, expect, it } from 'vitest';
import {
  destroyThreeViewportController,
  setTargetX,
  updateThreeViewport,
} from './three-viewport-controller.js';

describe('three viewport controller', () => {
  afterEach(() => destroyThreeViewportController());

  it('interpolates a normalized layout shift without writing DOM layout', () => {
    setTargetX(-.4, 1);

    for (let frame = 0; frame < 5; frame += 1) updateThreeViewport(.1);
    expect(updateThreeViewport(0).layoutX).toBeCloseTo(-.2, 5);
    for (let frame = 0; frame < 5; frame += 1) updateThreeViewport(.1);
    expect(updateThreeViewport(0).layoutX).toBeCloseTo(-.4, 5);
  });

  it('clamps unsafe targets and supports an immediate reset', () => {
    setTargetX(-4, 0);
    expect(updateThreeViewport().layoutX).toBe(-1);

    setTargetX(0, 0);
    expect(updateThreeViewport().layoutX).toBe(0);
  });
});
