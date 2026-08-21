# Ramiz Technology Leadership

Production URLs:
https://ramizloki.com/
https://ramiz4.github.io/ramiz-cinematic-career/

A production-oriented technology-leadership portfolio built with React 19,
TypeScript, GSAP/ScrollTrigger and React Three Fiber. Its core narrative turns
architecture decisions, delivery outcomes and leadership principles into a
responsive scrollytelling experience.

## Development

```bash
pnpm install
pnpm dev
```

The Vite development URL is `http://localhost:5173/` by default.

## Architecture

- `src/chapters/` owns the narrative sections and accessible DOM structure.
- `src/content/` contains the leadership story, impact evidence and typed operating-system stages.
- `src/js/` contains isolated GSAP/ScrollTrigger controllers for the system graph,
  Architecture Matrix intro, responsibility radius, impact stack and engineering operating system.
- `src/styles/scrollytelling/` contains chapter-specific presentation layers.
- `src/experience/` owns the ambient 3D scene and shared story-phase contract.

Each controller exposes a pinned or sticky desktop sequence, a compact mobile
sequence, and a static reduced-motion state. Animation is limited to transforms,
opacity and SVG stroke properties to avoid layout work during scrolling.

The Architecture Matrix runs once per browser session, can be replayed with
`?intro=1`, and defers the ambient Three.js scene until the interface is ready.

## Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

GitHub Actions validates every push and pull request. Successful pushes to `main` are deployed to GitHub Pages.
