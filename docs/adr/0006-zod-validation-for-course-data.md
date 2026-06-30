# Zod validation for course data

UniHub will validate catalog data, course data, and contribution payloads with zod schemas instead of repository JSON Schema files. The migration keeps the current static app behavior, routes, data model, and contribution workflow intact, while making validation rules type-aware in TypeScript and easier to reuse between repository checks and the contribution UI. Zod is the runtime validation source of truth; TypeScript types may be inferred from schemas where that reduces duplication, but replacing every existing domain type is not part of the migration.
