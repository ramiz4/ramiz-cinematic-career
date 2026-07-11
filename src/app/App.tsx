import { Navigation } from '../components/Navigation';
import { StoryProgress } from '../components/StoryProgress';
import { ExperienceLayer } from '../experience/ExperienceLayer';
import { Hero } from '../chapters/Hero';
import { Universe } from '../chapters/Universe';
import { Career } from '../chapters/Career';
import { Projects } from '../chapters/Projects';
import { Architect } from '../chapters/Architect';
import { Contact } from '../chapters/Contact';

export function App() {
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <Navigation />
    <StoryProgress />
    <ExperienceLayer />
    <main id="main" tabIndex={-1}>
      <Hero />
      <Universe />
      <Career />
      <Projects />
      <Architect />
      <Contact />
    </main>
    <footer>© {new Date().getFullYear()} Ramiz Loki · Engineered with intent.</footer>
  </>;
}
