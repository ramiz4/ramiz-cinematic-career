import { act, fireEvent, render, screen } from '@testing-library/react';
import { InstallPrompt } from './InstallPrompt';
import { canOfferIosInstall, IOS_INSTALL_DISMISS_KEY, IOS_INSTALL_PROMPT_DELAY } from '../pwa/install';

const iphoneSafari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';

const environment = {
  userAgent: iphoneSafari,
  platform: 'iPhone',
  maxTouchPoints: 5,
  standalone: false,
  displayModeStandalone: false,
  dismissed: false,
};

describe('iOS install prompt', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('offers installation in Safari on iPhone and modern iPadOS', () => {
    expect(canOfferIosInstall(environment)).toBe(true);
    expect(canOfferIosInstall({
      ...environment,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
      platform: 'MacIntel',
      maxTouchPoints: 5,
    })).toBe(true);
  });

  it('does not offer installation in other iOS browsers, standalone mode, or after dismissal', () => {
    expect(canOfferIosInstall({ ...environment, userAgent: iphoneSafari.replace('Version/18.5', 'CriOS/137.0.0.0') })).toBe(false);
    expect(canOfferIosInstall({ ...environment, standalone: true })).toBe(false);
    expect(canOfferIosInstall({ ...environment, displayModeStandalone: true })).toBe(false);
    expect(canOfferIosInstall({ ...environment, dismissed: true })).toBe(false);
  });

  it('shows once, explains the iPhone flow, and remembers dismissal', () => {
    vi.useFakeTimers();
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(iphoneSafari);
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('iPhone');
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('de-CH');

    render(<InstallPrompt />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(IOS_INSTALL_PROMPT_DELAY));
    expect(screen.getByRole('dialog', { name: 'Diese Story als App.' })).toBeInTheDocument();
    expect(screen.getByText('Zum Home-Bildschirm')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Verstanden' }));
    expect(window.localStorage.getItem(IOS_INSTALL_DISMISS_KEY)).toBe('dismissed');
  });
});
