Status: ready-for-agent

# PRD: Frontend Architecture and Validation Migration

Superseded note: `.scratch/course-data-domain-fixes/PRD.md` supersedes this older PRD where it says Grade Weight totals above 100 remain blocking errors. The current domain rule allows totals above 100 and keeps below-100 totals as warnings.

## Problem Statement

UniHub's React frontend has outgrown its current implementation shape. Route screens, layout chrome, shared UI pieces, theme handling, academic context persistence, loading state, contribution schema help, and page-specific behavior are all concentrated in one large app module. Styling is also concentrated in a bespoke stylesheet with inline styles sprinkled through the UI. This makes the app harder for maintainers and agents to navigate, raises the cost of adding new Course-facing features, and makes repeated UI patterns more likely to drift.

The validation layer has a similar source-of-truth problem. Course, Catalog, and Contribution validation currently depend on JSON Schema files plus a custom schema interpreter and separate TypeScript domain types. The project has decided to replace that with zod runtime validation so the rules are easier to maintain in TypeScript and reuse between repository validation and the Contribution workflow.

## Solution

Refactor UniHub into a behavior-preserving frontend architecture. Route-level screens become page modules, shared navigation and app chrome move into layout modules, reusable UI pieces move into component modules, and shared hooks or helpers move outside route pages. The selected Academic Year, Study Year, and Semester remain persisted in local storage and owned by the app layout, which also owns course loading, loading states, and load errors.

Migrate the UI implementation to Tailwind CSS, shadcn UI primitives, and lucide icons without redesigning the product. The app should keep its compact academic dashboard feel, desktop app rail, mobile bottom navigation, Course grid, Calendar agenda list, Contribution split view, and schema guide dialog. The current visible behavior should remain stable while the implementation becomes easier to extend.

Replace JSON Schema validation with zod schemas for Catalog data, Course data, and Contribution payloads. Zod becomes the runtime validation source of truth. Existing TypeScript domain types may remain where replacing them would expand the migration, but inferred zod types may be used where they reduce duplication. Once equivalent zod validation exists and tests pass, legacy JSON Schema files should be removed.

## User Stories

