Status: completed

# Issue 01: Implement Dual-Mode Repository Loader

Superseded note: `.scratch/course-data-domain-fixes/PRD.md` supersedes any `src/data/courses` loader assumptions in this older issue. Repository loading should read canonical Course JSON from `public/data/courses`.

## Parent

[.scratch/lazy-loading-courses/PRD.md](file:///C:/Users/Dave2swag/Desktop/projects/agents/unihub/.scratch/lazy-loading-courses/PRD.md)

## What to build

Re-architect the repository module to auto-discover and load course data dynamically using a dual-mode strategy:
1. Under a Vite/browser environment, it must use Vite's `import.meta.glob` to scan and dynamically import courses from their folders asynchronously.
2. Under a native Node.js test-runner environment, it must dynamically import `node:fs` using `/* @vite-ignore */` to scan and read JSON files directly from disk.
3. Determine the Academic Year, Study Year, and Semester of each Course based on the folder path parsed via existing helpers.
4. Ensure the existing synchronous test suite continues to pass in Node.

## Acceptance criteria

- [x] All course files inside `src/data/courses/` are auto-discovered dynamically without static import statements.
- [x] Adding a new JSON course file to the folder structure is automatically resolved in local development.
- [x] Node-based test runner (`npm run test`) runs successfully and passes all validations without compilation or runtime errors.
- [x] Vite production build completes successfully without trying to bundle `node:fs` or `node:path`.

## Blocked by

None - can start immediately
