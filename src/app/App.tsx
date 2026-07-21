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
  const completeIntro = useCallback(() => setIntroActive(false), []);

  return <>
    {introActive && <SiteIntro onComplete={completeIntro} />}
    <a className="skip" href="#main">Skip to content</a>
    <Navigation />
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
  </>;
}
