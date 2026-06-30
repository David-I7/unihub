import catalogJson from './data/catalog.json' with { type: 'json' }
import algorithmsJson from './data/courses/2025-2026/year-2/semester-1/algorithms.json' with { type: 'json' }
import databasesJson from './data/courses/2025-2026/year-2/semester-1/databases.json' with { type: 'json' }
import webEngineeringJson from './data/courses/2025-2026/year-2/semester-2/web-engineering.json' with { type: 'json' }
import { coursePathFromRepositoryPath } from './coursePath.js'
import type { Catalog, Course, LoadedCourse, RepositorySnapshot } from './types.js'

type CourseModule = {
  path: string
  data: unknown
}

const staticCourseModules: CourseModule[] = [
  { path: './data/courses/2025-2026/year-2/semester-1/algorithms.json', data: algorithmsJson },
  { path: './data/courses/2025-2026/year-2/semester-1/databases.json', data: databasesJson },
  { path: './data/courses/2025-2026/year-2/semester-2/web-engineering.json', data: webEngineeringJson },
]

export function loadRepositoryData(): RepositorySnapshot {
  return createRepositorySnapshot(catalogJson, staticCourseModules)
}

export function createRepositorySnapshot(catalog: unknown, courseModules: CourseModule[]): RepositorySnapshot {
  return {
    catalog: catalog as Catalog,
    courses: courseModules.map(loadCourseModule),
  }
}

function loadCourseModule(file: CourseModule): LoadedCourse {
  return {
    ...(file.data as Course),
    path: coursePathFromRepositoryPath(file.path),
  }
}
