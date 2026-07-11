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
            Lead Software Engineer · Software Architect
          </motion.div>
          <h1 aria-label="I engineer systems that move businesses.">
            <motion.span className="hero__line" variants={item}>I engineer</motion.span>
            <motion.span className="hero__line hero__line--outline" variants={item}>systems that</motion.span>
            <motion.span className="hero__line" variants={item}><em>move</em> businesses.</motion.span>
          </h1>
          <motion.p variants={item}>
            From the first line of code to systems that carry entire businesses — this is the story of how every layer became one architecture.
          </motion.p>
          <motion.div className="hero__actions" variants={item}>
            <a href="#universe"><span>Enter the system</span><i aria-hidden="true">↘</i></a>
            <a href="https://github.com/ramiz4" target="_blank" rel="noreferrer">GitHub ↗</a>
          </motion.div>
          <motion.dl className="hero__proof" variants={item}>
            <div><dt>18+</dt><dd>Years building</dd></div>
            <div><dt>06</dt><dd>Selected products</dd></div>
            <div><dt>01</dt><dd>Connected story</dd></div>
          </motion.dl>
        </motion.div>
        <motion.div className="hero__signal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} aria-hidden="true">
          <span>System core</span><strong>ONLINE</strong>
        </motion.div>
        <div className="scroll-cue" aria-hidden="true">
          <span>Scroll to disassemble</span><i /><b>01</b>
        </div>
      </div>
    </header>
  );
}
