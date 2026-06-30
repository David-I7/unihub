# JSON Schema validation for course data

Status: superseded by ADR-0006

Course data and catalog data will be validated with formal JSON Schema files. The schemas will be used by repository validation during development and deployment, and by the contribution UI before it generates a GitHub issue or pull request, because the static app depends on repository JSON as its source of truth.
