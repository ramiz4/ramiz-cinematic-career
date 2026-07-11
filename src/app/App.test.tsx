import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

vi.mock('../experience/ExperienceLayer', () => ({ ExperienceLayer: () => <div data-testid="scene" /> }));
vi.mock('../components/StoryProgress', () => ({ StoryProgress: () => <div data-testid="story-progress" /> }));

describe('App', () => {
  it('renders the complete story in an accessible document order', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /engineer systems that move businesses/i })).toBeInTheDocument();
    for (const heading of [
      'Architecture is a living network.',
      'From building websites to shaping product systems.',
      'Products, not portfolio tiles.',
      'Clarity is a feature.',
      'Let’s build the next system.',
    ]) expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(document.querySelectorAll('[data-story]')).toHaveLength(6);
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('opens the cinematic journey menu from the mobile command bar', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Open journey menu' }));
    expect(screen.getByRole('dialog', { name: 'Your journey' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1. Origin' })).toHaveAttribute('href', '#hero');
    expect(screen.getByRole('button', { name: 'Close journey menu' })).toHaveAttribute('aria-expanded', 'true');
  });
});
