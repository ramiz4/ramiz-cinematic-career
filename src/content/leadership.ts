export type LeadershipChapter = {
  period: string;
  role: string;
  company: string;
  mandate: string;
  signals: string[];
};

export const leadershipJourney: LeadershipChapter[] = [
  {
    period: '10/2025 — Present',
    role: 'Lead Software Engineer (Full Stack)',
    company: 'Martha Software GmbH',
    mandate: 'Connecting architecture, product delivery and engineering standards across a complex business platform.',
    signals: ['Technical direction', 'Architecture', 'Product engineering'],
  },
  {
    period: '03/2024 — 09/2025',
    role: 'Full Stack Software Engineer',
    company: 'FINNOFLEET Schweiz',
    mandate: 'Translating digital lending workflows into maintainable services, contracts and user experiences.',
    signals: ['Java', 'Spring Boot', 'Angular', 'OpenAPI'],
  },
  {
    period: '08/2022 — 02/2024',
    role: 'Full Stack Software Engineer',
    company: 'Base-Net Informatik AG',
    mandate: 'Working across frontend, APIs and domain logic to make enterprise change safer and more coherent.',
    signals: ['Angular', '.NET Core', 'REST APIs', 'Architecture'],
  },
  {
    period: '01/2014 — 07/2022',
    role: 'Senior Full-Stack Software Engineer',
    company: 'Schüco Digital GmbH',
    mandate: 'Evolving from feature delivery toward reusable product foundations and dependable delivery systems.',
    signals: ['Product systems', 'CI/CD', 'Reusable UI', 'Delivery'],
  },
  {
    period: '12/2007 — 12/2013',
    role: 'Founder / Full-Stack Software Engineer',
    company: 'LoHox IT Service',
    mandate: 'Owning the full path from client problem and product decision to implementation and operation.',
    signals: ['Ownership', 'Consulting', 'Web engineering'],
  },
];

export const operatingLoop = [
  {
    index: '01',
    title: 'Strategy',
    text: 'Translate business direction into explicit technical priorities and constraints.',
  },
  {
    index: '02',
    title: 'Boundaries',
    text: 'Shape systems and ownership so the next correct decision becomes easier.',
  },
  {
    index: '03',
    title: 'Delivery',
    text: 'Create fast feedback, reliable automation and a clear path to production.',
  },
  {
    index: '04',
    title: 'Learning',
    text: 'Use operational evidence to improve the product, platform and engineering system.',
  },
] as const;
