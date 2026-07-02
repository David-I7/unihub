Status: ready-for-agent

# PRD: Contribution and Suggestion Flow Reset

## Problem Statement

Maintainers and students currently face a confusing Contribution and Suggestion experience. The maintainer Contribution page still exposes pull request assist concepts, stale catalog-structure tasks, visible inline creation fields, broken add-another controls, and validation language that feels technical instead of user-facing. Student Suggestion flows must remain simpler than maintainer Contributions, but the current implementation risks leaking Contribution-level behavior such as batching and raw repository concerns.

The result is a workflow that does not match the current product decision: UniHub should use GitHub issues as the only in-app handoff, Contributions should be maintainer-oriented review artifacts, and Suggestions should remain student-facing requests that produce exactly one item.

## Solution

Reset the Contribution and Suggestion flows around the settled issue-only model. The maintainer Contribution page will generate GitHub issues only, remove pull request assist output, expose Add Semester as the single catalog-structure task, support explicit batch creation for repeated Course items, and hide inline child creation until the maintainer asks for it. New Course Contributions will require at least one professor and canonical Course validation will enforce that rule.

Student Suggestions will continue to produce one GitHub issue with a human-readable Suggestion summary and maintainer Contribution details. Suggestion flows will not expose add-another controls, pull request concepts, raw repository paths, or raw Contribution type names.

## User Stories

