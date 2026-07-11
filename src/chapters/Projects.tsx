import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { Chapter } from '../components/Chapter';
import { projects } from '../content/projects';

export function Projects() {
  return (
    <Chapter id="projects" index="03" eyebrow="Experience becomes product" title="Products, not portfolio tiles.">
      <p className="chapter__story">The fragments regroup into products: different domains, one consistent obsession with systems that work in the real world.</p>
      <div className="project-rail">
        {projects.map((project, index) => (
          <motion.article
            key={project.slug}
            data-story-beat={`project-${index + 1}`}
            style={{ '--card-index': index } as CSSProperties}
            initial={{ y: 56, rotateX: 8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            whileHover={{ y: -8, rotateX: -1, rotateY: index % 2 ? -1.5 : 1.5 }}
            viewport={{ amount: .18 }}
            transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
          >
            <div className="project-card__top"><span>0{index + 1}</span><i aria-hidden="true" /></div>
            <p>{project.eyebrow}</p>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
            <ul>{project.stack.map((stack) => <li key={stack}>{stack}</li>)}</ul>
            {project.href && <a href={project.href} target="_blank" rel="noreferrer">View repository ↗</a>}
          </motion.article>
        ))}
      </div>
    </Chapter>
  );
}
