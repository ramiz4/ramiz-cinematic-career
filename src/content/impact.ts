export type ImpactCase = {
  index: string;
  title: string;
  context: string;
  challenge: string;
  decision: string;
  outcome: string;
  stack: string[];
  href?: string;
};

export const impactCases: ImpactCase[] = [
  {
    index: '01',
    title: 'AMACOS',
    context: 'Enterprise product engineering',
    challenge: 'A broad business platform where frontend, domain logic, data and delivery decisions continuously interact.',
    decision: 'Build reusable foundations, explicit service contracts and delivery workflows that reduce accidental complexity.',
    outcome: 'A more coherent platform direction with architecture connected to day-to-day product delivery.',
    stack: ['Angular', 'Java', 'Kubernetes', 'PostgreSQL'],
  },
  {
    index: '02',
    title: 'WinCredit',
    context: 'Digital lending workflows',
    challenge: 'Turn complex financial processes into an experience that remains understandable and maintainable.',
    decision: 'Align frontend journeys with contract-oriented services and clearly modelled workflow boundaries.',
    outcome: 'A product system designed for transparent, dependable credit operations.',
    stack: ['Java', 'Spring Boot', 'Angular', 'OpenAPI'],
  },
  {
    index: '03',
    title: 'Schüco Product Configurator',
    context: 'Digital product configuration',
    challenge: 'Make highly configurable product systems navigable without exposing their internal complexity to users.',
    decision: 'Translate product rules into reusable interaction patterns and a coherent digital configuration journey.',
    outcome: 'Complex product knowledge becomes a usable, scalable customer experience.',
    stack: ['Product systems', 'Enterprise UX', 'Reusable UI'],
  },
  {
    index: '04',
    title: 'Open engineering',
    context: 'Products, tools and experiments',
    challenge: 'Keep learning visible and turn recurring technical problems into reusable assets.',
    decision: 'Build in public across UI architecture, application engineering and privacy-first visual intelligence.',
    outcome: 'A body of work that demonstrates curiosity, product thinking and end-to-end ownership.',
    stack: ['Sigil', 'CineLens', 'Angular OSS'],
    href: 'https://github.com/ramiz4',
  },
];
