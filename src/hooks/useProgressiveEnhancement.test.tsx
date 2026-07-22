import { render, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { useProgressiveEnhancement } from './useProgressiveEnhancement';

type Loader = () => Promise<(root: HTMLDivElement) => (() => void) | void>;

function Fixture({ loader }: { loader: Loader }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useProgressiveEnhancement(rootRef, loader);
  return <div ref={rootRef} data-testid="enhancement-root" />;
}

describe('useProgressiveEnhancement', () => {
  it('keeps a deterministic fallback when the optional chunk fails', async () => {
    const loader = vi.fn<Loader>().mockRejectedValue(new Error('chunk unavailable'));
    const { getByTestId } = render(<Fixture loader={loader} />);

    await waitFor(() => expect(getByTestId('enhancement-root')).toHaveAttribute('data-enhancement', 'fallback'));
  });

  it('cleans up a successfully loaded controller on unmount', async () => {
    const cleanup = vi.fn();
    const loader = vi.fn<Loader>().mockResolvedValue(() => cleanup);
    const { getByTestId, unmount } = render(<Fixture loader={loader} />);

    await waitFor(() => expect(getByTestId('enhancement-root')).toHaveAttribute('data-enhancement', 'ready'));
    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
  });
});
