import { motion, useReducedMotion } from 'framer-motion';
import { decisionFilters } from '../content/operatingModel';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: .1, delayChildren: .1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: .75, ease: [.16, 1, .3, 1] as const } },
};

export function DecisionFilters() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="decision-filters" aria-labelledby="decision-filters-title">
      <div className="decision-filters__meta">
        <span>decision.filters</span>
        <i aria-hidden="true" />
        <span>04 guardrails active</span>
      </div>
      <h2 id="decision-filters-title" className="decision-filters__heading">
        Every decision passes<br /><em>four filters.</em>
      </h2>
      <motion.dl
        className="decision-filters__grid"
        variants={containerVariants}
        initial={reducedMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: .15 }}
      >
        {decisionFilters.map((filter, index) => (
          <motion.div key={filter.principle} variants={cardVariants} className="decision-filter">
            <span className="decision-filter__index">0{index + 1}</span>
            <dt className="decision-filter__name">{filter.principle}</dt>
            <dd className="decision-filter__meaning">{filter.meaning}</dd>
            <dd className="decision-filter__effect">{filter.effect}</dd>
          </motion.div>
        ))}
      </motion.dl>
    </section>
  );
}
