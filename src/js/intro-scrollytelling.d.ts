export type SiteIntroOptions = {
  onComplete?: () => void;
};

export function initSiteIntro(root: Element, options?: SiteIntroOptions): () => void;
