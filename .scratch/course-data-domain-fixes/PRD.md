Status: ready-for-agent

# PRD: Course Data Domain Fixes

## Problem Statement

UniHub's domain documentation now says canonical Catalog and Course data live under `public/data`, Materials may be video resources, Materials can be updated after they are added, Activity should show those Material updates, and Grade Weight totals may exceed 100 when a professor's grading policy allows it.

The implementation still contains older assumptions. Some runtime code still points at `src/data`, Material validation does not accept video or `updatedAt`, Activity only reflects `addedAt`, Contribution handling has no update-material path, and validation/tests still reject Grade Weight totals above 100. This creates a split between the domain model, product docs, and actual app behavior.

## Solution

Bring the implementation into alignment with the updated Course data domain model.

Catalog and Course loading should use the public data directory as the single canonical source. Materials should accept a video type and an optional `updatedAt` timestamp. Activity should show both newly added Course items and updated Materials, sorted newest first by the relevant timestamp. Contribution handling should support Material updates as a first-class Contribution type. Grade Weight totals above 100 should be valid, while totals below 100 may remain a warning because they can indicate incomplete grading data.

## User Stories

1. As a student, I want UniHub to load Catalog data from the deployed public data source, so that the app uses the same data maintainers review.
2. As a student, I want Course pages to load Course files from the deployed public data source, so that Course browsing works consistently in the static app.
3. As a maintainer, I want Catalog data to have one canonical repository location, so that I do not have to keep duplicate files synchronized.
4. As a maintainer, I want Course data path generation to target the public data directory, so that generated Contribution instructions point to the canonical files.
5. As a contributor, I want pull request assist links to target public Course files, so that my changes edit the canonical Course data.
6. As a contributor, I want issue output to name the public Course file target, so that maintainers can review the right file.
7. As a maintainer, I want repository validation to read Catalog and Course data from the same canonical source, so that local checks match deployment behavior.
8. As a maintainer, I want obsolete `src/data` dependencies removed, so that future agents do not accidentally reintroduce a split source of truth.
9. As a student, I want video resources to appear as Materials, so that lecture recordings and other videos are easy to find.
10. As a contributor, I want to add a video Material, so that common Course video resources can be contributed without using `other`.
11. As a maintainer, I want video to be a valid Material type, so that validation does not reject common learning resources.
12. As a student, I want the Materials tab to include video Materials, so that video resources are visible with other general Materials.
13. As a maintainer, I want assignment Material References to keep requiring assignment Materials, so that assignment-specific resources stay correctly categorized.
14. As a maintainer, I want exam Material References to keep requiring exam Materials, so that exam-specific resources stay correctly categorized.
15. As a contributor, I want schema guidance to list video as an allowed Material type, so that I can submit valid JSON.
16. As a contributor, I want sample payloads to include the current Material shape, so that generated examples do not teach stale fields.
17. As a maintainer, I want Material records to accept optional `updatedAt`, so that Material changes can be represented explicitly.
18. As a maintainer, I want Material updates to replace or set `updatedAt`, so that Activity can show when the Material was most recently changed.
19. As a student, I want Activity to show updated Materials, so that changed resources do not go unnoticed.
20. As a student, I want Activity to distinguish added Materials from updated Materials, so that I understand what changed.
21. As a student, I want Activity to keep showing Assignment Deadline, Exam, and Course Session additions, so that existing recent-item behavior is preserved.
22. As a student, I want Activity sorted newest first across additions and Material updates, so that the most recent Course changes appear first.
23. As a student, I want Activity to stay filtered to my selected Academic Year, Study Year, and Semester, so that unrelated Course changes do not appear.
24. As a student, I want cancelled Course Sessions in Activity to keep showing their cancelled status, so that existing context remains visible.
25. As a contributor, I want an update-material Contribution type, so that I can correct or replace an existing Material.
26. As a contributor, I want update-material validation to require an existing target Material, so that accidental new IDs are not treated as updates.
27. As a contributor, I want update-material validation to allow title, type, url, and updatedAt changes, so that common Material edits are supported.
28. As a contributor, I want update-material to reject invalid Material types, so that updated Materials remain valid Course data.
29. As a contributor, I want update-material to reject duplicate or missing IDs in batch updates, so that each update is unambiguous.
30. As a contributor, I want update-material to work in issue mode, so that maintainers can review Material corrections.
31. As a contributor, I want update-material to work in pull request assist mode, so that I can prepare a repository edit.
32. As a maintainer, I want update-material to preserve unrelated Course data, so that targeted edits do not rewrite unrelated Course items.
33. As a maintainer, I want new Materials to keep using `addedAt`, so that additions and later updates have distinct timestamps.
34. As a maintainer, I want `updatedAt` to apply only to Materials in this change, so that the scope stays aligned with the domain decision.
35. As a maintainer, I want missing optional timestamps to remain warnings, so that useful partial data can still be accepted.
36. As a professor, I want Grade Weight totals above 100 to be accepted, so that bonus or overweighted grading policies can be represented.
37. As a maintainer, I want validation to stop blocking Grade Weight totals above 100, so that valid professor policies are not rejected.
38. As a contributor, I want Contributions that push Grade Weight totals above 100 to be accepted, so that I can model those Courses accurately.
39. As a student, I want Grade Breakdown to show the actual known total even when it exceeds 100, so that I can understand the Course grading policy.
40. As a maintainer, I want Grade Weight totals below 100 to remain warnings, so that incomplete grading data is still visible.
41. As a maintainer, I want individual Grade Weight values to remain numeric, so that invalid grading data is still caught.
42. As a maintainer, I want existing duplicate local ID validation to remain blocking, so that Course items stay addressable.
43. As a maintainer, I want existing Course Session timing validation to remain blocking, so that Calendar Events remain coherent.
44. As a maintainer, I want existing Session Status validation to remain blocking, so that Course Session lifecycle values stay constrained.
45. As a maintainer, I want existing Course Path consistency validation to remain blocking, so that Course files remain discoverable.
46. As a maintainer, I want existing Catalog hierarchy validation to remain blocking, so that navigation cannot be broken by malformed Catalog data.
47. As a maintainer, I want stale backlog notes that contradict the new domain decisions to be updated or clearly superseded, so that future work is not guided by old assumptions.
48. As an implementing agent, I want tests to encode the new domain decisions, so that regressions are caught.
49. As a reviewer, I want the app to pass tests after these changes, so that the implementation is safe to merge.
50. As a reviewer, I want the build to pass after these changes, so that GitHub Pages deployment remains viable.

