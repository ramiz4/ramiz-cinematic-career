import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const STORY_SELECTOR = '[data-journey-story]';
const instances = new WeakMap();

function resolveStory(root) {
  if (!root) return null;
  if (root.matches?.(STORY_SELECTOR)) return root;
  return root.querySelector?.(STORY_SELECTOR) ?? null;
}

export function initJourneyScrollytelling(root) {
  if (typeof globalThis.window === 'undefined') return () => {};

  const story = resolveStory(root ?? globalThis.document);
  if (!story) return () => {};

  const existingCleanup = instances.get(story);
  if (existingCleanup) return existingCleanup;

  gsap.registerPlugin(ScrollTrigger);

  const steps = Array.from(story.querySelectorAll('[data-journey-step]'));
  const rings = Array.from(story.querySelectorAll('[data-journey-ring]'));
  const beam = story.querySelector('[data-journey-beam]');
  const core = story.querySelector('[data-journey-core]');
  const progress = story.querySelector('[data-journey-progress]');
  const indexLabel = story.querySelector('[data-journey-index]');
  const scopeLabel = story.querySelector('[data-journey-label]');

  if (steps.length === 0 || rings.length === 0 || !beam || !core) return () => {};

  let activeStep = -1;
  let alive = true;

  rings.forEach((ring) => {
    const length = typeof ring.getTotalLength === 'function' ? ring.getTotalLength() : 900;
    ring.dataset.pathLength = String(length);
    gsap.set(ring, { strokeDasharray: length, strokeDashoffset: length });
  });
  gsap.set(beam, { transformBox: 'view-box', transformOrigin: '50% 50%' });
  gsap.set(core, { transformBox: 'fill-box', transformOrigin: '50% 50%' });
  if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });

  const activate = (nextStep, immediate = false) => {
    if (nextStep === activeStep) return;
    activeStep = nextStep;

    steps.forEach((step, index) => {
      const isActive = index === nextStep;
      step.classList.toggle('is-active', isActive);
      if (isActive) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });

    if (indexLabel) indexLabel.textContent = `Scope ${String(nextStep + 1).padStart(2, '0')}`;
    if (scopeLabel) scopeLabel.textContent = steps[nextStep]?.dataset.scope ?? '';

    const duration = immediate ? 0 : .55;
    rings.forEach((ring, index) => {
      const reached = index <= nextStep;
      gsap.to(ring, {
        strokeDashoffset: reached ? 0 : Number(ring.dataset.pathLength),
        opacity: index === nextStep ? .95 : reached ? .3 : .07,
        duration,
        ease: 'power2.out',
        overwrite: true,
      });
    });
    gsap.to(beam, { rotation: -58 + nextStep * 29, duration, ease: 'power2.out', overwrite: true });
    gsap.to(core, { scale: 1 + nextStep * .17, duration, ease: 'back.out(1.6)', overwrite: true });
    if (progress) gsap.to(progress, { scaleX: (nextStep + 1) / steps.length, duration, ease: 'power2.out', overwrite: true });
  };

  const media = gsap.matchMedia();
  media.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 801px)',
      compact: '(max-width: 800px)',
    },
    (context) => {
      const { reduce, desktop } = context.conditions;
      story.dataset.motion = reduce ? 'reduced' : desktop ? 'tracked' : 'compact';

      if (reduce) {
        activate(steps.length - 1, true);
        return () => {};
      }

      activate(0, true);
      const triggers = steps.map((step, index) => ScrollTrigger.create({
        trigger: step,
        start: desktop ? 'top 62%' : 'top 68%',
        end: desktop ? 'bottom 38%' : 'bottom 32%',
        onEnter: () => activate(index),
        onEnterBack: () => activate(index),
      }));

      return () => triggers.forEach((trigger) => trigger.kill());
    },
    story,
  );

  story.ownerDocument.fonts?.ready.then(() => {
    if (alive) ScrollTrigger.refresh();
  }).catch(() => {});

  const cleanup = () => {
    if (!alive) return;
    alive = false;
    media.revert();
    steps.forEach((step) => {
      step.classList.remove('is-active');
      step.removeAttribute('aria-current');
    });
    delete story.dataset.motion;
    instances.delete(story);
  };

  instances.set(story, cleanup);
  return cleanup;
}
