import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const STORY_SELECTOR = '[data-impact-story]';
const STAGE_LABELS = ['Challenge', 'Decision', 'Outcome'];
const instances = new WeakMap();

function resolveStory(root) {
  if (!root) return null;
  if (root.matches?.(STORY_SELECTOR)) return root;
  return root.querySelector?.(STORY_SELECTOR) ?? null;
}

function setStoryFocus(story, focused) {
  const documentElement = story.ownerDocument.documentElement;
  const desktop = story.ownerDocument.defaultView?.matchMedia('(min-width: 801px)').matches;
  if (focused && desktop) documentElement.dataset.storyFocus = 'impact';
  else if (documentElement.dataset.storyFocus === 'impact') delete documentElement.dataset.storyFocus;
}

function activateStage(caseElement, nextStage, progress) {
  const progressLine = caseElement.querySelector('[data-impact-progress]');
  if (progressLine) gsap.set(progressLine, { scaleX: progress, transformOrigin: 'left center' });

  if (Number(caseElement.dataset.impactStage) === nextStage + 1) return;

  const stages = Array.from(caseElement.querySelectorAll('[data-impact-stage]'));
  const status = caseElement.querySelector('[data-impact-status]');
  stages.forEach((stage, index) => {
    const isActive = index === nextStage;
    const isComplete = index < nextStage;
    stage.classList.toggle('is-active', isActive);
    stage.classList.toggle('is-complete', isComplete);
    if (isActive) stage.setAttribute('aria-current', 'step');
    else stage.removeAttribute('aria-current');
  });
  caseElement.dataset.impactStage = String(nextStage + 1);
  if (status) status.textContent = STAGE_LABELS[nextStage];
}

export function initImpactScrollytelling(root) {
  if (typeof globalThis.window === 'undefined') return () => {};

  const story = resolveStory(root ?? globalThis.document);
  if (!story) return () => {};

  const existingCleanup = instances.get(story);
  if (existingCleanup) return existingCleanup;

  gsap.registerPlugin(ScrollTrigger);

  const cases = Array.from(story.querySelectorAll('[data-impact-case]'));
  if (cases.length === 0) return () => {};

  let alive = true;
  const media = gsap.matchMedia();

  media.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 801px)',
      compact: '(max-width: 800px)',
    },
    (context) => {
      const { reduce, desktop } = context.conditions;
      story.dataset.motion = reduce ? 'reduced' : desktop ? 'stacked' : 'compact';

      cases.forEach((caseElement) => activateStage(caseElement, reduce ? 2 : 0, reduce ? 1 : 0));
      if (reduce) return () => {};

      const focusTrigger = desktop ? ScrollTrigger.create({
        trigger: story,
        start: 'top 72%',
        end: 'bottom 28%',
        onToggle: ({ isActive }) => setStoryFocus(story, isActive),
      }) : null;

      if (desktop) {
        const triggers = cases.map((caseElement) => {
          const card = caseElement.querySelector('[data-impact-card]');
          return ScrollTrigger.create({
            trigger: caseElement,
            start: 'top top+=96',
            end: 'bottom bottom-=64',
            scrub: .75,
            onToggle: (trigger) => caseElement.classList.toggle('is-active', trigger.isActive),
            onUpdate: (trigger) => {
              const stage = Math.min(2, Math.floor(trigger.progress * 3));
              activateStage(caseElement, stage, trigger.progress);
              if (card) {
                const closing = Math.max(0, (trigger.progress - .84) / .16);
                gsap.set(card, { scale: 1 - closing * .035, opacity: 1 - closing * .18 });
              }
            },
          });
        });
        return () => {
          focusTrigger?.kill();
          triggers.forEach((trigger) => trigger.kill());
          setStoryFocus(story, false);
        };
      }

      const triggers = cases.flatMap((caseElement) => {
        const stages = Array.from(caseElement.querySelectorAll('[data-impact-stage]'));
        return stages.map((stage, index) => ScrollTrigger.create({
          trigger: stage,
          start: 'top 70%',
          end: 'bottom 30%',
          onEnter: () => activateStage(caseElement, index, (index + 1) / stages.length),
          onEnterBack: () => activateStage(caseElement, index, (index + 1) / stages.length),
        }));
      });
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
    cases.forEach((caseElement) => {
      caseElement.classList.remove('is-active');
      caseElement.removeAttribute('data-impact-stage');
      caseElement.querySelectorAll('[data-impact-stage]').forEach((stage) => {
        stage.classList.remove('is-active', 'is-complete');
        stage.removeAttribute('aria-current');
      });
    });
    delete story.dataset.motion;
    instances.delete(story);
  };

  instances.set(story, cleanup);
  return cleanup;
}
