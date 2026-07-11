import { motion, useReducedMotion } from 'framer-motion';
import type { PropsWithChildren } from 'react';
type Props = PropsWithChildren<{ id: string; index: string; eyebrow: string; title: string; className?: string }>;
export function Chapter({ id, index, eyebrow, title, className = '', children }: Props) {
  const reducedMotion = useReducedMotion();
  const reveal = reducedMotion ? false : { y: 48 };

  return (
    <section id={id} data-story={id} className={`chapter chapter--${id} ${className}`} aria-labelledby={`${id}-title`}>
      <span className="chapter__ghost" aria-hidden="true">{index}</span>
      <motion.div
        className="chapter__meta"
        initial={reveal}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: .2 }}
        transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
      >
        <span>{index}</span><span>{eyebrow}</span>
      </motion.div>
      <motion.div
        className="chapter__body"
        initial={reveal}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: .08 }}
        transition={{ duration: .9, delay: .08, ease: [.16, 1, .3, 1] }}
      >
        <h2 id={`${id}-title`}>{title}</h2>
        {children}
      </motion.div>
    </section>
  );
}
