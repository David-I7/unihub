Status: ready-for-agent

# PRD: Toggleable Contribution Diff and Full Views

## Problem Statement

UniHub's contribution flow has an inconsistency where the contribution preview sometimes displays the entire updated Course/Catalog JSON file instead of just the specific changes (the diff). This can make reviewing the change on-screen overwhelming.

Furthermore, when contributors copy the Pull Request content or generate a GitHub Issue, the resulting body includes unnecessary validation warning messages. Lastly, optional fields in the contribution forms are not explicitly marked, making it unclear to contributors which inputs are required and which can be left empty.

## Solution

To solve this, we will introduce a toggle in the contribution preview UI on the Contribute page. The default view will show only the contribution payload JSON (the "Diff" view), with the option to switch to the full updated Course/Catalog JSON (the "Full JSON" view). 

In addition:
1. The exported content (the prefilled GitHub Issue body and the copied Pull Request content) will continue to include the full updated JSON document for reviewer convenience, but will completely exclude the validation warning checks.
2. Contribution forms will explicitly mark all optional fields with an `(optional)` suffix.

## User Stories

1. As a contributor, I want the preview pane to default to showing only my specific contribution changes (the diff) as JSON, so that I can easily verify my inputs without scrolling through a large document.
2. As a contributor, I want to toggle the preview pane to see the full updated Course or Catalog JSON, so that I can understand how my contribution fits into the overall file structure.
3. As a contributor, I want optional form fields to be explicitly labeled as `(optional)` in the UI, so that I know exactly which fields are required to submit the form.
4. As a contributor, when I click "Copy PR content" or "Open prefilled GitHub issue", I want the generated content to contain the full updated JSON, so that the maintainer has the complete context of the final document.
5. As a contributor, when I click "Copy PR content" or "Open prefilled GitHub issue", I want the generated text to exclude the validation warnings, so that the issue and pull request descriptions are clean, concise, and focused.
6. As a maintainer reviewing an issue or PR, I want to see the full updated JSON document in the description, so that I can quickly verify and apply the contribution without needing to manually merge parts.
7. As a student viewing the Contribute page, I want validation errors and warnings to be displayed clearly in a dedicated panel on the screen, so that I can correct them interactively.

## Implementation Decisions

- **Domain Model Changes**:
  - The `prepareCatalogReviewOutput` function in the domain module will be updated to accept a `parsed` payload parameter (similar to `prepareReviewOutput`).
  - Catalog contribution generators (`add-academic-year`, `add-study-year`, `add-semester`) will attach a `parsed` payload field representing the specific item being added.
  - The formatting of the `issueBody` and `prBody` in `prepareReviewOutput` and `prepareCatalogReviewOutput` will be simplified to exclude the `Validation warnings:` section.
- **UI Changes**:
  - The [ContributePage.tsx](file:///C:/Users/Dave2swag/Desktop/projects/agents/unihub/src/pages/ContributePage.tsx) component will maintain state for the active preview mode (`'diff'` vs `'full'`).
  - A tab-based toggle bar will be added to the preview section.
  - The code preview block will render `JSON.stringify(result.parsed, null, 2)` when in `'diff'` mode, and `result.changedJson` when in `'full'` mode.
  - Form field labels in [ContributePage.tsx](file:///C:/Users/Dave2swag/Desktop/projects/agents/unihub/src/pages/ContributePage.tsx) (e.g. `Academic Year ID`, `Description`, `Order`, `startsAt`, etc.) will have `(optional)` appended if they are not strictly required by the domain validators.

## Testing Decisions

- **Test Integrity**: Only test the external behavior of the domain APIs and the updated review structures.
- **Domain Seams**:
  - Update `tests/domain.test.ts` to assert that the `issueBody` and `prBody` returned by `prepareContribution` and `prepareGeneratedContribution` do not contain the warning texts.
  - Assert that catalog contribution preparation successfully returns the `parsed` diff payload.
- **Prior Art**: The existing tests in `tests/domain.test.ts` serve as the guide.

## Out of Scope

- Implementing interactive Git diff line coloring.
- Adding a validation bypass or allowing invalid contributions to be submitted.
- Editing or modifying any fields in the course database or the catalog outside the scope of the Contribute page forms.

## Further Notes

- The ValidationPanel on the screen will still display warnings and errors in real-time, providing immediate feedback while keeping the exported GitHub descriptions clean.