1. As a maintainer, I want the Contribution page to generate GitHub issues only, so that the handoff model is clear.
2. As a maintainer, I do not want to see pull request assist mode, so that I do not choose a stale workflow.
3. As a maintainer, I do not want generated PR titles, PR bodies, or GitHub edit links, so that Contribution output matches the issue-only contract.
4. As a maintainer, I want Contribution preparation to have an issue-only domain contract, so that code and UI do not drift.
5. As a maintainer, I want generated issue bodies to contain review-focused diff and new-state data, so that reviews stay focused.
6. As a maintainer, I want stale validation chatter omitted from issue bodies, so that issue text stays readable.
7. As a maintainer, I want Add Semester to be the only visible catalog-structure task, so that catalog hierarchy changes have one clear entry point.
8. As a maintainer, I want Add Semester to let me create a new Academic Year in the same Contribution when needed, so that I do not submit separate setup issues.
9. As a maintainer, I want Add Semester to let me create a new Study Year in the same Contribution when needed, so that the hierarchy can be completed in one review artifact.
10. As a maintainer, I want new Academic Year fields hidden until I toggle them open, so that the default Add Semester form stays focused.
11. As a maintainer, I want new Study Year fields hidden until I toggle them open, so that existing hierarchy selection remains simple.
12. As a maintainer, I want hidden catalog creation sections to contribute no payload fields, so that accidental empty parent objects are not generated.
13. As a maintainer, I want standalone Add Academic Year and Add Study Year tasks hidden from the UI, so that all catalog-structure creation flows through Add Semester.
14. As a developer, I want backward-compatible standalone catalog handlers to remain temporarily if needed, so that old payloads and tests can be migrated safely.
15. As a maintainer, I want catalog labels to generate IDs automatically, so that I do not invent storage identifiers manually.
16. As a maintainer, I want generated IDs to update while I am editing the label, so that the generated value stays synchronized.
17. As a maintainer, I want a manually edited generated ID to stop being overwritten by later label changes, so that advanced overrides remain possible.
18. As a maintainer, I want Add Semester to reject duplicate Semester IDs, so that catalog data remains valid.
19. As a maintainer, I want Add Semester to reject missing required hierarchy fields, so that catalog changes are unambiguous.
20. As a maintainer, I want Add New Course to require at least one professor, so that Course records identify who teaches the Course.
21. As a maintainer, I want canonical Course validation to reject empty professor lists, so that direct JSON edits cannot bypass the form rule.
22. As a maintainer, I want the New Course professor field to be labeled as required, so that I know it must be filled.
23. As a maintainer, I want the professor field placeholder to explain comma-separated professor names, so that multiple professors are easy to enter.
24. As a maintainer, I want generated New Course payloads to split comma-separated professor names, so that the Course stores professors as an array.
25. As a maintainer, I want New Course generation to keep default `unknown` difficulty values, so that generated Course JSON is valid when difficulty is unknown.
26. As a maintainer, I want inline new assignment Material fields hidden until toggled, so that Assignment Deadline creation starts with the main item.
27. As a maintainer, I want inline new exam Material fields hidden until toggled, so that Exam creation starts with the main item.
28. As a maintainer, I want hidden inline Material fields to contribute no payload fields, so that empty Materials are not generated accidentally.
29. As a maintainer, I want Assignment Deadline forms to show only assignment Materials in the linked Material multiselect, so that invalid Material References are avoided.
30. As a maintainer, I want Exam forms to show only exam Materials in the linked Material multiselect, so that invalid Material References are avoided.
31. As a maintainer, I want to select and unselect multiple compatible Materials, so that I can control which Materials are linked.
32. As a maintainer, I want a useful empty state when no compatible Materials exist, so that I know to add the needed Material first.
33. As a maintainer, I want Add another material to append a new editable Material item, so that I can submit a batch of Materials in one Contribution.
34. As a maintainer, I want Add another assignment to append a new editable Assignment Deadline item, so that I can submit related deadlines together.
35. As a maintainer, I want Add another exam to append a new editable Exam item, so that I can submit related Exams together.
36. As a maintainer, I want Add another lecture to append a new editable Course Session item, so that I can submit related lectures together.
37. As a maintainer, I want each batch Contribution to generate one GitHub issue containing all items, so that the review artifact preserves my batching intent.
38. As a maintainer, I want duplicate IDs inside a batch to be blocked, so that Course item IDs remain unique.
39. As a maintainer, I want single-item Contributions to use single-item validation wording, so that I do not see unnecessary item indexes.
40. As a maintainer, I want multi-item Contributions to use item-specific validation wording, so that I can identify which batch item failed.
41. As a maintainer, I want the validation error title to say Failed to validate, so that the error feels plain and actionable.
42. As a student, I want Suggestion flows to create exactly one item, so that suggestions remain simple.
43. As a student, I do not want add-another controls in Suggestion flows, so that I do not accidentally create a batch.
44. As a student, I want Suggestion review summaries to stay human-readable, so that I understand what I am sending.
45. As a student, I do not want to see raw Contribution type names, so that the Suggestion flow uses student-facing language.
46. As a student, I do not want to see repository target paths in Suggestion review, so that GitHub details do not distract from my request.
47. As a student, I do not want to see pull request concepts in Suggestions, so that the handoff is simply a GitHub issue.
48. As a maintainer, I want Suggestion issue bodies to include generated Contribution details for maintainers, so that I can review and apply the request.
49. As a developer, I want Suggestion internals to reject array input defensively, so that Suggestions cannot become batch Contributions through non-UI callers.
50. As a developer, I want tests to prove Contribution and Suggestion behavior through public seams, so that refactors do not break product behavior.

## Implementation Decisions

- Remove pull request assist from the Contribution product and domain contract.
- Remove Contribution mode selection from maintainer UI.
- Contribution preparation generates GitHub issue handoff output only.
- Remove PR-specific prepared output fields from the public Contribution result contract: PR title, PR body, and GitHub edit/create link.
- Keep issue URL generation small by not embedding full issue body content in the URL.
- Keep generated issue body content as the maintainer review artifact.
- Add Semester remains the visible catalog-structure task.
- Standalone Add Academic Year and Add Study Year are removed from maintainer task options.
- Backward-compatible standalone domain handlers may remain during migration, but they are not part of the visible product flow.
- Add Semester supports a composite payload shape with optional parent creation:

