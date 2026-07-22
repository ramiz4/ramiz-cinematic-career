import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setTargetX } from './three-viewport-controller.js';

const instances = new WeakMap();
const noop = () => {};
const SHIFT_DURATION = .85;

const LAYOUT_ZONES = [
  { selector: '#hero', x: 0, name: 'right', start: 'top 82%' },
  { selector: '#system', x: 0, name: 'right', start: 'top 82%' },
  { selector: '[data-system-scroll]', x: -.56, name: 'left', start: 'top 70%', end: 'bottom 30%', backX: 0, backName: 'right' },
  { selector: '#journey', x: 0, name: 'right', start: 'top 82%' },
  { selector: '[data-journey-story]', x: -.6, name: 'left', start: 'top 72%', end: 'bottom 28%', backX: 0, backName: 'right' },
  { selector: '#impact', x: 0, name: 'right', start: 'top 82%' },
  { selector: '[data-impact-story]', x: -.82, name: 'left', start: 'top 72%', end: 'bottom 28%', backX: 0, backName: 'right' },
  { selector: '#leadership', x: 0, name: 'right', start: 'top 82%' },
  { selector: '[data-operating-story]', x: -1, name: 'left', start: 'top 70%', end: 'bottom 30%', backX: 0, backName: 'right' },
  { selector: '#contact', x: 0, name: 'right', start: 'top 82%' },
];

function resolveDocument(root) {
  if (!root) return globalThis.document ?? null;
  if (root.nodeType === 9) return root;
  return root.ownerDocument ?? null;
}

function applyLayout(document, x, name, duration = SHIFT_DURATION) {
  const html = document.documentElement;
  const normalizedX = String(x);
  if (html.dataset.threeViewportX === normalizedX && html.dataset.threeViewport === name) return;

  html.dataset.threeViewport = name;
  html.dataset.threeViewportX = normalizedX;
  setTargetX(x, duration);
}

/**
 * Maps semantic story regions to Three.js viewport positions. ScrollTrigger only
 * changes controller targets; all interpolation stays inside the WebGL RAF loop.
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
        applyLayout(document, 0, 'right', 0);
        return noop;
      }

      const triggers = LAYOUT_ZONES.flatMap((zone) => {
        const element = document.querySelector(zone.selector);
        if (!element) return [];

        const activate = () => applyLayout(document, zone.x, zone.name);
        return [ScrollTrigger.create({
          id: `three-viewport:${zone.selector}`,
          trigger: element,
          start: zone.start ?? 'top 54%',
          end: zone.end ?? 'bottom 46%',
          onEnter: activate,
          onEnterBack: activate,
          onLeaveBack: () => {
            if (zone.backX !== undefined) {
              applyLayout(document, zone.backX, zone.backName ?? 'right');
            }
          },
        })];
      });

      return () => triggers.forEach((trigger) => trigger.kill());
    },
  );

  document.fonts?.ready.then(() => {
    if (alive) ScrollTrigger.refresh();
  }).catch(noop);

  const cleanup = () => {
    if (!alive) return;
    alive = false;
    media.revert();
    setTargetX(0, 0);
    delete document.documentElement.dataset.threeViewport;
    delete document.documentElement.dataset.threeViewportX;
    instances.delete(document);
  };

  instances.set(document, cleanup);
  return cleanup;
}
