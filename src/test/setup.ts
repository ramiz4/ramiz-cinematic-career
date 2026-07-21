import '@testing-library/jest-dom/vitest';

const storageEntries = new Map<string, string>();
const localStorageMock: Storage = {
  get length() { return storageEntries.size; },
  clear: () => storageEntries.clear(),
  getItem: (key) => storageEntries.get(key) ?? null,
  key: (index) => Array.from(storageEntries.keys())[index] ?? null,
  removeItem: (key) => storageEntries.delete(key),
  setItem: (key, value) => storageEntries.set(key, String(value)),
};
Object.defineProperty(window, 'localStorage', { configurable: true, value: localStorageMock });
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: localStorageMock });

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
