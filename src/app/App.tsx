import { useCallback, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { StoryProgress } from '../components/StoryProgress';
import { InstallPrompt } from '../components/InstallPrompt';
import { SiteIntro } from '../components/SiteIntro';
import { shouldPlaySiteIntro } from '../components/siteIntroSession';
import { ExperienceLayer } from '../experience/ExperienceLayer';
import { Hero } from '../chapters/Hero';
import { SystemTransformation } from '../chapters/SystemTransformation';
import { LeadershipJourney } from '../chapters/LeadershipJourney';
import { Impact } from '../chapters/Impact';
import { OperatingModel } from '../chapters/OperatingModel';
import { Contact } from '../chapters/Contact';

export function App() {
  const [introActive, setIntroActive] = useState(shouldPlaySiteIntro);
  const completeIntro = useCallback(() => {
    setIntroActive(false);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
    });
  }, []);

  return <>
    {introActive && <SiteIntro onComplete={completeIntro} />}
    <div
      data-site-shell
      inert={introActive ? true : undefined}
      aria-hidden={introActive ? true : undefined}
    >
      <a className="skip" href="#main" data-navigation-background>Skip to content</a>
      <Navigation />
      <div data-navigation-background>
        <StoryProgress />
        <InstallPrompt />
        {!introActive && <ExperienceLayer />}
        <main id="main" tabIndex={-1}>
          <Hero />
          <SystemTransformation />
          <LeadershipJourney />
          <Impact />
          <OperatingModel />
          <Contact />
        </main>
        <footer>© {new Date().getFullYear()} Ramiz Loki · Engineered with intent.</footer>
      </div>
    </div>
  </>;
}
