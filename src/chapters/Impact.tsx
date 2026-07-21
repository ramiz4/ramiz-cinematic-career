import { motion } from 'framer-motion';
import { Chapter } from '../components/Chapter';
import { impactCases } from '../content/impact';

export function Impact() {
  return (
    <Chapter id="impact" index="03" eyebrow="The work is the evidence" title="Decisions become product outcomes.">
      <p className="chapter__story">
        Technology is not the result. These selected systems show how technical decisions translate complexity into products people can operate, extend and trust.
      </p>
      <div className="impact-cases">
        {impactCases.map((impact, index) => (
          <motion.article
            key={impact.title}
            data-story-beat={`impact-${index + 1}`}
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: .2 }}
            transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
          >
            <header>
              <span>{impact.index}</span>
              <p>{impact.context}</p>
              <h3>{impact.title}</h3>
            </header>
            <dl>
              <div><dt>Challenge</dt><dd>{impact.challenge}</dd></div>
              <div><dt>Decision</dt><dd>{impact.decision}</dd></div>
              <div><dt>Outcome</dt><dd>{impact.outcome}</dd></div>
            </dl>
            <div className="impact-case__footer">
              <ul>{impact.stack.map((item) => <li key={item}>{item}</li>)}</ul>
              {impact.href && <a href={impact.href} target="_blank" rel="noreferrer">View engineering work ↗</a>}
            </div>
          </motion.article>
        ))}
      </div>
    </Chapter>
  );
}
