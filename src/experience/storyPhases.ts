export const STORY_PHASES = [
  { id: 'hero', navigationLabel: 'Position', progressLabel: 'Position' },
  { id: 'system', navigationLabel: 'System', progressLabel: 'Decisions' },
  { id: 'journey', navigationLabel: 'Journey', progressLabel: 'Growth' },
  { id: 'impact', navigationLabel: 'Impact', progressLabel: 'Evidence' },
  { id: 'leadership', navigationLabel: 'Leadership', progressLabel: 'Operating model' },
  { id: 'contact', navigationLabel: 'Contact', progressLabel: 'Next' },
] as const;

export type StoryPhaseId = typeof STORY_PHASES[number]['id'];
