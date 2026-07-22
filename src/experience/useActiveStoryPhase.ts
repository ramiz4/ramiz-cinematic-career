import { useSyncExternalStore } from 'react';
import { STORY_PHASES } from './storyPhases';

const ACTIVATION_LINE = .46;

type Listener = () => void;

let activePhase = 0;
let sectionOffsets: number[] = [0];
let frame = 0;
let stopTracking: (() => void) | null = null;
const listeners = new Set<Listener>();

function publish(nextPhase: number) {
  const boundedPhase = Math.min(STORY_PHASES.length - 1, Math.max(0, nextPhase));
  const phaseId = STORY_PHASES[boundedPhase].id;
  const phaseChanged = boundedPhase !== activePhase;

  if (!phaseChanged && document.documentElement.dataset.storyPhase === phaseId) return;

  activePhase = boundedPhase;
  document.documentElement.dataset.storyPhase = phaseId;
  if (phaseChanged) listeners.forEach((listener) => listener());
}

function updateActivePhase() {
  frame = 0;
  const activationPoint = window.scrollY + window.innerHeight * ACTIVATION_LINE;
  let nextPhase = 0;

  sectionOffsets.forEach((offset, index) => {
    if (offset <= activationPoint) nextPhase = index;
  });

  publish(nextPhase);
}

function scheduleUpdate() {
  if (frame) return;
  frame = window.requestAnimationFrame(updateActivePhase);
}

function measureSections() {
  sectionOffsets = STORY_PHASES.map((phase) => document.getElementById(phase.id)?.offsetTop ?? Number.POSITIVE_INFINITY);
  scheduleUpdate();
}

function startTracking() {
  if (typeof window === 'undefined' || stopTracking) return;

  const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measureSections);
  resizeObserver?.observe(document.body);
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', measureSections, { passive: true });
  document.fonts?.ready.then(() => {
    if (stopTracking) measureSections();
  }).catch(() => undefined);
  measureSections();

  stopTracking = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    resizeObserver?.disconnect();
    window.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', measureSections);
    stopTracking = null;
  };
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  startTracking();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopTracking?.();
  };
}

function getSnapshot() {
  return activePhase;
}

export function useActiveStoryPhase() {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}
