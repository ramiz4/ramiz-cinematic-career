import { motion } from 'framer-motion';
import { Chapter } from '../components/Chapter';
import { leadershipJourney } from '../content/leadership';

export function LeadershipJourney() {
  return (
    <Chapter id="journey" index="02" eyebrow="The scope keeps expanding" title="From shipping features to shaping the system.">
      <p className="chapter__story">
        The titles changed gradually. The real progression was in the radius of responsibility — from implementation to product systems, architecture and technical direction.
      </p>
      <ol className="leadership-timeline">
        {leadershipJourney.map((entry, index) => (
          <motion.li
            key={`${entry.company}-${entry.period}`}
            data-story-beat={`journey-${index + 1}`}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: .28 }}
            transition={{ duration: .65, ease: [.16, 1, .3, 1] }}
          >
            <span className="leadership-timeline__node" aria-hidden="true" />
            <div className="leadership-timeline__identity">
              <span className="leadership-timeline__index">0{leadershipJourney.length - index}</span>
              <time>{entry.period}</time>
              <h3>{entry.role}</h3>
              <p>{entry.company}</p>
            </div>
            <div className="leadership-timeline__scope">
              <span>Expanding mandate</span>
              <p>{entry.mandate}</p>
              <ul>{entry.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
            </div>
          </motion.li>
        ))}
      </ol>
    </Chapter>
  );
}
