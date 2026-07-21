import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { Chapter } from '../components/Chapter';
import { impactCases } from '../content/impact';

export function Impact() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void import('../js/impact-scrollytelling.js').then(({ initImpactScrollytelling }) => {
      if (!disposed) cleanup = initImpactScrollytelling(root);
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <Chapter id="impact" index="03" eyebrow="The work is the evidence" title="Decisions become product outcomes.">
      <p className="chapter__story">
        Technology is not the result. These selected systems show how technical decisions translate complexity into products people can operate, extend and trust.
      </p>
      <div ref={rootRef} className="impact-cases" data-impact-story>
        {impactCases.map((impact, index) => (
          <article
            key={impact.title}
            data-story-beat={`impact-${index + 1}`}
            data-impact-case
            style={{ '--impact-index': index } as CSSProperties}
          >
            <div className="impact-case__card" data-impact-card>
              <header>
                <span>{impact.index}</span>
                <div className="impact-case__state"><i /><span>Now reading</span><strong data-impact-status>Challenge</strong></div>
                <p>{impact.context}</p>
                <h3>{impact.title}</h3>
              </header>
              <dl className="impact-case__sequence">
                <div data-impact-stage="challenge"><span className="impact-case__ghost" aria-hidden="true">Challenge</span><dt>01 / Challenge</dt><dd>{impact.challenge}</dd></div>
                <div data-impact-stage="decision"><span className="impact-case__ghost" aria-hidden="true">Decision</span><dt>02 / Decision</dt><dd>{impact.decision}</dd></div>
                <div data-impact-stage="outcome"><span className="impact-case__ghost" aria-hidden="true">Outcome</span><dt>03 / Outcome</dt><dd>{impact.outcome}</dd></div>
              </dl>
              <div className="impact-case__footer">
                <ul>{impact.stack.map((item) => <li key={item}>{item}</li>)}</ul>
                {impact.href && <a href={impact.href} target="_blank" rel="noreferrer">View engineering work ↗</a>}
              </div>
              <div className="impact-case__rail" aria-hidden="true">
                <span>Challenge</span><span>Decision</span><span>Outcome</span>
                <i><b data-impact-progress /></i>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Chapter>
  );
}
