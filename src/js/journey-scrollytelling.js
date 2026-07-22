import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const STORY_SELECTOR = '[data-journey-story]';
const instances = new WeakMap();

function resolveStory(root) {
  if (!root) return null;
  if (root.matches?.(STORY_SELECTOR)) return root;
  return root.querySelector?.(STORY_SELECTOR) ?? null;
}

function setStoryFocus(story, focused) {
  const documentElement = story.ownerDocument.documentElement;
  if (focused) documentElement.dataset.storyFocus = 'journey';
  else if (documentElement.dataset.storyFocus === 'journey') delete documentElement.dataset.storyFocus;
}

export function initJourneyScrollytelling(root) {
  if (typeof globalThis.window === 'undefined') return () => {};

  const story = resolveStory(root ?? globalThis.document);
  if (!story) return () => {};

  const existingCleanup = instances.get(story);
  if (existingCleanup) return existingCleanup;

  gsap.registerPlugin(ScrollTrigger);

  const steps = Array.from(story.querySelectorAll('[data-journey-step]'));
  if (steps.length === 0) return () => {};

  let activeStep = -1;
  let alive = true;

  const activate = (nextStep) => {
    if (nextStep === activeStep) return;
    activeStep = nextStep;
    story.dataset.journeyStage = String(nextStep + 1);

    steps.forEach((step, index) => {
      const isActive = index === nextStep;
      step.classList.toggle('is-active', isActive);
      if (isActive) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });

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
        activate(steps.length - 1);
        return () => {};
      }

      activate(0);
      const triggers = steps.map((step, index) => ScrollTrigger.create({
        trigger: step,
        start: desktop ? 'top 62%' : 'top 68%',
        end: desktop ? 'bottom 38%' : 'bottom 32%',
        onEnter: () => activate(index),
        onEnterBack: () => activate(index),
      }));

      const focusTrigger = desktop ? ScrollTrigger.create({
        trigger: story,
        start: 'top 72%',
        end: 'bottom 28%',
        onToggle: ({ isActive }) => setStoryFocus(story, isActive),
      }) : null;

      return () => {
        focusTrigger?.kill();
        triggers.forEach((trigger) => trigger.kill());
        setStoryFocus(story, false);
      };
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
    setStoryFocus(story, false);
    steps.forEach((step) => {
      step.classList.remove('is-active');
      step.removeAttribute('aria-current');
    });
    delete story.dataset.motion;
    delete story.dataset.journeyStage;
    instances.delete(story);
  };

  instances.set(story, cleanup);
  return cleanup;
}
