export type StoryStepChangeHandler = (index: number, stepId: string) => void;

export function initSystemGraphScrollytelling(
  root?: ParentNode,
  options?: { onStepChange?: StoryStepChangeHandler },
): () => void;
