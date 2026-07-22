import { motion, useScroll } from 'framer-motion';
import { STORY_PHASES } from '../experience/storyPhases';
import { useActiveStoryPhase } from '../experience/useActiveStoryPhase';

export function StoryProgress() {
  const { scrollYProgress } = useScroll();
  const active = useActiveStoryPhase();

  return (
    <aside className="story-progress" aria-label="Story progress">
      <span className="story-progress__counter">0{active + 1}</span>
      <div className="story-progress__track" aria-hidden="true">
        <motion.span style={{ scaleX: scrollYProgress, scaleY: scrollYProgress }} />
      </div>
      <ol>
        {STORY_PHASES.map((phase, index) => (
          <li key={phase.id} className={index === active ? 'is-active' : ''}>
            <a
              href={`#${phase.id}`}
              aria-label={phase.progressLabel}
              aria-current={index === active ? 'step' : undefined}
            >
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
