export type OperatingStageId = 'analyze' | 'verify' | 'structure' | 'parallelize' | 'deliver';

export type OperatingStage = {
  id: OperatingStageId;
  index: string;
  eyebrow: string;
  title: string;
  text: string;
  status: string;
  signals: string[];
};

export const operatingStages: OperatingStage[] = [
  {
    id: 'analyze',
    index: '01',
    eyebrow: 'Understand before prescribing',
    title: 'Analyze the whole problem.',
    text: 'Business intent, domain reality, system evidence and operational constraints form one shared model before an architecture is proposed.',
    status: 'Evidence model',
    signals: ['Business intent', 'System evidence', 'Constraints'],
  },
  {
    id: 'verify',
    index: '02',
    eyebrow: 'AI drafts · humans decide',
    title: 'Turn ambiguity into verified intent.',
    text: 'AI accelerates requirement discovery and specification. A human gate confirms scope, risk, success criteria and the decisions that must remain accountable.',
    status: 'Human verified',
    signals: ['AI-assisted specification', 'Human-in-the-loop', 'Verified scope'],
  },
  {
    id: 'structure',
    index: '03',
    eyebrow: 'Make the work executable',
    title: 'Shape a dependency-aware work graph.',
    text: 'Verified requirements become epics and bounded tickets with explicit contracts, dependencies and acceptance criteria — ready to execute without rediscovery.',
    status: 'Executable backlog',
    signals: ['Epics', 'Executable tickets', 'Acceptance criteria'],
  },
  {
    id: 'parallelize',
    index: '04',
    eyebrow: 'Bounded context for every agent',
    title: 'Parallelize only what is independent.',
    text: 'Current AI agents implement bounded tickets in isolated Git worktrees. Dependency gates, automated checks and human review bring the lanes back together safely.',
    status: 'Worktrees active',
    signals: ['AI agents', 'Git worktrees', 'Pull requests'],
  },
  {
    id: 'deliver',
    index: '05',
    eyebrow: 'One artifact · controlled promotion',
    title: 'Build a safe path to resilient production.',
    text: 'GitHub Actions builds an immutable Docker artifact, PR Preview validates the change, and Flux promotes it through staging into a highly available Kubernetes runtime.',
    status: 'Production healthy',
    signals: ['GitHub Actions', 'Docker', 'Flux', 'Kubernetes'],
  },
];

export const decisionFilters = [
  { principle: 'Clean Architecture', effect: 'Dependencies point inward' },
  { principle: 'SOLID', effect: 'Change stays local' },
  { principle: 'DRY', effect: 'One source of truth' },
  { principle: 'YAGNI', effect: 'Only proven complexity' },
] as const;
