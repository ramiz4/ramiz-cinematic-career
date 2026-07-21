import { gsap } from 'gsap';

const instances = new WeakMap();
const noop = () => {};

function prepareDraw(element) {
  if (typeof element.getTotalLength !== 'function') return;
  const length = Math.max(element.getTotalLength(), 1);
  gsap.set(element, { strokeDasharray: length, strokeDashoffset: length });
}

export function initSiteIntro(root, { onComplete = noop } = {}) {
  if (!root || typeof globalThis.window === 'undefined') return noop;

  const existingCleanup = instances.get(root);
  if (existingCleanup) return existingCleanup;

  const documentElement = root.ownerDocument.documentElement;
  const status = root.querySelector('[data-intro-status]');
  const skip = root.querySelector('[data-intro-skip]');
  const grid = Array.from(root.querySelectorAll('[data-intro-grid] [data-intro-draw]'));
  const shell = Array.from(root.querySelectorAll('[data-intro-shell] [data-intro-draw]'));
  const links = Array.from(root.querySelectorAll('[data-intro-links] [data-intro-draw]'));
  const nodes = Array.from(root.querySelectorAll('[data-intro-node]'));
  const core = root.querySelector('[data-intro-core]');
  const heroTargets = Array.from(root.ownerDocument.querySelectorAll('[data-intro-target]'));
  const interfaceTargets = Array.from(root.ownerDocument.querySelectorAll('.nav, .story-progress'));
  const drawables = [...grid, ...shell, ...links];

  let finished = false;
  let skipTween;

  documentElement.dataset.intro = 'running';
  drawables.forEach(prepareDraw);
  gsap.set(grid, { autoAlpha: .34 });
  gsap.set([...shell, ...links], { autoAlpha: 0 });
  gsap.set(nodes, { autoAlpha: 0, scale: .72, transformOrigin: 'center center', transformBox: 'fill-box' });
  if (core) gsap.set(core, { autoAlpha: 0, scale: .35, transformOrigin: 'center center', transformBox: 'fill-box' });
  gsap.set(heroTargets, { autoAlpha: 0, y: 26 });
  gsap.set(interfaceTargets, { autoAlpha: 0, y: -14 });

  const complete = () => {
    if (finished) return;
    finished = true;
    delete documentElement.dataset.intro;
    onComplete();
  };

  const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
  timeline
    .to(grid, { strokeDashoffset: 0, duration: .42, stagger: { each: .012, from: 'center' }, ease: 'none' }, 0)
    .to(nodes, { autoAlpha: 1, scale: 1, duration: .38, stagger: .07, ease: 'back.out(1.5)' }, .26)
    .set(links, { autoAlpha: 1 }, .5)
    .to(links, { strokeDashoffset: 0, duration: .42, stagger: .035, ease: 'none' }, .5)
    .to(core, { autoAlpha: 1, scale: 1, duration: .46, ease: 'back.out(1.7)' }, .66)
    .call(() => { if (status) status.textContent = 'BOUNDARIES RESOLVED'; }, [], .78)
    .set(shell, { autoAlpha: 1 }, .88)
    .to(shell, { strokeDashoffset: 0, duration: .44, stagger: .035, ease: 'none' }, .88)
    .to(nodes, { scale: .94, duration: .32, stagger: .025, yoyo: true, repeat: 1 }, 1.14)
    .call(() => { if (status) status.textContent = 'SYSTEM READY'; }, [], 1.31)
    .to(interfaceTargets, { autoAlpha: 1, y: 0, duration: .48, stagger: .035 }, 1.38)
    .to(heroTargets, { autoAlpha: 1, y: 0, duration: .56, stagger: .055 }, 1.4)
    .to(root, { clipPath: 'inset(0 0 100% 0)', duration: .46, ease: 'power3.inOut' }, 1.62)
    .call(complete);

  if (globalThis.window.matchMedia('(max-width: 800px)').matches) timeline.timeScale(1.45);

  const skipIntro = () => {
    if (finished) return;
    timeline.kill();
    gsap.set([...heroTargets, ...interfaceTargets], { autoAlpha: 1, x: 0, y: 0 });
    skipTween = gsap.to(root, { autoAlpha: 0, duration: .14, ease: 'power1.out', onComplete: complete });
  };
  const handleKeydown = (event) => { if (event.key === 'Escape') skipIntro(); };

  skip?.addEventListener('click', skipIntro);
  globalThis.window.addEventListener('keydown', handleKeydown);

  const cleanup = () => {
    timeline.kill();
    skipTween?.kill();
    skip?.removeEventListener('click', skipIntro);
    globalThis.window.removeEventListener('keydown', handleKeydown);
    delete documentElement.dataset.intro;
    gsap.set([...heroTargets, ...interfaceTargets], { clearProps: 'opacity,visibility,transform' });
    instances.delete(root);
  };

  instances.set(root, cleanup);
  return cleanup;
}