1. As a maintainer, I want route-level screens to live as pages, so that I can find Home, Calendar, Contribute, and Course detail behavior quickly.
2. As a maintainer, I want shared app chrome to live in layout modules, so that navigation, loading state, and context ownership are not duplicated across pages.
3. As a maintainer, I want reusable UI pieces to live as components, so that repeated controls such as context selection, cards, validation panels, and schema guidance are easy to reuse.
4. As a maintainer, I want shared hooks to live outside route pages, so that theme and context persistence behavior is not buried in screen rendering code.
5. As a maintainer, I want source imports to use the standard app alias, so that split modules do not rely on fragile deep relative paths.
6. As a maintainer, I want the app layout to own selected Academic Year, Study Year, and Semester state, so that all pages consume one consistent academic context.
7. As a student, I want my selected Academic Year, Study Year, and Semester to keep being remembered, so that the refactor does not change my day-to-day workflow.
8. As a student, I want course loading, loading indicators, and load errors to behave the same after the refactor, so that the app remains understandable while data is being loaded.
9. As a student, I want the desktop app rail to remain available, so that Home, Calendar, and Contribute stay easy to reach on larger screens.
10. As a student, I want the mobile bottom navigation to remain available, so that the app stays usable on a phone.
11. As a student, I want visible navigation labels to remain, so that lucide icons improve recognition without making navigation ambiguous.
12. As a student, I want the Home page to keep showing Course cards for my selected academic context, so that I can browse Courses as before.
13. As a student, I want Course cards to keep showing Course title and professors, so that the refactor does not add visual noise.
14. As a student, I want the Activity panel to keep appearing beside the Home page on desktop and below the Course grid on mobile, so that recent Course additions remain visible.
15. As a student, I want the Calendar page to keep showing an agenda list, so that Assignment Deadlines, Course Sessions, and Exams remain easy to scan.
16. As a student, I want Calendar filters to keep working, so that I can narrow events by Course, type, and time range.
17. As a student, I want Course detail pages to keep using tabs for Materials, Assignments, Lectures, and Exams, so that each Course section remains distinct.
18. As a student, I want missing Course routes to keep showing a clear not-found state, so that broken links are understandable.
19. As a contributor, I want the Contribute page to keep guiding one Contribution at a time, so that the workflow stays focused.
20. As a contributor, I want the Contribution form to keep validating JSON before generating output, so that I can fix issues before maintainer review.
21. As a contributor, I want the schema guide to remain available as a dialog, so that I can understand expected Contribution payload fields.
22. As a contributor, I want the issue flow to keep generating prefilled GitHub issue content, so that I can submit a maintainer-reviewed Contribution.
23. As a contributor, I want the pull request assist flow to keep generating PR guidance, so that I can prepare repository changes without learning the whole codebase.
24. As a maintainer, I want shadcn buttons, selects, cards, tabs, textareas, dialogs, tables, and badges used where they cleanly replace existing primitives, so that the UI has consistent accessibility and styling defaults.
25. As a maintainer, I want heavier shadcn patterns deferred, so that the migration does not accidentally redesign the product.
26. As a maintainer, I want Tailwind utility classes to replace page and component CSS, so that styling is local to the UI it affects.
27. As a maintainer, I want only minimal global CSS to remain, so that there is no second large styling system competing with Tailwind.
28. As a maintainer, I want the old app stylesheet removed once Tailwind parity exists, so that future changes do not depend on hidden global rules.
29. As a maintainer, I want lucide icons to replace letters and emoji, so that navigation and actions use recognizable, consistent iconography.
30. As a maintainer, I want the Home icon to use a house glyph, so that Home is immediately recognizable.
31. As a maintainer, I want the Calendar icon to use a calendar glyph, so that the Calendar route is immediately recognizable.
32. As a maintainer, I want the Contribute icon to use a contribution-appropriate glyph, so that users understand it as an action area.
33. As a maintainer, I want theme icons to use monitor, sun, and moon glyphs, so that system, light, and dark states are clear.
34. As a maintainer, I want close actions to use a standard close icon, so that dialogs and pickers are familiar.
35. As a maintainer, I want the academic context picker to use an academic or calendar-range icon, so that its purpose is visually anchored.
36. As a maintainer, I want zod schemas to validate Catalog data, so that malformed hierarchy data cannot break navigation.
37. As a maintainer, I want zod schemas to validate Course data, so that malformed Course files cannot break Course detail, Calendar, Activity, or Contribution behavior.
38. As a maintainer, I want zod schemas to validate Contribution payloads, so that the Contribute page and repository checks share the same runtime rules.
39. As a maintainer, I want zod validation to preserve current friendly error and warning behavior, so that contributors still receive actionable messages.
40. As a maintainer, I want Course warnings such as missing professors, missing Materials, missing optional timestamps, unknown Exam dates, and incomplete Grade Weight totals to remain warnings, so that useful partial Course data can still be accepted.
41. As a maintainer, I want invalid Material References to remain blocking errors, so that Assignment Deadlines and Exams do not link to missing or wrong-type Materials.
42. As a maintainer, I want duplicate local IDs to remain blocking errors, so that Course items remain addressable.
43. As a maintainer, I want impossible Course Session times to remain blocking errors, so that Calendar Events are not nonsensical.
44. As a maintainer, I want Grade Weight totals above 100 to remain blocking errors, so that impossible grading data cannot be merged.
45. As a maintainer, I want JSON Schema files removed after zod parity, so that there is only one validation source.
46. As a maintainer, I want the old JSON Schema ADR marked as superseded, so that future readers understand why validation changed.
47. As an implementing agent, I want the migration ordered in reviewable steps, so that styling, routing, and validation regressions are easier to isolate.
48. As an implementing agent, I want tests to verify behavior rather than component names or file structure, so that the refactor can improve internals without fragile tests.
49. As a reviewer, I want lint, tests, and build to pass after the migration, so that the refactor is shippable.
50. As a reviewer, I want the app to remain deployable on GitHub Pages with hash routing, so that existing deployment constraints are respected.

## Implementation Decisions

