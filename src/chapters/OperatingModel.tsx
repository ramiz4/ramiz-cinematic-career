import { motion } from 'framer-motion';
import { Chapter } from '../components/Chapter';
import { operatingLoop } from '../content/leadership';

export function OperatingModel() {
  return (
    <Chapter id="leadership" index="04" eyebrow="Architecture becomes an operating model" title="Leadership scales through clarity.">
      <p className="chapter__story">
        The architecture diagram is only one frame. Sustainable technical leadership connects business direction, system boundaries, delivery and operational learning.
      </p>
      <div className="operating-loop" aria-label="Technology leadership operating model">
        {operatingLoop.map((step, index) => (
          <motion.article
            key={step.title}
            initial={{ opacity: 0, scale: .94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ amount: .45 }}
            transition={{ duration: .55, delay: index * .07 }}
          >
            <span>{step.index}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </motion.article>
        ))}
        <div className="operating-loop__core" aria-hidden="true"><span>Business</span><strong>Leverage</strong></div>
      </div>
      <blockquote className="leadership-quote">
        <span>Architecture creates</span>
        <span><em>safe autonomy.</em></span>
      </blockquote>
      <div className="principles">
        <span><b>01</b>Evidence over assumptions</span>
        <span><b>02</b>Boundaries over coordination</span>
        <span><b>03</b>Enablement over gatekeeping</span>
        <span><b>04</b>Delivery over ceremony</span>
      </div>
    </Chapter>
  );
}
