import { useEffect, useRef } from 'react';
import { SITE_INTRO_SESSION_KEY } from './siteIntroSession';

type SiteIntroProps = {
  onComplete: () => void;
};

export function SiteIntro({ onComplete }: SiteIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let disposed = false;
    let completed = false;
    let cleanup: () => void = () => undefined;

    const complete = () => {
      if (disposed || completed) return;
      completed = true;
      try {
        window.sessionStorage.setItem(SITE_INTRO_SESSION_KEY, 'seen');
      } catch {
        // Storage can be unavailable in hardened browser contexts. The intro still completes.
      }
      onComplete();
    };

    const failSafe = window.setTimeout(complete, 7_000);
    const focusFrame = window.requestAnimationFrame(() => skipRef.current?.focus());

    void import('../js/intro-scrollytelling.js')
      .then(({ initSiteIntro }) => {
        if (disposed || completed || !rootRef.current) return;
        cleanup = initSiteIntro(rootRef.current, { onComplete: complete });
      })
      .catch(complete);

    return () => {
      disposed = true;
      window.clearTimeout(failSafe);
      window.cancelAnimationFrame(focusFrame);
      cleanup();
    };
  }, [onComplete]);

  useEffect(() => {
    const containFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      event.preventDefault();
      skipRef.current?.focus();
    };

    window.addEventListener('keydown', containFocus);
    return () => window.removeEventListener('keydown', containFocus);
  }, []);

  return (
    <div
      ref={rootRef}
      className="site-intro"
      data-site-intro
      role="dialog"
      aria-modal="true"
      aria-label="Initializing the three-dimensional engineering matrix"
    >
      <div className="site-intro__webgl" aria-hidden="true">
        <canvas data-intro-matrix />
      </div>

      <div className="site-intro__topline">
        <span aria-hidden="true">RL / SPATIAL ENGINEERING SYSTEM</span>
        <strong data-intro-status aria-live="polite">INITIALIZING</strong>
      </div>

      <div className="site-intro__matrix" aria-hidden="true">
        <div className="site-intro__hud" data-intro-hud>
          <span>ENGINEERING MATRIX</span>
          <i />
          <strong>ARCHITECTURE IN MOTION</strong>
          <small data-intro-depth>SPATIAL FIELD / 000</small>
        </div>
      </div>

      <div className="site-intro__footer" aria-hidden="true">
        <span>Architecture</span><i /><span>Delivery</span><i /><span>Leadership</span><i /><span>Evidence</span>
      </div>
      <button ref={skipRef} className="site-intro__skip" type="button" data-intro-skip>Skip intro</button>
    </div>
  );
}
