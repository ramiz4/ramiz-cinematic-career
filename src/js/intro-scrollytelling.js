import { gsap } from 'gsap';
import { destroy, getCamera, initMatrix } from './matrix3d.js';

const instances = new WeakMap();
const noop = () => {};

export function initSiteIntro(root, { onComplete = noop } = {}) {
  if (!root || typeof globalThis.window === 'undefined') return noop;

  const existingCleanup = instances.get(root);
  if (existingCleanup) return existingCleanup;

  const documentElement = root.ownerDocument.documentElement;
  const canvas = root.querySelector('[data-intro-matrix]');
  const status = root.querySelector('[data-intro-status]');
  const depth = root.querySelector('[data-intro-depth]');
  const hud = root.querySelector('[data-intro-hud]');
  const skip = root.querySelector('[data-intro-skip]');
  const heroTargets = Array.from(root.ownerDocument.querySelectorAll('[data-intro-target]'));
  const interfaceTargets = Array.from(root.ownerDocument.querySelectorAll('.nav, .story-progress'));
  const compact = globalThis.window.matchMedia('(max-width: 800px), (pointer: coarse)').matches;
  const matrix = canvas ? initMatrix({ canvas, compact }) : null;
  const camera = getCamera();

  let finished = false;
  let skipTween;
  let intentTween;

  documentElement.dataset.intro = 'running';
  root.classList.toggle('site-intro--fallback', !matrix);
  gsap.set(hud, { autoAlpha: 0, scale: .9, transformOrigin: 'center center' });
  gsap.set(heroTargets, { autoAlpha: 0, y: 26 });
  gsap.set(interfaceTargets, { autoAlpha: 0, y: -14 });

  const complete = () => {
    if (finished) return;
    finished = true;
    destroy();
    delete documentElement.dataset.intro;
    onComplete();
  };

  const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
  timeline
    .to(hud, { autoAlpha: 1, scale: 1, duration: .42 }, .08)
    .call(() => {
      if (status) status.textContent = 'DEPTH CALIBRATED';
      if (depth) depth.textContent = 'SPATIAL FIELD / LIVE';
    }, [], .48)
    .call(() => { if (status) status.textContent = 'SYSTEM READY'; }, [], .94)
    .addLabel('flyThrough', 1)
    .to(hud, { autoAlpha: 0, scale: 1.08, duration: .3, ease: 'power2.in' }, 1)
    .to(interfaceTargets, { autoAlpha: 1, y: 0, duration: .46, stagger: .035 }, 1.23)
    .to(heroTargets, { autoAlpha: 1, y: 0, duration: .52, stagger: .045 }, 1.25)
    .to(root, { clipPath: 'inset(0 0 100% 0)', duration: .5, ease: 'power3.inOut' }, 1.42)
    .call(complete);

  if (camera) {
    timeline
      .to(camera.position, { z: 7, duration: .72, ease: 'power1.inOut' }, .22)
      .to(camera.position, { z: compact ? -12 : -21, duration: .68, ease: 'power3.in' }, 1);
  }

  if (compact) timeline.timeScale(1.4);

  const accelerateToFlyThrough = (event) => {
    if (finished || timeline.time() >= timeline.labels.flyThrough) return;
    if ('deltaY' in event && event.deltaY <= 0) return;
    intentTween?.kill();
    intentTween = timeline.tweenTo('flyThrough', {
      duration: .28,
      ease: 'power2.in',
      onComplete: () => timeline.play(),
    });
  };

  const skipIntro = () => {
    if (finished) return;
    timeline.kill();
    intentTween?.kill();
    gsap.set([...heroTargets, ...interfaceTargets], { autoAlpha: 1, x: 0, y: 0 });
    skipTween = gsap.to(root, { autoAlpha: 0, duration: .14, ease: 'power1.out', onComplete: complete });
  };
  const handleKeydown = (event) => { if (event.key === 'Escape') skipIntro(); };

  skip?.addEventListener('click', skipIntro);
  globalThis.window.addEventListener('keydown', handleKeydown);
  globalThis.window.addEventListener('wheel', accelerateToFlyThrough, { passive: true });
  globalThis.window.addEventListener('touchmove', accelerateToFlyThrough, { passive: true });

  const cleanup = () => {
    timeline.kill();
    intentTween?.kill();
    skipTween?.kill();
    skip?.removeEventListener('click', skipIntro);
    globalThis.window.removeEventListener('keydown', handleKeydown);
    globalThis.window.removeEventListener('wheel', accelerateToFlyThrough);
    globalThis.window.removeEventListener('touchmove', accelerateToFlyThrough);
    destroy();
    delete documentElement.dataset.intro;
    gsap.set([...heroTargets, ...interfaceTargets], { clearProps: 'opacity,visibility,transform' });
    instances.delete(root);
  };

  instances.set(root, cleanup);
  return cleanup;
}