```ts
{
  academicYear?: { id: string; label: string; order?: number }
  studyYear?: { id: string; label: string; order?: number }
  semester: { id: string; label: string; order?: number }
}
```

- Composite Add Semester creates the Academic Year first when supplied, then creates the Study Year when supplied, then creates the Semester.
- Add Semester hidden parent sections do not emit parent payload fields until toggled.
- Catalog ID fields are generated from labels until the maintainer manually edits the ID field.
- Once an ID field is manually edited, label edits do not overwrite it.
- Add New Course requires at least one professor in generated Contribution input and canonical Course validation.
- Course validation treats an empty professor list as an error, not a warning.
- New Course professor entry uses comma-separated names and stores them as a professor array.
- Batchable maintainer Contribution tasks use an `items` array in form/domain input for repeated Course items.
- Batchable tasks are Materials, Assignment Deadlines, Exams, and Course Sessions.
- Non-batchable tasks are Course metadata edits, New Course creation, and catalog-structure creation.
- A maintainer batch Contribution generates one GitHub issue containing all added items.
- Add-another controls append editable items and do not appear as inert buttons.
- Inline new assignment/exam Material creation is separate from batch creation and is hidden behind an explicit toggle.
- Compatible Material selection uses multiselect controls that allow select and unselect behavior.
- Suggestion flows remain singular and must not expose batch controls.
- Suggestion domain handling defensively rejects array input.
- Validation panel heading changes from Validation Blocked to Failed to validate.

## Testing Decisions

- Prefer the existing domain layer as the main test seam because it already covers repository validation, Contribution validation, generated Contribution preparation, Suggestion preparation, and review output.
- Domain tests should assert issue-only Contribution output and absence of PR output fields.
- Domain tests should assert New Course professor validation at both generated Contribution and canonical Course validation levels.
- Domain tests should assert composite Add Semester behavior for existing parents, new Academic Year, new Study Year, and duplicate/missing target cases.
- Domain tests should assert batch payload generation for Materials, Assignment Deadlines, Exams, and Course Sessions.
- Domain tests should assert that batch Contributions produce one GitHub issue containing all items.
- Domain tests should assert single-item validation wording omits item indexes while multi-item validation identifies the failing item.
- Domain tests should assert Suggestion preparation rejects array input and still produces one issue for normal single-item Suggestions.
- UI or browser verification should cover hidden toggles, generated-ID live update behavior, ID override behavior, compatible Material multiselect select/unselect behavior, and working add-another controls.
- UI tests should verify the Contribution page has no mode selector, PR copy button, PR output panel, or GitHub edit/create link.
- Tests should verify user-visible behavior and public contracts, not private helper names.
- Existing Node domain tests are prior art for the domain seam; route/component or browser checks should be used only where stateful UI behavior cannot be observed through domain tests.
- Run the repository test suite after implementation.
- Run the production build after implementation because this changes typed domain contracts and route UI.

## Out of Scope

- Direct in-app writes to GitHub.
- One-click pull request creation.
- Pull request assist, GitHub edit links, PR titles, or PR bodies.
- In-app Suggestion status tracking.
- Maintainer authentication or accounts.
- Per-item Suggestion actions beyond the current section-level Suggestion model.
- Whole-Course JSON editing as the normal Contribution path.
- Changing Course Path semantics.
- Changing Material type vocabulary.
- Replacing zod validation.
- Removing backward-compatible standalone catalog domain handlers if doing so would materially expand migration risk.
- Implementing a new test framework unless existing seams cannot cover required behavior.

## Further Notes

ADR 0009 records the issue-only Contribution handoff decision and should be treated as the source of truth for pull request assist removal. The active Contribution workflow issues already contain refinements for compatible Material selection, batch add controls, catalog target and label-first ID generation, and New Course two-file output. This PRD consolidates the remaining conversation decisions into one implementation target.
