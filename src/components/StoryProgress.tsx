import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';

const stages = [
  ['hero', 'Origin'],
  ['universe', 'System'],
  ['career', 'Journey'],
  ['projects', 'Products'],
  ['architect', 'Clarity'],
  ['contact', 'Next'],
] as const;

export function StoryProgress() {
  const { scrollYProgress } = useScroll();
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', () => {
    const viewportCenter = window.scrollY + window.innerHeight * .5;
    let next = 0;
    stages.forEach(([id], index) => {
      const section = document.getElementById(id);
      if (section && section.offsetTop <= viewportCenter) next = index;
    });
    setActive((current) => current === next ? current : next);
    document.documentElement.dataset.storyPhase = stages[next][0];
  });

  return (
    <aside className="story-progress" aria-label="Story progress">
      <span className="story-progress__counter">0{active + 1}</span>
      <div className="story-progress__track" aria-hidden="true">
        <motion.span style={{ scaleX: scrollYProgress, scaleY: scrollYProgress }} />
      </div>
      <ol>
        {stages.map(([id, label], index) => (
          <li key={id} className={index === active ? 'is-active' : ''}>
            <a href={`#${id}`} aria-current={index === active ? 'step' : undefined}>
              <i aria-hidden="true" />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ol>
      <span className="story-progress__mobile-label">{stages[active][1]}</span>
    </aside>
  );
}
