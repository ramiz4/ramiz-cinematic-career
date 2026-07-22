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
        <div className="journey-viewport" data-three-viewport-slot aria-hidden="true" />

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
