import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const LazyScene = lazy(() => import('./Scene').then((module) => ({ default: module.Scene })));

function useCompactExperience() {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 800px), (pointer: coarse)').matches);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px), (pointer: coarse)');
    const update = () => setCompact(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return compact;
}

function StaticScene() {
  return <div className="scene scene--static" aria-hidden="true" data-testid="static-scene"><i /><i /><i /></div>;
}

type SceneErrorBoundaryProps = { children: ReactNode };
type SceneErrorBoundaryState = { failed: boolean };

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  state: SceneErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <StaticScene /> : this.props.children;
  }
}

export function ExperienceLayer() {
  const reducedMotion = useReducedMotion();
  const compact = useCompactExperience();

  if (reducedMotion) return <StaticScene />;

  return (
    <SceneErrorBoundary>
      <Suspense fallback={<StaticScene />}>
        <LazyScene compact={compact} />
      </Suspense>
    </SceneErrorBoundary>
  );
}
