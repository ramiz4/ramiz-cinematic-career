import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { STORY_PHASES } from './storyPhases';
import { useActiveStoryPhase } from './useActiveStoryPhase';

describe('useActiveStoryPhase', () => {
  afterEach(() => {
    document.body.replaceChildren();
    delete document.documentElement.dataset.storyPhase;
    vi.restoreAllMocks();
  });

  it('shares one measured phase, remeasures on resize and cancels pending work', () => {
    const offsets = new Map(STORY_PHASES.map((phase, index) => [phase.id, index * 1_000]));
    STORY_PHASES.forEach((phase) => {
      const section = document.createElement('section');
      section.id = phase.id;
      Object.defineProperty(section, 'offsetTop', { configurable: true, get: () => offsets.get(phase.id) });
      document.body.append(section);
    });

    Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: 1_000 });
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });

    let nextFrame = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      nextFrame += 1;
      callbacks.set(nextFrame, callback);
      return nextFrame;
    });
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      callbacks.delete(id);
    });
    const flushFrame = () => {
      const entry = callbacks.entries().next().value as [number, FrameRequestCallback] | undefined;
      if (!entry) throw new Error('Expected a scheduled story-phase frame');
      callbacks.delete(entry[0]);
      act(() => entry[1](0));
    };

    const { result, unmount } = renderHook(() => useActiveStoryPhase());
    flushFrame();
    expect(result.current).toBe(0);
    expect(document.documentElement).toHaveAttribute('data-story-phase', 'hero');

    act(() => {
      window.scrollY = 1_600;
      window.dispatchEvent(new Event('scroll'));
    });
    flushFrame();
    expect(result.current).toBe(2);
    expect(document.documentElement).toHaveAttribute('data-story-phase', 'journey');

    offsets.set('journey', 4_000);
    act(() => window.dispatchEvent(new Event('resize')));
    flushFrame();
    expect(result.current).toBe(1);
    expect(document.documentElement).toHaveAttribute('data-story-phase', 'system');

    act(() => window.dispatchEvent(new Event('scroll')));
    const pendingFrame = callbacks.keys().next().value as number;
    unmount();
    expect(cancelFrame).toHaveBeenCalledWith(pendingFrame);
  });
});
