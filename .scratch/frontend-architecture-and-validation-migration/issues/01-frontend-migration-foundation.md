Status: ready-for-agent

# Frontend Migration Foundation

## Parent

.scratch/frontend-architecture-and-validation-migration/PRD.md

## What to build

Prepare UniHub for the behavior-preserving frontend migration by adding the Tailwind, shadcn, lucide, and source-alias foundation needed by later slices. The app should still run with the same visible behavior after this slice; this issue only establishes the toolchain and shared UI foundation.

## Acceptance criteria

- [ ] Tailwind CSS is configured for the React app and its styles are loaded through the app's global CSS entry.
- [ ] The source import alias points to the source root and works in both Vite and TypeScript.
- [ ] A shadcn-compatible utility foundation exists, including the class-name merge helper expected by generated UI primitives.
- [ ] The selected shadcn primitive set can be added and imported without deep relative paths.
- [ ] lucide icons are available to the app without changing existing navigation behavior yet.
- [ ] Existing routes and visible app behavior remain unchanged.
- [ ] `npm run lint`, `npm test`, and `npm run build` pass.

## Blocked by

None - can start immediately
