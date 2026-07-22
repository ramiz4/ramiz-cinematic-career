import { describe, expect, it } from 'vitest';
import { resolveLayoutX } from './gsap-layout-bridge.js';

describe('GSAP layout bridge', () => {
  it('moves into and out of a collision zone with the same scroll-bound curve', () => {
    expect(resolveLayoutX(0, -.8)).toBe(0);
    expect(resolveLayoutX(.06, -.8)).toBeCloseTo(-.4, 5);
    expect(resolveLayoutX(.12, -.8)).toBe(-.8);
    expect(resolveLayoutX(.5, -.8)).toBe(-.8);
    expect(resolveLayoutX(.88, -.8)).toBe(-.8);
    expect(resolveLayoutX(.94, -.8)).toBeCloseTo(-.4, 5);
    expect(resolveLayoutX(1, -.8)).toBe(0);
  });

  it('clamps invalid progress and viewport targets', () => {
    expect(resolveLayoutX(-1, -2)).toBe(0);
    expect(resolveLayoutX(.5, -2)).toBe(-1);
    expect(resolveLayoutX(2, -2)).toBe(0);
  });
});
