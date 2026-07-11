export type Project = { slug: string; title: string; eyebrow: string; summary: string; stack: string[]; href?: string };
export const projects: Project[] = [
  { slug: 'amacos', title: 'AMACOS', eyebrow: 'Enterprise product engineering', summary: 'A complex business platform shaped through pragmatic architecture, reusable UI systems and reliable delivery workflows.', stack: ['Angular', 'Java', 'REST', 'Kubernetes', 'PostgreSQL'] },
  { slug: 'cine-lens', title: 'CineLens', eyebrow: 'On-device visual intelligence', summary: 'A privacy-first concept for identifying films from short video sequences using locally controlled computer vision.', stack: ['Vision AI', 'Python', 'Video processing', 'On-device'] },
  { slug: 'ngx-multi-level-push-menu', title: 'Multi-level Push Menu', eyebrow: 'Open-source UI architecture', summary: 'A reusable Angular navigation system designed for deeply nested information structures.', stack: ['Angular', 'TypeScript', 'Open source'], href: 'https://github.com/ramiz4/ngx-multi-level-push-menu' }
];
