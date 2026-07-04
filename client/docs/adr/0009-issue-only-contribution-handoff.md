# Issue-only contribution handoff

UniHub will use GitHub issues as the only in-app handoff for maintainer-reviewed Contributions. The earlier pull request assist option is removed from the product and domain contract because it exposed repository mechanics in the UI without providing one-click PR creation, while GitHub issues keep the static-site review model simpler for contributors and maintainers.

## Consequences

The Contribute page should not expose a Contribution mode selector, pull request copy, PR body generation, or GitHub edit/create links. Contribution preparation should generate issue handoff output only; student-facing Suggestions continue to create a single GitHub issue containing maintainer Contribution details.
