import { motion, useReducedMotion } from 'framer-motion';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: .11, delayChildren: .18 } },
};
const item = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0, transition: { duration: .85, ease: [.16, 1, .3, 1] as const } },
};

export function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <header className="hero" id="hero" data-story="hero">
      <div className="hero__sticky">
        <motion.div
          className="hero__content"
          variants={container}
          initial={reducedMotion ? false : 'hidden'}
          animate="visible"
        >
          <motion.div className="hero__kicker" variants={item}>
            <i aria-hidden="true" />
            Lead Software Engineer · Architecture · Technical Leadership
          </motion.div>
          <h1 aria-label="I turn technical complexity into business leverage.">
            <motion.span className="hero__line" variants={item}>I turn</motion.span>
            <motion.span className="hero__line hero__line--outline" variants={item}>technical complexity</motion.span>
            <motion.span className="hero__line" variants={item}>into <em>leverage.</em></motion.span>
          </h1>
          <motion.p variants={item}>
            I connect architecture, product delivery and technical leadership so systems can scale — and teams can move with confidence.
          </motion.p>
          <motion.div className="hero__actions" variants={item}>
            <a href="#system"><span>See how I scale</span><i aria-hidden="true">↘</i></a>
            <a href="mailto:me@ramizloki.com?subject=Technology%20leadership%20conversation">Discuss a mandate ↗</a>
          </motion.div>
          <motion.dl className="hero__proof" variants={item}>
            <div><dt>18+</dt><dd>Years engineering</dd></div>
            <div><dt>05</dt><dd>Leadership chapters</dd></div>
            <div><dt>E2E</dt><dd>Architecture to delivery</dd></div>
          </motion.dl>
        </motion.div>
        <motion.div className="hero__signal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} aria-hidden="true">
          <span>Leadership system</span><strong>ONLINE</strong>
        </motion.div>
        <div className="scroll-cue" aria-hidden="true">
          <span>Scroll to diagnose</span><i /><b>01</b>
        </div>
      </div>
    </header>
  );
}
