import '@testing-library/jest-dom/vitest';
Object.defineProperty(window, 'matchMedia', { writable: true, value: (query: string) => ({ matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined, addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false }) });
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
class ResizeObserverMock {
  observe() { return undefined; }
  unobserve() { return undefined; }
  disconnect() { return undefined; }
}
Object.defineProperty(window, 'ResizeObserver', { writable: true, value: ResizeObserverMock });
Object.defineProperty(globalThis, 'ResizeObserver', { writable: true, value: ResizeObserverMock });
class IntersectionObserverMock {
  root = null;
  rootMargin = '';
  thresholds = [];
  observe() { return undefined; }
  unobserve() { return undefined; }
  disconnect() { return undefined; }
  takeRecords() { return []; }
}
Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: IntersectionObserverMock });
Object.defineProperty(globalThis, 'IntersectionObserver', { writable: true, value: IntersectionObserverMock });