- This is a behavior-preserving implementation migration, not a product redesign.
- The existing static app behavior, HashRouter routes, data model, Contribution workflow, local persistence, and GitHub Pages compatibility must remain intact.
- Route-level screens are the only modules that should be treated as pages: Home, Calendar, Contribute, Course detail, and a not-found page if a fallback route is added.
- Shared app chrome, navigation, loading state, load errors, and selected academic context ownership belong in the app layout.
- The app layout owns persistence for Academic Year, Study Year, and Semester, and route pages consume that state rather than reimplementing it.
- Reusable visual and interaction pieces belong in component modules.
- Shared hooks and non-domain helpers belong outside route pages.
- Add the standard source import alias pointing at the source root to match shadcn conventions and avoid deep relative imports.
- Add Tailwind CSS and migrate page/component styling to Tailwind utility classes.
- Keep only minimal global CSS for Tailwind directives, shadcn theme variables, and true application-wide base styles.
- Delete the old page/component stylesheet once Tailwind parity exists.
- Use shadcn components where they directly replace current UI primitives: buttons, selects, cards, tabs, textareas, dialogs, tables, and status badges.
- Do not introduce heavier shadcn patterns unless they are already required by the existing product behavior.
- Use lucide icons instead of letters or emoji for navigation and actions.
- Keep text labels visible in the rail and bottom navigation.
- Preserve the compact academic dashboard visual direction.
- Preserve the desktop app rail and mobile bottom navigation.
- Preserve the Course grid, Activity panel, Calendar agenda list, Course detail tabs, Contribution split view, and schema guide dialog.
- Implement the migration in reviewable order: toolchain and shadcn prerequisites, module split, Tailwind/shadcn styling parity, lucide icons, zod validation, then final verification.
- Replace JSON Schema runtime validation with zod schemas for Catalog, Course, and Contribution payload validation.
- Zod becomes the runtime validation source of truth.
- Existing TypeScript domain types may remain when replacing them would unnecessarily expand the blast radius.
- Types may be inferred from zod schemas where that clearly reduces duplication.
- Remove legacy JSON Schema files only after equivalent zod validation exists and tests pass.
- Preserve existing validation result contracts: valid flag, errors, and warnings.
- Preserve existing friendly validation wording where practical so the Contribution UI remains understandable.
- Preserve repository validation rules for duplicate IDs, Course Path consistency, Material References, Session Status, Course Session timing, and Grade Weight totals.
- Preserve Contribution validation rules for supported Contribution types, batch support, duplicate IDs, existing target Course checks, Material References, and Grade Weight totals.
- ADR-0004 is superseded by the zod validation decision recorded in ADR-0006.

## Testing Decisions

- Tests should verify external behavior and validation contracts, not internal component names, directory names, or exact Tailwind class strings.
- The highest UI seam is rendering the application through its routes and asserting user-visible behavior for Home, Calendar, Contribute, Course detail, loading, load errors, and missing Course states.
- The highest validation seam is the existing validation/domain API used by repository checks and Contribution preparation.
- Existing domain tests are prior art and should be extended or preserved to cover zod parity.
- Add or update tests that prove valid Catalog data passes and malformed Catalog data fails with useful errors.
- Add or update tests that prove valid Course data passes and malformed Course data fails with useful errors.
- Add or update tests that prove Course warnings remain warnings rather than blocking errors.
- Add or update tests that prove duplicate local IDs remain blocking errors.
- Add or update tests that prove invalid Material References remain blocking errors.
- Add or update tests that prove Assignment Deadline Material References must point to assignment Materials.
- Add or update tests that prove Exam Material References must point to exam Materials.
- Add or update tests that prove invalid Session Status is rejected.
- Add or update tests that prove Course Sessions must end after they start.
- Add or update tests that prove Grade Weight totals above 100 are rejected.
- Add or update tests that prove Grade Weight totals below 100 produce warnings when grading data is present.
- Add or update tests that prove Contribution payload validation still supports single-item and supported batch Contributions.
- Add or update tests that prove unsupported batch Contribution types are rejected.
- Add or update tests that prove Contribution output generation still works for issue mode.
- Add or update tests that prove Contribution output generation still works for pull request assist mode.
- Add or update route-level tests if the project has an app rendering test setup available; otherwise keep UI verification manual and rely on domain/validation tests for automated coverage.
- Verify `npm run lint`, `npm test`, and `npm run build` after implementation.
- If a browser verification pass is available, inspect desktop and mobile routes to confirm Tailwind/shadcn parity did not break layout, text fit, navigation, dialogs, or contribution output.

## Out of Scope

- Redesigning UniHub's product experience.
- Adding a landing page, hero page, or marketing surface.
- Replacing HashRouter with BrowserRouter.
- Changing GitHub Pages deployment behavior.
- Changing the Course data model beyond the validation implementation.
- Changing Course Path semantics.
- Changing the Contribution workflow or maintainer-review requirement.
- Adding direct in-app writes to the repository.
- Adding account, login, or role management.
- Adding search.
- Adding PWA or offline support.
- Adding announcements.
- Adding a calendar month grid.
- Adding heavier shadcn patterns such as command palettes, data tables, form frameworks, sidebars, or full calendar widgets.
- Rewriting every TypeScript domain type from zod inference if doing so increases migration risk.
- Keeping JSON Schema files as a parallel validation source after zod parity exists.

## Further Notes

This PRD follows the decisions captured during the grill-with-docs session. The main product-language documents were updated to state that the Tailwind, shadcn, and lucide work is component-system parity rather than redesign, and that zod is the runtime validation source of truth.

The implementation should respect the existing ADRs for GitHub-native Contributions, explicit Course Sessions, Course Path folder hierarchy, and React Router hash routing. ADR-0006 supersedes the prior JSON Schema validation decision.
