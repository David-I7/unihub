# Student suggestions as contextual front door for contributions

UniHub will keep `Contribution` as the maintainer-reviewed repository change model, but normal students will start from contextual course-page `Suggestion` actions instead of the advanced repository-oriented `Contribute` page. This keeps the static GitHub-native review model while giving students a course-first flow with plain-language summaries, a short GitHub handoff, and student-facing GitHub issue wording.

## Considered Options

- Keep the current repository-first contribution page as the normal flow.
- Hide the `Contribute` page and move all contribution behavior into course pages.
- Add direct in-app writes or authenticated trusted editors.
- Keep `Contribute` visible for maintainers and advanced contributors, while making contextual course-page suggestions the normal student front door.

The last option preserves the existing static-site and maintainer-review constraints while reducing student-facing GitHub and JSON concepts.

## Consequences

The product has two related terms with different audiences: `Suggestion` for student-facing requests and `Contribution` for maintainer-reviewed repository changes. The advanced `Contribute` page remains visible and defaults to GitHub issue mode, but it should be framed as maintainer and advanced tooling rather than the default path for fixing a course item.
