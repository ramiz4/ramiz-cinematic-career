export type LeadershipChapter = {
  period: string;
  role: string;
  company: string;
  mandate: string;
  scope: string;
  signals: string[];
};

export const leadershipJourney: LeadershipChapter[] = [
  {
    period: '10/2025 — Present',
    role: 'Lead Full-Stack Software Engineer',
    company: 'Martha Software GmbH',
    mandate: 'Connecting architecture, product delivery and engineering standards across a complex business platform.',
    scope: 'Technical direction',
    signals: ['Technical direction', 'Architecture', 'Product engineering'],
  },
  {
    period: '03/2024 — 09/2025',
    role: 'Senior Full-Stack Software Engineer',
    company: 'FINNOFLEET Schweiz',
    mandate: 'Translating digital lending workflows into maintainable services, contracts and user experiences.',
    scope: 'Contract-led architecture',
    signals: ['Java', 'Spring Boot', 'Angular', 'OpenAPI'],
  },
  {
    period: '08/2022 — 02/2024',
    role: 'Senior Full-Stack Software Engineer',
    company: 'Base-Net Informatik AG',
    mandate: 'Working across frontend, APIs and domain logic to make enterprise change safer and more coherent.',
    scope: 'System coherence',
    signals: ['Angular', '.NET Core', 'REST APIs', 'Architecture'],
  },
  {
    period: '01/2014 — 07/2022',
    role: 'Full-Stack Software Engineer',
    company: 'Schüco Digital GmbH',
    mandate: 'Evolving from feature delivery toward reusable product foundations and dependable delivery systems.',
    scope: 'Product foundations',
    signals: ['Product systems', 'CI/CD', 'Reusable UI', 'Delivery'],
  },
  {
    period: '12/2007 — 12/2013',
    role: 'Founder / Full-Stack Software Engineer',
    company: 'LoHox IT Service',
    mandate: 'Owning the full path from client problem and product decision to implementation and operation.',
    scope: 'End-to-end ownership',
    signals: ['Ownership', 'Consulting', 'Web engineering'],
  },
];
