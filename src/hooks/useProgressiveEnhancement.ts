import { useLayoutEffect, type RefObject } from 'react';

type Cleanup = () => void;
type Enhancer<ElementType extends HTMLElement> = (root: ElementType) => Cleanup | void;
type EnhancementLoader<ElementType extends HTMLElement> = () => Promise<Enhancer<ElementType>>;

const noop = () => undefined;

/**
 * Loads an optional animation controller without making semantic content depend
 * on the network chunk. Failed enhancements stay in a deterministic static
 * state and never surface as unhandled promise rejections.
 */
export function useProgressiveEnhancement<ElementType extends HTMLElement>(
  rootRef: RefObject<ElementType | null>,
  loadEnhancer: EnhancementLoader<ElementType>,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let disposed = false;
    let cleanup: Cleanup = noop;
    root.dataset.enhancement = 'loading';

    void loadEnhancer()
      .then((enhance) => {
        if (disposed) return;
        cleanup = enhance(root) ?? noop;
        root.dataset.enhancement = 'ready';
      })
      .catch(() => {
        if (!disposed) root.dataset.enhancement = 'fallback';
      });

    return () => {
      disposed = true;
      cleanup();
      delete root.dataset.enhancement;
    };
  }, [loadEnhancer, rootRef]);
}
