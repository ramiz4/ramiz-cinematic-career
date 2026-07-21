import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const STORY_SELECTOR = '[data-system-story]';
const instances = new WeakMap();
const noop = () => {};

function resolveStory(root) {
  if (!root) return null;
  if (root.matches?.(STORY_SELECTOR)) return root;
  return root.querySelector?.(STORY_SELECTOR) ?? null;
}

function queryAll(scope, selector) {
  return Array.from(scope.querySelectorAll(selector));
}

function prepareDrawPaths(paths) {
  paths.forEach((path) => {
    if (typeof path.getTotalLength !== 'function') return;
    const length = Math.max(path.getTotalLength(), 1);
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  });
}

function clearActiveSteps(steps) {
  steps.forEach((step) => {
    step.classList.remove('is-active');
    step.removeAttribute('aria-current');
  });
}

export function initSystemGraphScrollytelling(root, { onStepChange = noop } = {}) {
  if (typeof globalThis.window === 'undefined') return noop;

  const story = resolveStory(root ?? globalThis.document);
  if (!story) return noop;

  const existingCleanup = instances.get(story);
  if (existingCleanup) return existingCleanup;

  gsap.registerPlugin(ScrollTrigger);

  const scrollRegion = story.querySelector('[data-system-scroll]') ?? story;
  const visual = story.querySelector('[data-system-visual]');
  const monolith = story.querySelector('[data-graph="monolith"]');
  const warnings = queryAll(story, '[data-graph="warning"]');
  const services = queryAll(story, '[data-graph="service"]');
  const flowPaths = queryAll(story, '[data-graph="flow"]');
  const pipelinePaths = queryAll(story, '[data-graph="pipeline"]');
  const metrics = queryAll(story, '[data-graph="metric"]');
  const teams = queryAll(story, '[data-graph="team"]');
  const steps = queryAll(story, '[data-story-step]');
  const progress = story.querySelector('[data-story-progress]');

  if (!visual || !monolith || services.length === 0 || steps.length === 0) return noop;

  let activeStep = -1;
  let alive = true;

  const activateStep = (normalizedProgress) => {
    const nextStep = Math.min(steps.length - 1, Math.floor(normalizedProgress * steps.length));
    if (nextStep === activeStep) return;
    activeStep = nextStep;

    steps.forEach((step, index) => {
      const isActive = index === nextStep;
      step.classList.toggle('is-active', isActive);
      if (isActive) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });

    const stepId = steps[nextStep]?.dataset.storyStep ?? String(nextStep + 1);
    onStepChange(nextStep, stepId);
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
      const drawablePaths = [...flowPaths, ...pipelinePaths];

      story.dataset.motion = reduce ? 'reduced' : desktop ? 'pinned' : 'compact';

      gsap.set([monolith, ...warnings, ...services, ...metrics, ...teams], {
        transformBox: 'fill-box',
        transformOrigin: '50% 50%',
      });
      gsap.set(monolith, { autoAlpha: 1, scale: 1 });
      gsap.set(warnings, { autoAlpha: 0, scale: .75 });
      gsap.set(services, { autoAlpha: 0, scale: .72 });
      gsap.set(metrics, { autoAlpha: 0, y: 16 });
      gsap.set(teams, { autoAlpha: 0, scale: .7 });
      if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });
      prepareDrawPaths(drawablePaths);

      if (reduce) {
        gsap.set(monolith, { autoAlpha: 0 });
        gsap.set(services, { autoAlpha: 1, scale: 1 });
        gsap.set(drawablePaths, { strokeDashoffset: 0 });
        gsap.set([...metrics, ...teams], { autoAlpha: 1, scale: 1, y: 0 });
        if (progress) gsap.set(progress, { scaleX: 1 });
        clearActiveSteps(steps);
        return noop;
      }

      activateStep(0);

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scrollRegion,
          start: desktop ? 'top top' : 'top 65%',
          end: desktop ? 'bottom bottom' : 'bottom 35%',
          scrub: desktop ? .65 : .35,
          pin: desktop ? visual : false,
          pinSpacing: false,
          anticipatePin: desktop ? 1 : 0,
          invalidateOnRefresh: true,
          onUpdate: (trigger) => activateStep(trigger.progress),
        },
      });

      timeline
        .addLabel('pressure', 0)
        .to(monolith, { scale: 1.06, duration: .65 }, 0)
        .to(warnings, { autoAlpha: 1, scale: 1, duration: .45, stagger: .07 }, .08)
        .addLabel('boundaries', 1)
        .to(warnings, { autoAlpha: 0, scale: .85, duration: .25 }, .92)
        .to(monolith, { autoAlpha: 0, scale: .7, duration: .55 }, 1)
        .to(services, { autoAlpha: 1, scale: 1, duration: .7, stagger: .055 }, 1.05)
        .addLabel('flow', 2)
        .to(flowPaths, { strokeDashoffset: 0, duration: .9, stagger: .04 }, 2)
        .addLabel('delivery', 3)
        .to(pipelinePaths, { strokeDashoffset: 0, duration: .75, stagger: .06 }, 3)
        .to(metrics, { autoAlpha: 1, y: 0, duration: .55, stagger: .08 }, 3.16)
        .addLabel('ownership', 4)
        .to(teams, { autoAlpha: 1, scale: 1, duration: .65, stagger: .08 }, 4);

      if (progress) timeline.to(progress, { scaleX: 1, duration: 5 }, 0);

      return () => {
        activeStep = -1;
        delete story.dataset.motion;
      };
    },
    story,
  );

  globalThis.document.fonts?.ready.then(() => {
    if (alive) ScrollTrigger.refresh();
  }).catch(noop);

  const cleanup = () => {
    if (!alive) return;
    alive = false;
    media.revert();
    clearActiveSteps(steps);
    delete story.dataset.motion;
    instances.delete(story);
  };

  instances.set(story, cleanup);
  return cleanup;
}
