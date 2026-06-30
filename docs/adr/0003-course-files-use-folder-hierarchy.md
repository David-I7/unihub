# Course files use folder hierarchy

Canonical course data will be split into one JSON file per course, and the folder path will be the source of the academic year, study year, and semester hierarchy. This keeps course files small and reviews focused, while the app can reconstruct the Teams-like navigation from the static file paths at build time.
