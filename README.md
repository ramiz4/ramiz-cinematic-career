# Ramiz Technology Leadership

Preview: https://ramiz4.github.io/ramiz-cinematic-career/

A production-oriented technology-leadership portfolio built with React 19,
TypeScript, GSAP/ScrollTrigger and React Three Fiber. Its core narrative turns
architecture decisions, delivery outcomes and leadership principles into a
responsive scrollytelling experience.

## Development

```bash
npm ci
npm run dev
```

The Vite development URL is
`http://localhost:5173/ramiz-cinematic-career/` by default.

## Architecture

- `src/chapters/` owns the narrative sections and accessible DOM structure.
- `src/content/` contains the leadership story and impact evidence.
- `src/js/scrollytelling.js` owns the GSAP/ScrollTrigger system-graph timeline.
- `src/styles/scrollytelling/` contains chapter-specific presentation layers.
- `src/experience/` owns the ambient 3D scene and shared story-phase contract.

The architecture graph uses a pinned desktop sequence, a compact mobile
sequence, and a static reduced-motion state. Animation is limited to transforms,
opacity and SVG stroke properties to avoid layout work during scrolling.

## Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

GitHub Actions validates every push and pull request. Successful pushes to `main` are deployed to GitHub Pages.
