export const SITE_INTRO_SESSION_KEY = 'ramiz:matrix-intro:v2';

export function shouldPlaySiteIntro() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;

  const forceReplay = new URLSearchParams(window.location.search).get('intro') === '1';
  if (forceReplay) return true;

  try {
    return window.sessionStorage.getItem(SITE_INTRO_SESSION_KEY) !== 'seen';
  } catch {
    return true;
  }
}