## Implementation Decisions

- `public/data` is the canonical location for Catalog and Course JSON.
- The old compile-time Catalog duplicate should no longer be treated as a source of truth.
- Runtime Course loading should continue fetching public Course JSON in the browser.
- Repository/test loading should read the same public Catalog and Course JSON shape used by the browser.
- Course file path generation should return canonical public data paths for Contribution output and GitHub edit links.
- Course Path parsing should continue accepting repository paths that include the `courses` hierarchy.
- Material type vocabulary expands to include `video`.
- General Materials grouping expands to include `video` alongside course, seminar, lab, and other.
- Assignment and exam Materials remain special-purpose types referenced from Assignment Deadlines and Exams rather than shown in the general Materials tab.
- Material records accept optional `updatedAt`.
- `updatedAt` is a Material update timestamp, not a replacement for `addedAt`.
- New Materials use `addedAt`; existing Material changes use `updatedAt`.
- Activity derives additions from `addedAt` on Materials, Assignment Deadlines, Course Sessions, and Exams.
- Activity derives Material update events from `updatedAt` on Materials.
- Activity should sort all events newest first by the event timestamp.
- Activity event text should make update events visibly distinct from added events.
- The Activity panel may keep using a single timestamp display, but the timestamp value must represent the event being shown.
- Contribution types expand to include update-material.
- update-material modifies an existing Material in the target Course.
- update-material must fail when the target Material ID does not exist.
- update-material must not create a new Material.
- update-material should be supported by the same Contribution preparation flow as other Contribution types.
- update-material should support single-item payloads and may support batches if the existing batchable Contribution pattern can be reused cleanly.
- Schema guidance and sample payloads should be updated so contributors see `url`, `video`, and `updatedAt` where appropriate.
- Grade Weight totals above 100 are valid Course data.
- Validation should remove blocking errors that reject total Grade Weight above 100.
- Contribution validation should remove blocking errors that reject introduced Grade Weight above 100.
- Grade Weight totals below 100 should remain warnings when there is known grading data.
- The Grade Breakdown view should keep showing known totals without assuming 100 is a hard upper bound.
- Existing validation contracts should remain shaped as valid flag, errors, and warnings.
- Existing friendly validation wording should remain where the behavior did not change.
- Existing domain documents and ADRs are the source of truth for these decisions.
- Older work plans that say Course data is duplicated in `src/data`, Activity excludes updates, or Grade Weight totals above 100 are invalid are stale and should not guide implementation.

