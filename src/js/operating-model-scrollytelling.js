import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const STORY_SELECTOR = '[data-operating-story]';
const instances = new WeakMap();
const noop = () => {};

function resolveStory(root) {
  if (!root) return null;
  if (root.matches?.(STORY_SELECTOR)) return root;
  return root.querySelector?.(STORY_SELECTOR) ?? null;
}

function prepareDrawPath(path) {
  if (typeof path.getTotalLength !== 'function') return;
  const length = Math.max(path.getTotalLength(), 1);
  path.dataset.operatingPathLength = String(length);
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
}

function setStoryFocus(story, focused) {
  const documentElement = story.ownerDocument.documentElement;
  if (focused) documentElement.dataset.storyFocus = 'leadership';
  else if (documentElement.dataset.storyFocus === 'leadership') delete documentElement.dataset.storyFocus;
}

export function initOperatingModelScrollytelling(root) {
  if (typeof globalThis.window === 'undefined') return noop;

  const story = resolveStory(root ?? globalThis.document);
  if (!story) return noop;

  const existingCleanup = instances.get(story);
  if (existingCleanup) return existingCleanup;

  gsap.registerPlugin(ScrollTrigger);

  const visual = story.querySelector('[data-operating-visual]');
  const steps = Array.from(story.querySelectorAll('[data-operating-step]'));
  const groups = Array.from(story.querySelectorAll('[data-operating-group]'));
  const progress = story.querySelector('[data-operating-progress]');
  const indexLabel = story.querySelector('[data-operating-index]');
  const statusLabel = story.querySelector('[data-operating-label]');

  if (!visual || steps.length === 0 || groups.length !== steps.length) return noop;

  let activeStage = -1;
  let alive = true;

  const activateStage = (nextStage, immediate = false) => {
    if (nextStage === activeStage) return;
    activeStage = nextStage;
    story.dataset.operatingStage = String(nextStage + 1);

    steps.forEach((step, index) => {
      const active = index === nextStage;
      step.classList.toggle('is-active', active);
      if (active) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });

    if (indexLabel) indexLabel.textContent = `${steps[nextStage].dataset.operatingNumber} / 05`;
    if (statusLabel) statusLabel.textContent = steps[nextStage].dataset.operatingStatus ?? '';

    gsap.killTweensOf(groups);
    groups.forEach((group, index) => {
      if (index === nextStage) {
        gsap.to(group, { autoAlpha: 1, y: 0, scale: 1, duration: immediate ? 0 : .46, ease: 'power3.out', overwrite: true });
        const paths = Array.from(group.querySelectorAll('[data-operating-path]'));
        paths.forEach((path) => {
          const length = Number(path.dataset.operatingPathLength ?? 0);
          if (length > 0) gsap.fromTo(path, { strokeDashoffset: length }, { strokeDashoffset: 0, duration: immediate ? 0 : .62, ease: 'power1.inOut', overwrite: true });
        });
      } else {
        gsap.to(group, { autoAlpha: 0, y: index < nextStage ? -12 : 12, scale: .985, duration: immediate ? 0 : .28, ease: 'power2.out', overwrite: true });
      }
    });
  };

  const media = gsap.matchMedia();
  media.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 801px)',
    },
    (context) => {
      const { reduce, desktop } = context.conditions;
      story.dataset.motion = reduce ? 'reduced' : desktop ? 'pinned' : 'compact';

      groups.forEach((group) => {
        gsap.set(group, { autoAlpha: 0, y: 12, scale: .985, transformOrigin: 'center center', transformBox: 'view-box' });
        group.querySelectorAll('[data-operating-path]').forEach(prepareDrawPath);
      });
      if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });

      if (reduce) {
        steps.forEach((step) => step.classList.add('is-active'));
        const finalGroup = groups.at(-1);
        if (finalGroup) {
          gsap.set(finalGroup, { autoAlpha: 1, y: 0, scale: 1 });
          gsap.set(finalGroup.querySelectorAll('[data-operating-path]'), { strokeDashoffset: 0 });
        }
        story.dataset.operatingStage = String(steps.length);
        if (indexLabel) indexLabel.textContent = '05 / 05';
        if (statusLabel) statusLabel.textContent = steps.at(-1)?.dataset.operatingStatus ?? '';
        if (progress) gsap.set(progress, { scaleX: 1 });
        return noop;
      }

      activateStage(0, true);

      steps.forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: desktop ? 'top 58%' : 'top 72%',
          end: desktop ? 'bottom 42%' : 'bottom 38%',
          onEnter: () => activateStage(index),
          onEnterBack: () => activateStage(index),
        });
      });

      ScrollTrigger.create({
        trigger: story,
        start: desktop ? 'top top' : 'top 72%',
        end: 'bottom top',
        onToggle: ({ isActive }) => setStoryFocus(story, isActive),
        onUpdate: ({ progress: normalizedProgress }) => {
          if (progress) gsap.set(progress, { scaleX: normalizedProgress });
        },
      });

      return () => setStoryFocus(story, false);
    },
  );

  globalThis.document.fonts?.ready.then(() => { if (alive) ScrollTrigger.refresh(); }).catch(noop);

  const cleanup = () => {
    alive = false;
    media.revert();
    setStoryFocus(story, false);
    steps.forEach((step) => {
      step.classList.remove('is-active');
      step.removeAttribute('aria-current');
    });
    delete story.dataset.motion;
    delete story.dataset.operatingStage;
    instances.delete(story);
  };

  instances.set(story, cleanup);
  return cleanup;
}
