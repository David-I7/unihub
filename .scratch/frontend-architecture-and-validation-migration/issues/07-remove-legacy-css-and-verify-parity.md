Status: ready-for-agent

# Remove Legacy CSS and Verify Parity

## Parent

.scratch/frontend-architecture-and-validation-migration/PRD.md

## What to build

Finish the behavior-preserving migration by deleting the old page/component stylesheet and remaining inline UI styles after Tailwind and shadcn parity exists. Verify that desktop and mobile routes still match the intended compact academic dashboard behavior.

## Acceptance criteria

- [ ] The old app-level page/component stylesheet is deleted or reduced to no meaningful UI behavior.
- [ ] Global CSS contains only Tailwind directives, shadcn/theme variables, and true app-wide base styles.
- [ ] Remaining inline styles are removed unless they are justified dynamic values.
- [ ] Desktop navigation, mobile navigation, Home, Calendar, Course detail, and Contribute remain visually coherent.
- [ ] Text fits within buttons, cards, dialogs, nav items, filters, and generated-output containers on desktop and mobile.
- [ ] The schema guide dialog, academic context picker, Course cards, Activity panel, Calendar agenda, Course detail tabs, and Contribution split view remain usable.
- [ ] The app remains a behavior-preserving migration with no landing page, hero page, new workflow, or product redesign.
- [ ] `npm run lint`, `npm test`, and `npm run build` pass.
- [ ] If browser verification is available, desktop and mobile screenshots are captured or inspected for layout regressions.

## Blocked by

- .scratch/frontend-architecture-and-validation-migration/issues/03-home-and-calendar-pages-use-shared-components.md
- .scratch/frontend-architecture-and-validation-migration/issues/04-course-detail-page-uses-shared-components.md
- .scratch/frontend-architecture-and-validation-migration/issues/05-contribute-page-uses-shared-components.md
- .scratch/frontend-architecture-and-validation-migration/issues/06-zod-validation-replaces-json-schema.md
