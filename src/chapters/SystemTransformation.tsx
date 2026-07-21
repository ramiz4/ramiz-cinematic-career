import { useLayoutEffect, useRef } from 'react';

const storyBeats = [
  {
    id: 'pressure',
    index: '01',
    eyebrow: 'Pressure reveals the system',
    title: 'Growth exposes coupling.',
    text: 'More customers, workflows and contributors turn hidden dependencies into release risk, coordination cost and slow feedback.',
    signal: 'Diagnose the constraint before choosing the architecture.',
  },
  {
    id: 'boundaries',
    index: '02',
    eyebrow: 'Decisions before diagrams',
    title: 'Boundaries create options.',
    text: 'Domain ownership and explicit contracts separate what must change together from what should evolve independently.',
    signal: 'Modular first. Extract services when the operational trade-off is justified.',
  },
  {
    id: 'flow',
    index: '03',
    eyebrow: 'Architecture becomes flow',
    title: 'Connections become intentional.',
    text: 'APIs, events and observability make dependencies visible instead of hiding them inside implementation detail.',
    signal: 'Every boundary needs a contract and a feedback signal.',
  },
  {
    id: 'delivery',
    index: '04',
    eyebrow: 'Delivery is part of the design',
    title: 'Change gets a safe path.',
    text: 'Automated quality gates, independent deployment paths and operational evidence reduce the blast radius of every decision.',
    signal: 'A system is only scalable when change is repeatable.',
  },
  {
    id: 'ownership',
    index: '05',
    eyebrow: 'The organization completes the architecture',
    title: 'Teams gain safe autonomy.',
    text: 'Clear ownership lets product and platform teams move quickly without turning architecture into centralized gatekeeping.',
    signal: 'The outcome is leverage: aligned teams, observable systems and faster learning.',
  },
] as const;

