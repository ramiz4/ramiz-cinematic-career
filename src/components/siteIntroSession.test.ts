import { SITE_INTRO_SESSION_KEY, shouldPlaySiteIntro } from './siteIntroSession';

describe('site intro session', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState({}, '', '/ramiz-cinematic-career/');
  });

  it('plays once per session and supports an explicit replay', () => {
    expect(shouldPlaySiteIntro()).toBe(true);

    window.sessionStorage.setItem(SITE_INTRO_SESSION_KEY, 'seen');
    expect(shouldPlaySiteIntro()).toBe(false);

    window.history.replaceState({}, '', '/ramiz-cinematic-career/?intro=1');
    expect(shouldPlaySiteIntro()).toBe(true);
  });
});
