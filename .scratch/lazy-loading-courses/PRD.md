Status: ready-for-agent

# PRD: Lazy Load Course Data

Superseded note: `.scratch/course-data-domain-fixes/PRD.md` supersedes the statement below that Catalog data is duplicated in `src/data`. Canonical Catalog and Course JSON now live only under `public/data`.

## Problem Statement

The current UniHub application architecture loads all course data statically into memory at startup. Every single course JSON file is statically imported at build time. As the project grows to include more Academic Years, Study Years, and Semesters, this approach will lead to bloated initial bundles, high initial memory usage, slow page load times, and dynamic scaling issues for static deployments.

## Solution

Transition to a lazy-loading architecture for course data:
1. Move the course JSON files to the `public/data/courses/` folder structure, serving them as static assets.
2. Update the `catalog.json` structure (located in `public/data/` and duplicated in `src/data/` for compile-time/development sync) to list course metadata (identifiers and titles) for each semester.
3. Perform dynamic data loading at the **Semester** level: when a user selects a context (Academic Year, Study Year, Semester) or visits a course page directly, fetch the course JSON files in parallel using standard browser `fetch`.
4. Implement a dual-mode data loader in the repository module that automatically uses browser `fetch` in the browser, but falls back to native Node.js filesystem imports (using `globalThis.nodeRequire`) when running the test runner in Node. This ensures full compatibility with the existing synchronous test suite without bundle-time compiler issues.

## User Stories

1. As a student, I want the application to load instantly when I open it, so that I do not wait for the data of semesters I am not enrolled in.
2. As a student, I want to see a loading indicator when selecting a different Academic Year, Study Year, or Semester, so that I know the app is retrieving the courses.
3. As a student, I want to navigate directly to a shared course route (e.g. `#/courses/2025-2026/year-2/semester-1/algorithms`), so that I can see the details of that course immediately.
4. As a student, I want the calendar events and activity feed to automatically update and show relevant information when the selected academic context changes.
5. As a developer/contributor, I want to add new courses by placing a JSON file in the appropriate directory hierarchy and updating `catalog.json`, so that contributing remains structured and clean.
6. As a developer/maintainer, I want the local test runner (`npm run test`) to work out-of-the-box in Node, so that I can quickly verify the correctness of the domain rules and validators without starting Vite.
7. As a maintainer reviewing contributions, I want the contribution creation page to validate my changes against the target course data, so that I can catch typos and invalid fields before submission.

## Implementation Decisions

* **Public Directory Hosting**: Host course data files in `public/data/courses/<academicYear>/<studyYear>/<semester>/<courseId>.json`.
* **Explicit Catalog Listing**: Update the catalog schema to allow `courses` properties inside semesters to facilitate client-side dynamic discovery.
* **Dual-Mode Repository Loader**:
  - Under browser/Vite environment: Fetch JSON files over standard HTTP GET via `fetch`.
  - Under Node.js environment (tests): Read JSON files dynamically from `public/data/courses/` using Node's native `fs` and `path` modules via `globalThis.nodeRequire`.
* **Semester-Level Lazy Loading State**: Integrate an asynchronous loading mechanism in `App.tsx` via `useEffect` hooks, triggering dynamic parallel loading of courses within the selected context and caching them in React state.
* **Validation Seam Integration**: Update `contributionPayloadFromText` and the Contribute page form to utilize the loaded course data in the active context, instead of expecting a fully loaded synchronous repository snapshot.

## Testing Decisions

* **External Behavior Tests**: Test that the dual-mode repository loader correctly discovers and loads the catalog and course data from the public folder.
* **Validated Modules**:
  - `src/repository.ts` (dual-mode loading)
  - `src/domain.ts` (hierarchy reconstruction and event derivation)
  - `src/contribution.ts` (validations against dynamically loaded courses)
* **Prior Art**: The existing tests in [domain.test.ts](file:///C:/Users/Dave2swag/Desktop/projects/agents/unihub/tests/domain.test.ts) already verify catalog schema, hierarchy building, course validation, and contribution preparation. We will adapt them to support the asynchronous nature of the repository loader.

## Out of Scope

* Creating a dynamic backend database or API server (the app remains statically hosted on GitHub Pages).
* Implementing real-time communication or automatic syncing between client sessions.

## Further Notes

By using the `public` directory, course JSON files remain clean, raw JSON files that are not compiled into JavaScript dynamic chunks by the bundler, and can be retrieved by any standard client tool.
