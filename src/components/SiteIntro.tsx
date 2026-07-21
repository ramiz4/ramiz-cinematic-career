import { useEffect, useRef } from 'react';
import { SITE_INTRO_SESSION_KEY } from './siteIntroSession';

type SiteIntroProps = {
  onComplete: () => void;
};

const verticalGridLines = Array.from({ length: 13 }, (_, index) => 80 + index * 70);
const horizontalGridLines = Array.from({ length: 8 }, (_, index) => 70 + index * 70);

export function SiteIntro({ onComplete }: SiteIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

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

    const failSafe = window.setTimeout(complete, 3_200);

    void import('../js/intro-scrollytelling.js')
      .then(({ initSiteIntro }) => {
        if (disposed || completed || !rootRef.current) return;
        cleanup = initSiteIntro(rootRef.current, { onComplete: complete });
      })
      .catch(complete);

    return () => {
      disposed = true;
      window.clearTimeout(failSafe);
      cleanup();
    };
  }, [onComplete]);

  return (
    <div ref={rootRef} className="site-intro" data-site-intro role="status" aria-label="Preparing the engineering experience">
      <div className="site-intro__topline" aria-hidden="true">
        <span>RL / ENGINEERING SYSTEM</span>
        <strong data-intro-status>INITIALIZING</strong>
      </div>

      <div className="site-intro__matrix" aria-hidden="true">
        <svg viewBox="0 0 1000 620" role="presentation">
          <g className="site-intro__grid" data-intro-grid>
            {verticalGridLines.map((x) => <line key={`v-${x}`} data-intro-draw x1={x} y1="55" x2={x} y2="565" />)}
            {horizontalGridLines.map((y) => <line key={`h-${y}`} data-intro-draw x1="70" y1={y} x2="930" y2={y} />)}
          </g>

          <g className="site-intro__shell" data-intro-shell>
            <rect data-intro-draw x="70" y="45" width="860" height="54" rx="27" />
            <path data-intro-draw d="M116 515 V164 H884 V515" />
            <path data-intro-draw d="M116 264 H884" />
            <path data-intro-draw d="M116 515 H884" />
          </g>

          <g className="site-intro__links" data-intro-links>
            <path data-intro-draw d="M310 196 C394 196 404 286 470 306" />
            <path data-intro-draw d="M690 196 C606 196 596 286 530 306" />
            <path data-intro-draw d="M310 446 C394 446 404 346 470 326" />
            <path data-intro-draw d="M690 446 C606 446 596 346 530 326" />
          </g>

          <g className="site-intro__node" data-intro-node transform="translate(120 158)">
            <rect width="190" height="76" rx="12" /><circle cx="20" cy="20" r="4" />
            <text x="22" y="47">ARCHITECTURE</text>
          </g>
          <g className="site-intro__node" data-intro-node transform="translate(690 158)">
            <rect width="190" height="76" rx="12" /><circle cx="20" cy="20" r="4" />
            <text x="22" y="47">DELIVERY</text>
          </g>
          <g className="site-intro__node" data-intro-node transform="translate(120 408)">
            <rect width="190" height="76" rx="12" /><circle cx="20" cy="20" r="4" />
            <text x="22" y="47">LEADERSHIP</text>
          </g>
          <g className="site-intro__node" data-intro-node transform="translate(690 408)">
            <rect width="190" height="76" rx="12" /><circle cx="20" cy="20" r="4" />
            <text x="22" y="47">EVIDENCE</text>
          </g>

          <g className="site-intro__core" data-intro-core>
            <circle cx="500" cy="316" r="54" />
            <circle cx="500" cy="316" r="38" />
            <text x="500" y="312">ENGINEERING</text>
            <text x="500" y="328">SYSTEM</text>
          </g>
        </svg>
      </div>

      <div className="site-intro__footer" aria-hidden="true">
        <span>Architecture</span><i /><span>Delivery</span><i /><span>Leadership</span><i /><span>Evidence</span>
      </div>
      <button className="site-intro__skip" type="button" data-intro-skip>Skip intro</button>
    </div>
  );
}
