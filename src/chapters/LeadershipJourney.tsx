import { useLayoutEffect, useRef } from 'react';
import { Chapter } from '../components/Chapter';
import { leadershipJourney } from '../content/leadership';

export function LeadershipJourney() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void import('../js/journey-scrollytelling.js').then(({ initJourneyScrollytelling }) => {
      if (!disposed) cleanup = initJourneyScrollytelling(root);
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <Chapter id="journey" index="02" eyebrow="The scope keeps expanding" title="From shipping features to shaping the system.">
      <p className="chapter__story">
        The titles changed gradually. The real progression was in the radius of responsibility — from implementation to product systems, architecture and technical direction.
      </p>
      <div ref={rootRef} className="journey-system" data-journey-story>
        <aside className="journey-radar" data-journey-visual aria-hidden="true">
          <header><span>mandate.radius</span><strong>EXPANDING</strong></header>
          <div className="journey-radar__dial">
            <svg viewBox="0 0 320 320" role="presentation">
              <path className="journey-radar__axis" d="M160 12 V308 M12 160 H308 M55 55 L265 265 M265 55 L55 265" />
              {[38, 65, 92, 119, 146].map((radius) => <circle key={radius} data-journey-ring cx="160" cy="160" r={radius} />)}
              <line data-journey-beam x1="160" y1="160" x2="160" y2="18" />
              <circle data-journey-core cx="160" cy="160" r="11" />
            </svg>
            <div className="journey-radar__readout">
              <span data-journey-index>Scope 01</span>
              <strong data-journey-label>{leadershipJourney[0].scope}</strong>
            </div>
          </div>
          <div className="journey-radar__footer"><span>Implementation</span><i><b data-journey-progress /></i><span>Direction</span></div>
        </aside>

        <ol className="leadership-timeline">
          {leadershipJourney.map((entry, index) => (
            <li
              key={`${entry.company}-${entry.period}`}
              data-story-beat={`journey-${index + 1}`}
              data-journey-step
              data-scope={entry.scope}
            >
              <span className="leadership-timeline__node" aria-hidden="true" />
              <div className="leadership-timeline__identity">
                <span className="leadership-timeline__index">0{index + 1}</span>
                <time>{entry.period}</time>
                <h3>{entry.role}</h3>
                <p>{entry.company}</p>
              </div>
              <div className="leadership-timeline__scope">
                <span>{entry.scope}</span>
                <p>{entry.mandate}</p>
                <ul>{entry.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}
