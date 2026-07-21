import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';
import { STORY_PHASES } from '../experience/storyPhases';

export function StoryProgress() {
  const { scrollYProgress } = useScroll();
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', () => {
    const viewportCenter = window.scrollY + window.innerHeight * .5;
    let next = 0;
    STORY_PHASES.forEach((phase, index) => {
      const section = document.getElementById(phase.id);
      if (section && section.offsetTop <= viewportCenter) next = index;
    });
    setActive((current) => current === next ? current : next);
    document.documentElement.dataset.storyPhase = STORY_PHASES[next].id;
  });

  return (
    <aside className="story-progress" aria-label="Story progress">
      <span className="story-progress__counter">0{active + 1}</span>
      <div className="story-progress__track" aria-hidden="true">
        <motion.span style={{ scaleX: scrollYProgress, scaleY: scrollYProgress }} />
      </div>
      <ol>
        {STORY_PHASES.map((phase, index) => (
          <li key={phase.id} className={index === active ? 'is-active' : ''}>
            <a href={`#${phase.id}`} aria-current={index === active ? 'step' : undefined}>
              <i aria-hidden="true" />
              <span>{phase.progressLabel}</span>
            </a>
          </li>
        ))}
      </ol>
      <span className="story-progress__mobile-label">{STORY_PHASES[active].progressLabel}</span>
    </aside>
  );
}