## Testing Decisions

- Tests should verify externally visible behavior and domain contracts, not private helper names or file layout internals beyond public path outputs.
- The primary automated seam is the existing domain API used by repository loading, validation, hierarchy construction, Course detail derivation, Activity derivation, and Contribution preparation.
- Existing domain tests are the prior art and should be updated instead of adding lower-level tests where possible.
- Repository data validation should prove public Catalog and Course data load and validate from the canonical data location.
- Course Path tests should prove generated data paths point at public Course files.
- Material validation tests should prove video is accepted.
- Material validation tests should prove invalid Material types are still rejected.
- Course detail tests should prove video Materials appear in the general Materials tab grouping.
- Activity tests should prove added Course items still appear.
- Activity tests should prove Material `updatedAt` creates an update Activity event.
- Activity tests should prove update Activity text is distinct from added Activity text.
- Activity tests should prove mixed additions and updates sort newest first.
- Activity tests should prove selected academic context filtering still applies.
- Validation tests should prove Grade Weight totals above 100 are valid.
- Validation tests should prove Grade Weight totals below 100 still warn when appropriate.
- Contribution tests should prove adding an Assignment Deadline or Exam can produce totals above 100 without blocking.
- Contribution tests should prove update-material succeeds for an existing Material.
- Contribution tests should prove update-material fails for a missing Material.
- Contribution tests should prove update-material preserves unrelated Course data.
- Contribution tests should prove update-material issue output is generated.
- Contribution tests should prove update-material pull request assist output is generated.
- Contribution tests should prove schema/sample payload expectations match the accepted payload shape.
- Existing tests for duplicate local IDs, Material References, Course Session timing, Session Status, malformed Catalog data, and unsupported batch types should remain passing.
- Run the repository test suite after implementation.
- Run the production build after implementation if the project has a build script available.

## Out of Scope

- Adding updates for Assignment Deadlines, Exams, Course Sessions, Course metadata, or Catalog entries.
- Turning Activity into a general announcement or notification system.
- Adding accounts, permissions, or authenticated editing.
- Adding direct in-app repository writes.
- Adding video playback, embeds, previews, transcripts, or thumbnails.
- Changing the meaning of Course Path.
- Changing Material Reference rules for Assignment Deadlines or Exams.
- Changing Course Session status values.
- Redesigning the Activity panel or Course page layout beyond what is required to show the new data.
- Introducing a backend service or database.
- Reworking the whole Contribution workflow beyond update-material support.
- Rewriting unrelated stale `.scratch` work unless it directly contradicts these changes and would mislead future implementation.

## Further Notes

The domain docs were already updated before this PRD: `public/data` is canonical, Material supports `video` and `updatedAt`, Activity includes Material updates, and Grade Weight totals above 100 are valid.

The main conflicts found in the repo were stale `src/data` assumptions, Material type validation, Activity derivation, Contribution type support, and Grade Weight validation/tests. The implementation should treat the updated glossary, product data model, contribution workflow, and public-data ADR as authoritative.
