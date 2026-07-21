import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { SITE_INTRO_SESSION_KEY } from '../components/siteIntroSession';

vi.mock('../experience/ExperienceLayer', () => ({ ExperienceLayer: () => <div data-testid="scene" /> }));
vi.mock('../components/StoryProgress', () => ({ StoryProgress: () => <div data-testid="story-progress" /> }));
vi.mock('../js/scrollytelling.js', () => ({ initSystemGraphScrollytelling: () => () => undefined }));
vi.mock('../js/journey-scrollytelling.js', () => ({ initJourneyScrollytelling: () => () => undefined }));
vi.mock('../js/impact-scrollytelling.js', () => ({ initImpactScrollytelling: () => () => undefined }));
vi.mock('../js/operating-model-scrollytelling.js', () => ({ initOperatingModelScrollytelling: () => () => undefined }));

describe('App', () => {
  beforeEach(() => window.sessionStorage.setItem(SITE_INTRO_SESSION_KEY, 'seen'));

  it('renders the complete story in an accessible document order', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /turn technical complexity into business leverage/i })).toBeInTheDocument();
    for (const heading of [
      'Scale the system. Then scale change.',
      'From shipping features to shaping the system.',
      'Decisions become product outcomes.',
      'From verified intent to resilient production.',
      'Let’s turn complexity into leverage.',
    ]) expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(document.querySelectorAll('[data-story]')).toHaveLength(6);
    expect(document.querySelectorAll('[data-graph="ownership-zone"]')).toHaveLength(3);
    expect(document.querySelectorAll('[data-journey-step]')).toHaveLength(5);
    expect(document.querySelectorAll('[data-impact-stage]')).toHaveLength(12);
    expect(document.querySelectorAll('[data-operating-step]')).toHaveLength(5);
    expect(document.querySelectorAll('.operating-visual__principles > div')).toHaveLength(4);
    expect(screen.getByText('GitHub Actions')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('opens the cinematic journey menu from the mobile command bar', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Open journey menu' }));
    expect(screen.getByRole('dialog', { name: 'Your journey' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1. Position' })).toHaveAttribute('href', '#hero');
    expect(screen.getByRole('button', { name: 'Close journey menu' })).toHaveAttribute('aria-expanded', 'true');
  });
});
