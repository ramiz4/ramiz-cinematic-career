import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { App } from './App';
import { SITE_INTRO_SESSION_KEY } from '../components/siteIntroSession';

vi.mock('../experience/ExperienceLayer', () => ({ ExperienceLayer: () => <div data-testid="scene" /> }));
vi.mock('../components/StoryProgress', () => ({ StoryProgress: () => <div data-testid="story-progress" /> }));
vi.mock('../js/scrollytelling.js', () => ({ initSystemGraphScrollytelling: () => () => undefined }));
vi.mock('../js/journey-scrollytelling.js', () => ({ initJourneyScrollytelling: () => () => undefined }));
vi.mock('../js/impact-scrollytelling.js', () => ({ initImpactScrollytelling: () => () => undefined }));
vi.mock('../js/operating-model-scrollytelling.js', () => ({ initOperatingModelScrollytelling: () => () => undefined }));
vi.mock('../js/intro-scrollytelling.js', () => ({
  initSiteIntro: (root: Element, { onComplete }: { onComplete: () => void }) => {
    const skip = root.querySelector('[data-intro-skip]');
    skip?.addEventListener('click', onComplete);
    root.setAttribute('data-controller-ready', 'true');
    return () => {
      skip?.removeEventListener('click', onComplete);
      root.removeAttribute('data-controller-ready');
    };
  },
}));

describe('App', () => {
  beforeEach(() => window.sessionStorage.setItem(SITE_INTRO_SESSION_KEY, 'seen'));

  it('renders the complete story in an accessible document order', () => {
    render(<App />);
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
    expect(screen.getByText(/Single Responsibility · Open\/Closed/)).toBeInTheDocument();
    expect(screen.getByText('Don’t Repeat Yourself')).toBeInTheDocument();
    expect(screen.getByText('You Aren’t Gonna Need It')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('isolates the page while the intro is active', async () => {
    window.sessionStorage.removeItem(SITE_INTRO_SESSION_KEY);
    render(<App />);

    const intro = screen.getByRole('dialog', { name: /initializing the three-dimensional engineering matrix/i });
    const shell = document.querySelector('[data-site-shell]');
    expect(intro).toBeInTheDocument();
    expect(shell).toHaveAttribute('inert');
    expect(shell).toHaveAttribute('aria-hidden', 'true');

    await waitFor(() => expect(intro).toHaveAttribute('data-controller-ready', 'true'));
    fireEvent.click(screen.getByRole('button', { name: 'Skip intro' }));
    await waitFor(() => expect(intro).not.toBeInTheDocument());
    expect(shell).not.toHaveAttribute('inert');
    expect(shell).not.toHaveAttribute('aria-hidden');
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus());
  });

  it('traps focus inside the cinematic journey menu and restores it on close', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Open journey menu' }));
    const dialog = screen.getByRole('dialog', { name: 'Your journey' });
    const closeButton = within(dialog).getByRole('button', { name: 'Close journey menu' });
    const contactLink = within(dialog).getByRole('link', { name: 'Discuss a leadership mandate' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1. Position' })).toHaveAttribute('href', '#hero');
    expect(document.querySelector('.nav')).toHaveAttribute('inert');
    expect(document.querySelector('[data-navigation-background]')).toHaveAttribute('inert');

    closeButton.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(contactLink).toHaveFocus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    fireEvent.click(closeButton);
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Your journey' })).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Open journey menu' })).toHaveFocus());
  });
});
