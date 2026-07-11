import { motion } from 'framer-motion';
import { Chapter } from '../components/Chapter';
import { career } from '../content/career';

export function Career() {
  return (
    <Chapter id="career" index="02" eyebrow="The engine evolves" title="From building websites to shaping product systems.">
      <p className="chapter__story">Five chapters. Each one added a new layer — from hands-on creation to architecture and technical leadership.</p>
      <ol className="timeline">
        {career.map((entry, index) => (
          <motion.li
            key={entry.company}
            data-story-beat={`career-${index + 1}`}
            initial={{ opacity: 0, x: index % 2 ? 32 : -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ amount: .35 }}
            transition={{ duration: .65, ease: [.16, 1, .3, 1] }}
          >
            <i className="timeline__node" aria-hidden="true" />
            <div className="timeline__identity">
              <span className="timeline__index">0{career.length - index}</span>
              <time>{entry.period}</time>
              <h3>{entry.role}</h3>
              <p>{entry.company}</p>
            </div>
            <ul>{entry.focus.map((focus) => <li key={focus}>{focus}</li>)}</ul>
          </motion.li>
        ))}
      </ol>
    </Chapter>
  );
}
