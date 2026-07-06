# Public data directory for catalog and courses

Canonical catalog and course JSON live under `public/data` so the static app can fetch the same deployed assets that maintainers review in the repository. This replaces the older `src/data` location for canonical data and avoids a split source of truth between build-time imports and browser runtime course loading.
