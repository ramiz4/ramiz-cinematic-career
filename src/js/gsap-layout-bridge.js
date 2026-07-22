import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setTargetX } from './three-viewport-controller.js';

const instances = new WeakMap();
const noop = () => {};
const EDGE_TRANSITION_SHARE = .12;
const SCRUB_DURATION = .55;

const LAYOUT_ZONES = [
  { selector: '[data-system-scroll]', x: -.56 },
  { selector: '[data-journey-story]', x: -.6 },
  { selector: '[data-impact-story]', x: -.82 },
  { selector: '[data-operating-story]', x: -1 },
];

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothStep(progress) {
  const value = clamp(progress, 0, 1);
  return value * value * (3 - 2 * value);
}

/**
 * Converts local story progress into a reversible collision-avoidance path.
 * The WebGL world travels left at the leading edge, remains clear of the UI,
 * and returns right at the trailing edge. The same curve is used in reverse.
 */
export function resolveLayoutX(progress, targetX, edgeShare = EDGE_TRANSITION_SHARE) {
  const normalizedProgress = clamp(Number(progress) || 0, 0, 1);
  const normalizedTarget = clamp(Number(targetX) || 0, -1, 1);
  const normalizedEdge = clamp(Number(edgeShare) || EDGE_TRANSITION_SHARE, .01, .5);

  if (normalizedProgress === 0 || normalizedProgress === 1) return 0;

  if (normalizedProgress < normalizedEdge) {
    return normalizedTarget * smoothStep(normalizedProgress / normalizedEdge);
  }

  if (normalizedProgress > 1 - normalizedEdge) {
    return normalizedTarget * smoothStep((1 - normalizedProgress) / normalizedEdge);
  }

  return normalizedTarget;
}

function resolveDocument(root) {
  if (!root) return globalThis.document ?? null;
  if (root.nodeType === 9) return root;
  return root.ownerDocument ?? null;
}

function applyLayout(document, x, targetX = x) {
  const html = document.documentElement;
  const isShifted = Math.abs(x) > .01;
  const name = isShifted ? 'left' : 'right';
  const semanticX = String(isShifted ? targetX : 0);

  if (html.dataset.threeViewport !== name) html.dataset.threeViewport = name;
  if (html.dataset.threeViewportX !== semanticX) html.dataset.threeViewportX = semanticX;

  // ScrollTrigger already damps its scrubbed progress. Updating the Three.js
  // target directly keeps the geometry locked to scroll without a second,
  // direction-dependent animation competing in the RAF controller.
  setTargetX(x, 0);
}

/**
 * Maps semantic story regions to Three.js viewport positions. ScrollTrigger
 * supplies reversible, scrubbed progress while rendering remains in WebGL.
 */
export function initGsapLayoutBridge(root = globalThis.document) {
  if (typeof globalThis.window === 'undefined') return noop;

  const document = resolveDocument(root);
  if (!document) return noop;

  const existingCleanup = instances.get(document);
  if (existingCleanup) return existingCleanup;

  gsap.registerPlugin(ScrollTrigger);
  let alive = true;
  const media = gsap.matchMedia();

  media.add(
    {
      desktop: '(min-width: 801px)',
      reduce: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { desktop, reduce } = context.conditions;
      if (!desktop || reduce) {
        applyLayout(document, 0);
        return noop;
      }

      const activeZones = new Set();
      const tweens = LAYOUT_ZONES.flatMap((zone) => {
        const element = document.querySelector(zone.selector);
        if (!element) return [];

        const state = { progress: 0 };
        let isActive = false;
        const sync = () => {
          if (!isActive) return;
          applyLayout(document, resolveLayoutX(state.progress, zone.x), zone.x);
        };

        return [gsap.to(state, {
          progress: 1,
          ease: 'none',
          onUpdate: sync,
          scrollTrigger: {
            id: `three-viewport:${zone.selector}`,
            trigger: element,
            start: zone.start ?? 'top 88%',
            end: zone.end ?? 'bottom 12%',
            scrub: SCRUB_DURATION,
            invalidateOnRefresh: true,
            onToggle: (trigger) => {
              isActive = trigger.isActive;
              if (isActive) {
                activeZones.add(zone);
                sync();
              } else {
                activeZones.delete(zone);
                if (activeZones.size === 0) applyLayout(document, 0);
              }
            },
          },
        })];
      });

      return () => {
        activeZones.clear();
        tweens.forEach((tween) => tween.kill());
      };
    },
  );

  document.fonts?.ready.then(() => {
    if (alive) ScrollTrigger.refresh();
  }).catch(noop);

  const cleanup = () => {
    if (!alive) return;
    alive = false;
    media.revert();
    applyLayout(document, 0);
    delete document.documentElement.dataset.threeViewport;
    delete document.documentElement.dataset.threeViewportX;
    instances.delete(document);
  };

  instances.set(document, cleanup);
  return cleanup;
}
