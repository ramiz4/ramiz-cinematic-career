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

type ConstraintSignalProps = {
  x: number;
  y: number;
  label: string;
  labelX: number;
  labelY: number;
  centered?: boolean;
  phase?: 1 | 2 | 3;
};

function ConstraintSignal({
  x,
  y,
  label,
  labelX,
  labelY,
  centered = false,
  phase = 1,
}: ConstraintSignalProps) {
  const className = [
    'system-visual__warning',
    centered ? 'system-visual__warning--centered' : '',
    `system-visual__warning--phase-${phase}`,
  ].filter(Boolean).join(' ');

  return (
    <g data-graph="warning" className={className}>
      <g className="system-visual__signal" transform={`translate(${x} ${y})`}>
        <circle className="system-visual__signal-halo" r="13" />
        <circle className="system-visual__signal-bubble system-visual__signal-bubble--a" cx="-6.5" cy="-4" r="3" />
        <circle className="system-visual__signal-bubble system-visual__signal-bubble--b" cx="6.5" cy="-5" r="2.25" />
        <circle className="system-visual__signal-bubble system-visual__signal-bubble--c" cx="4" cy="6.5" r="1.75" />
        <circle className="system-visual__signal-core" r="2.5" />
      </g>
      <text x={labelX} y={labelY}>{label}</text>
    </g>
  );
}

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
            <span className="system-visual__state"><i /><b data-system-step-index>01 / 05</b><em data-system-step-label>Constraint map</em></span>
            <strong>LIVE MODEL</strong>
          </div>
          <div className="system-visual__scan" data-graph="scan" />
          <svg viewBox="0 0 820 620" role="presentation">
            <defs>
              <pattern id="system-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity=".08" />
              </pattern>
            </defs>
            <rect width="820" height="620" fill="url(#system-grid)" />

            <g data-graph-camera>
              <g data-graph="ownership-zone" className="system-visual__ownership-zone">
                <rect x="222" y="88" width="222" height="304" rx="24" /><text x="242" y="112">TEAM / PRODUCT</text>
              </g>
              <g data-graph="ownership-zone" className="system-visual__ownership-zone">
                <rect x="466" y="88" width="232" height="304" rx="24" /><text x="486" y="112">TEAM / DOMAIN</text>
              </g>
              <g data-graph="ownership-zone" className="system-visual__ownership-zone">
                <rect x="274" y="404" width="246" height="132" rx="24" /><text x="294" y="428">TEAM / PLATFORM</text>
              </g>

              <g className="system-visual__connections">
                <path data-graph="flow" d="M166 294 C212 294 218 160 256 160" />
                <path data-graph="flow" d="M166 294 H316" />
                <path data-graph="flow" d="M392 160 H495" />
                <path data-graph="flow" d="M416 294 H536" />
                <path data-graph="flow" d="M586 208 V250" />
                <path data-graph="flow" d="M366 342 V434" />
                <path data-graph="flow" d="M594 342 C568 392 520 432 474 462" />
              </g>

              <g className="system-visual__packets">
                <circle data-graph="packet" r="5" />
                <circle data-graph="packet" r="5" />
                <circle data-graph="packet" r="5" />
                <circle data-graph="packet" r="5" />
              </g>

              <g data-graph="monolith" className="system-visual__monolith">
                <rect x="244" y="115" width="332" height="350" rx="24" />
                <path d="M244 174 H576" />
                <circle cx="278" cy="145" r="6" /><circle cx="300" cy="145" r="6" /><circle cx="322" cy="145" r="6" />
                <text className="system-visual__monolith-title" x="430" y="151">CORE APPLICATION</text>
                <rect x="280" y="208" width="260" height="52" rx="8" />
                <rect x="280" y="282" width="260" height="52" rx="8" />
                <rect x="280" y="356" width="260" height="72" rx="8" />
                <text x="410" y="241">UI + WORKFLOWS</text>
                <text x="410" y="315">DOMAIN LOGIC</text>
                <text x="410" y="399">DATA + OPERATIONS</text>
              </g>

              <ConstraintSignal x={226} y={250} label="COUPLED CHANGE" labelX={74} labelY={255} />
              <ConstraintSignal x={594} y={335} label="WIDE BLAST RADIUS" labelX={618} labelY={340} phase={2} />
              <ConstraintSignal x={410} y={483} label="SLOW FEEDBACK" labelX={410} labelY={520} centered phase={3} />

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

              <g data-graph="outcome" className="system-visual__outcome">
                <rect x="548" y="430" width="178" height="78" rx="14" />
                <text x="568" y="455">SYSTEM STATE</text>
                <text x="568" y="482">SAFE AUTONOMY</text>
              </g>
            </g>
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
