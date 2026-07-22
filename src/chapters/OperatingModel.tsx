import { useRef } from 'react';
import { Chapter } from '../components/Chapter';
import { EngineeringOperatingVisual } from '../components/EngineeringOperatingVisual';
import { operatingStages } from '../content/operatingModel';
import { useProgressiveEnhancement } from '../hooks/useProgressiveEnhancement';

const loadOperatingModelEnhancement = () => import('../js/operating-model-scrollytelling.js')
  .then(({ initOperatingModelScrollytelling }) => initOperatingModelScrollytelling);

export function OperatingModel() {
  const rootRef = useRef<HTMLDivElement>(null);
  useProgressiveEnhancement(rootRef, loadOperatingModelEnhancement);

  return (
    <Chapter id="leadership" index="04" eyebrow="Engineering is a delivery system" title="From verified intent to resilient production.">
      <p className="chapter__story">
        My preferred operating model combines deep analysis, AI-assisted specification, accountable human decisions and an automated path from isolated work to observable production.
      </p>
      <div ref={rootRef} className="operating-system" data-operating-story>
        <ol className="operating-system__steps">
          {operatingStages.map((stage) => (
            <li
              key={stage.id}
              data-operating-step={stage.id}
              data-operating-number={stage.index}
              data-operating-status={stage.status}
            >
              <div className="operating-step__meta"><span>{stage.index} / 05</span><i />{stage.eyebrow}</div>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
              <ul>{stage.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
            </li>
          ))}
        </ol>
        <EngineeringOperatingVisual />
      </div>
    </Chapter>
  );
}