export function SystemTransformation() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void import('../js/scrollytelling.js').then(({ initSystemGraphScrollytelling }) => {
      if (!disposed) cleanup = initSystemGraphScrollytelling(root);
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <section ref={rootRef} id="system" data-story="system" data-system-story className="system-story" aria-labelledby="system-title">
      <header className="system-story__header">
        <div className="system-story__meta"><span>01</span><span>Complexity becomes leverage</span></div>
        <div>
          <p className="system-story__kicker">A technical leadership case in five decisions</p>
          <h2 id="system-title" aria-label="Scale the system. Then scale change.">Scale the system.<br />Then scale change.</h2>
          <p>Architecture is not a destination or a diagram. It is the sequence of decisions that lets a business grow without multiplying friction.</p>
        </div>
      </header>

      <div className="system-story__stage" data-system-scroll>
        <ol className="system-story__beats">
          {storyBeats.map((beat) => (
            <li key={beat.id} data-story-step={beat.id}>
              <span>{beat.index} · {beat.eyebrow}</span>
              <h3>{beat.title}</h3>
              <p>{beat.text}</p>
              <blockquote>{beat.signal}</blockquote>
            </li>
          ))}
        </ol>

        <div className="system-visual" data-system-visual aria-hidden="true">
          <div className="system-visual__bar">
            <span>architecture.system</span>
            <strong>LIVE MODEL</strong>
          </div>
          <svg viewBox="0 0 820 620" role="presentation">
            <defs>
              <pattern id="system-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity=".08" />
              </pattern>
            </defs>
            <rect width="820" height="620" fill="url(#system-grid)" />

            <g className="system-visual__connections">
              <path data-graph="flow" d="M145 294 C195 294 205 160 276 160" />
              <path data-graph="flow" d="M145 294 C220 294 238 294 316 294" />
              <path data-graph="flow" d="M392 160 C438 160 454 160 495 160" />
              <path data-graph="flow" d="M416 294 C468 294 472 294 536 294" />
              <path data-graph="flow" d="M366 342 C366 384 366 402 366 434" />
              <path data-graph="flow" d="M586 208 C586 338 554 402 474 458" />
              <path data-graph="flow" d="M416 474 C486 474 534 392 576 342" />
            </g>

            <g data-graph="monolith" className="system-visual__monolith">
              <rect x="244" y="115" width="332" height="350" rx="24" />
              <path d="M244 174 H576" />
              <circle cx="278" cy="145" r="6" /><circle cx="300" cy="145" r="6" /><circle cx="322" cy="145" r="6" />
              <text x="360" y="151">CORE APPLICATION</text>
              <rect x="280" y="208" width="260" height="52" rx="8" />
              <rect x="280" y="282" width="260" height="52" rx="8" />
              <rect x="280" y="356" width="260" height="72" rx="8" />
              <text x="410" y="241">UI + WORKFLOWS</text>
              <text x="410" y="315">DOMAIN LOGIC</text>
              <text x="410" y="399">DATA + OPERATIONS</text>
            </g>

            <g data-graph="warning" className="system-visual__warning">
              <circle cx="226" cy="250" r="13" /><path d="M226 242 V251 M226 257 V259" />
              <text x="74" y="255">COUPLED CHANGE</text>
            </g>
            <g data-graph="warning" className="system-visual__warning">
              <circle cx="594" cy="335" r="13" /><path d="M594 327 V336 M594 342 V344" />
              <text x="618" y="340">WIDE BLAST RADIUS</text>
            </g>
            <g data-graph="warning" className="system-visual__warning">
              <circle cx="410" cy="487" r="13" /><path d="M410 479 V488 M410 494 V496" />
              <text x="350" y="528">SLOW FEEDBACK</text>
            </g>

            <g data-graph="service" className="system-visual__service">
              <rect x="44" y="250" width="122" height="88" rx="14" /><text x="105" y="288">EDGE</text><text x="105" y="309">API</text>
            </g>
            <g data-graph="service" className="system-visual__service">
              <rect x="256" y="116" width="136" height="88" rx="14" /><text x="324" y="154">IDENTITY</text><text x="324" y="175">DOMAIN</text>
            </g>
            <g data-graph="service" className="system-visual__service system-visual__service--primary">
              <rect x="316" y="250" width="100" height="92" rx="14" /><text x="366" y="289">PRODUCT</text><text x="366" y="311">CORE</text>
            </g>
            <g data-graph="service" className="system-visual__service">
              <rect x="495" y="116" width="182" height="92" rx="14" /><text x="586" y="155">WORKFLOW</text><text x="586" y="177">DOMAIN</text>
            </g>
            <g data-graph="service" className="system-visual__service">
              <rect x="536" y="250" width="116" height="92" rx="14" /><text x="594" y="289">DATA</text><text x="594" y="311">PLANE</text>
            </g>
            <g data-graph="service" className="system-visual__service">
              <rect x="306" y="434" width="168" height="82" rx="14" /><text x="390" y="470">OBSERVABILITY</text><text x="390" y="491">PLATFORM</text>
            </g>

            <g className="system-visual__pipeline">
              <path data-graph="pipeline" d="M82 570 H738" />
              <g data-graph="metric"><circle cx="120" cy="570" r="7" /><text x="120" y="597">COMMIT</text></g>
              <g data-graph="metric"><circle cx="292" cy="570" r="7" /><text x="292" y="597">VERIFY</text></g>
              <g data-graph="metric"><circle cx="472" cy="570" r="7" /><text x="472" y="597">DEPLOY</text></g>
              <g data-graph="metric"><circle cx="662" cy="570" r="7" /><text x="662" y="597">LEARN</text></g>
            </g>

            <g data-graph="team" className="system-visual__team"><circle cx="724" cy="104" r="31" /><text x="724" y="109">PRODUCT</text></g>
            <g data-graph="team" className="system-visual__team"><circle cx="742" cy="404" r="31" /><text x="742" y="409">DOMAIN</text></g>
            <g data-graph="team" className="system-visual__team"><circle cx="112" cy="438" r="31" /><text x="112" y="443">PLATFORM</text></g>
          </svg>
          <div className="system-visual__footer">
            <span>PRESSURE</span><span>BOUNDARIES</span><span>FLOW</span><span>DELIVERY</span><span>OWNERSHIP</span>
            <i><b data-story-progress /></i>
          </div>
        </div>
      </div>
    </section>
  );
}
