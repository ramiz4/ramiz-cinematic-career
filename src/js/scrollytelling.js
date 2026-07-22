import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const STORY_SELECTOR = '[data-system-story]';
const instances = new WeakMap();
const noop = () => {};
const SYSTEM_STEPS = [
  ['01 / 05', 'Constraint map'],
  ['02 / 05', 'Boundaries emerge'],
  ['03 / 05', 'Intentional flow'],
  ['04 / 05', 'Delivery path'],
  ['05 / 05', 'Ownership aligned'],
];

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

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  const scrollRegion = story.querySelector('[data-system-scroll]') ?? story;
  const visual = story.querySelector('[data-system-visual]');
  const monolith = story.querySelector('[data-graph="monolith"]');
  const warnings = queryAll(story, '[data-graph="warning"]');
  const services = queryAll(story, '[data-graph="service"]');
  const flowPaths = queryAll(story, '[data-graph="flow"]');
  const pipelinePaths = queryAll(story, '[data-graph="pipeline"]');
  const metrics = queryAll(story, '[data-graph="metric"]');
  const ownershipZones = queryAll(story, '[data-graph="ownership-zone"]');
  const packets = queryAll(story, '[data-graph="packet"]');
  const outcome = story.querySelector('[data-graph="outcome"]');
  const scan = story.querySelector('[data-graph="scan"]');
  const graphCamera = story.querySelector('[data-graph-camera]');
  const steps = queryAll(story, '[data-story-step]');
  const progress = story.querySelector('[data-story-progress]');
  const stepIndex = story.querySelector('[data-system-step-index]');
  const stepLabel = story.querySelector('[data-system-step-label]');

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
    if (stepIndex) stepIndex.textContent = SYSTEM_STEPS[nextStep][0];
    if (stepLabel) stepLabel.textContent = SYSTEM_STEPS[nextStep][1];
    onStepChange(nextStep, stepId);
  };

  const setSystemFocus = (focused) => {
    const documentElement = story.ownerDocument.documentElement;
    if (focused) documentElement.dataset.storyFocus = 'system';
    else if (documentElement.dataset.storyFocus === 'system') delete documentElement.dataset.storyFocus;
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

      gsap.set([monolith, ...warnings, ...services, ...metrics, ...ownershipZones, ...packets, outcome], {
        transformBox: 'fill-box',
        transformOrigin: '50% 50%',
      });
      if (graphCamera) gsap.set(graphCamera, { transformBox: 'view-box', transformOrigin: '50% 48%' });
      gsap.set(monolith, { autoAlpha: 1, scale: 1 });
      gsap.set(warnings, { autoAlpha: 0 });
      gsap.set(services, { autoAlpha: 0, scale: .72 });
      gsap.set(metrics, { autoAlpha: 0, y: 16 });
      gsap.set(ownershipZones, { autoAlpha: 0, scale: .96 });
      gsap.set(packets, { autoAlpha: 0 });
      if (outcome) gsap.set(outcome, { autoAlpha: 0, x: 18 });
      if (scan) gsap.set(scan, { autoAlpha: .45, yPercent: -120 });
      if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });
      prepareDrawPaths(drawablePaths);
      gsap.set(drawablePaths, { autoAlpha: 0 });

      if (reduce) {
        gsap.set(monolith, { autoAlpha: 0 });
        gsap.set(services, { autoAlpha: 1, scale: 1 });
        gsap.set(drawablePaths, { autoAlpha: 1, strokeDashoffset: 0 });
        gsap.set([...metrics, ...ownershipZones], { autoAlpha: 1, scale: 1, y: 0 });
        if (outcome) gsap.set(outcome, { autoAlpha: 1, x: 0 });
        if (scan) gsap.set(scan, { autoAlpha: 0 });
        if (progress) gsap.set(progress, { scaleX: 1 });
        activateStep(1);
        return noop;
      }

      activateStep(0);

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: scrollRegion,
          start: desktop ? 'top top' : 'top 65%',
          end: desktop ? 'bottom bottom' : 'bottom 35%',
          scrub: desktop ? .9 : .45,
          pin: desktop ? visual : false,
          pinSpacing: false,
          anticipatePin: desktop ? 1 : 0,
          invalidateOnRefresh: true,
          onUpdate: (trigger) => activateStep(trigger.progress),
        },
      });

      const focusTrigger = ScrollTrigger.create({
        trigger: scrollRegion,
        start: desktop ? 'top top' : 'top 68%',
        end: desktop ? 'bottom bottom' : 'bottom 32%',
        onToggle: (trigger) => setSystemFocus(trigger.isActive),
      });

      timeline
        .addLabel('pressure', 0)
        .to(scan, { autoAlpha: 0, yPercent: 820, duration: .9 }, 0)
        .to(warnings, { autoAlpha: 1, duration: .45, stagger: .07 }, .08)
        .addLabel('boundaries', 1)
        .to(warnings, { autoAlpha: 0, duration: .25 }, .92)
        .to(monolith, { autoAlpha: 0, scale: .7, duration: .55 }, 1)
        .to(graphCamera, { scale: .94, duration: .7 }, 1)
        .to(services, { autoAlpha: 1, scale: 1, duration: .7, stagger: .055 }, 1.05)
        .addLabel('flow', 2)
        .to(graphCamera, { scale: 1, duration: .65 }, 2)
        .set(flowPaths, { autoAlpha: 1 }, 2)
        .to(flowPaths, { strokeDashoffset: 0, duration: .9, stagger: .04 }, 2)
        .set(packets, { autoAlpha: 1 }, 2.08)
        .to(packets[0], { motionPath: { path: flowPaths[1], align: flowPaths[1], alignOrigin: [.5, .5] }, duration: .62 }, 2.08)
        .to(packets[1], { motionPath: { path: flowPaths[2], align: flowPaths[2], alignOrigin: [.5, .5] }, duration: .62 }, 2.18)
        .to(packets[2], { motionPath: { path: flowPaths[3], align: flowPaths[3], alignOrigin: [.5, .5] }, duration: .62 }, 2.28)
        .to(packets[3], { motionPath: { path: flowPaths[6], align: flowPaths[6], alignOrigin: [.5, .5] }, duration: .62 }, 2.36)
        .to(packets, { autoAlpha: 0, duration: .16 }, 2.84)
        .addLabel('delivery', 3)
        .set(pipelinePaths, { autoAlpha: 1 }, 3)
        .to(pipelinePaths, { strokeDashoffset: 0, duration: .75, stagger: .06 }, 3)
        .to(metrics, { autoAlpha: 1, y: 0, duration: .55, stagger: .08 }, 3.16)
        .addLabel('ownership', 4)
        .to(graphCamera, { scale: .96, duration: .65 }, 4)
        .to(ownershipZones, { autoAlpha: 1, scale: 1, duration: .65, stagger: .08 }, 4)
        .to(outcome, { autoAlpha: 1, x: 0, duration: .55 }, 4.3);

      if (progress) timeline.to(progress, { scaleX: 1, duration: 5 }, 0);

      return () => {
        focusTrigger.kill();
        activeStep = -1;
        setSystemFocus(false);
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
    setSystemFocus(false);
    delete story.dataset.motion;
    instances.delete(story);
  };

  instances.set(story, cleanup);
  return cleanup;
}
