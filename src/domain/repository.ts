import { coursePathFromRepositoryPath } from './coursePath.js'
import type { Catalog, Course, LoadedCourse, RepositorySnapshot } from './types.js'

declare global {
  var nodeRequire: ((id: string) => unknown) | undefined
}

type NodeFs = {
  existsSync: (path: string) => boolean
  readdirSync: (path: string) => string[]
  statSync: (path: string) => { isDirectory: () => boolean }
  readFileSync: (path: string, encoding: string) => string
}

type NodePath = {
  join: (...args: string[]) => string
  relative: (from: string, to: string) => string
}

type NodeProcess = {
  cwd: () => string
}

export function loadRepositoryData(dataRoot = 'public/data'): RepositorySnapshot {
  const requireFn = globalThis.nodeRequire
  if (requireFn) {
    return {
      catalog: loadCatalogNodeSync(requireFn, dataRoot),
      courses: loadAllCoursesNodeSync(requireFn, dataRoot),
    }
  }
  throw new Error('Synchronous repository loading is only available in Node.js.')
}

export async function loadCatalog(): Promise<Catalog> {
  const requireFn = globalThis.nodeRequire
  if (requireFn) return loadCatalogNodeSync(requireFn)
  const response = await fetch('/data/catalog.json')
  if (!response.ok) throw new Error('Failed to fetch Catalog data.')
  return (await response.json()) as Catalog
}

function loadCatalogNodeSync(requireFn: (id: string) => unknown, dataRoot = 'public/data'): Catalog {
  const fs = requireFn('node:fs') as NodeFs
  const path = requireFn('node:path') as NodePath
  const processObj = (globalThis as unknown as { process: NodeProcess }).process
  const filePath = path.join(processObj.cwd(), dataRoot, 'catalog.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Catalog
}

export function loadRepositoryDataForBrowserFallback(): RepositorySnapshot {
  return {
    catalog: { academicYears: [] },
    courses: [],
  }
}

// Function to load all courses synchronously in Node.js (for tests)
function loadAllCoursesNodeSync(requireFn: (id: string) => unknown, dataRoot = 'public/data'): LoadedCourse[] {
  const fs = requireFn('node:fs') as NodeFs
  const path = requireFn('node:path') as NodePath
  const processObj = (globalThis as unknown as { process: NodeProcess }).process
  const cwd = processObj.cwd()

  const coursesDir = path.join(cwd, dataRoot, 'courses')
  const files = getJsonFiles(coursesDir, fs, path)

  return files.map((filePath: string) => {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContent)
    const relativePath = path.relative(cwd, filePath).replace(/\\/g, '/')
    return {
      ...(data as Course),
      path: coursePathFromRepositoryPath(relativePath),
    }
  })
}

function getJsonFiles(dir: string, fs: NodeFs, path: NodePath): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) return results
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results.push(...getJsonFiles(filePath, fs, path))
    } else if (file.endsWith('.json')) {
      results.push(filePath)
    }
  }
  return results
}

export async function loadCoursesForContext(context: { academicYearId: string; studyYearId: string; semesterId: string }): Promise<LoadedCourse[]> {
  const { academicYearId, studyYearId, semesterId } = context
  const catalog = await loadCatalog()

  const academicYear = catalog.academicYears.find((y) => y.id === academicYearId)
  const studyYear = academicYear?.studyYears.find((y) => y.id === studyYearId)
  const semester = studyYear?.semesters.find((s) => s.id === semesterId)
  const coursesList = (semester as { courses?: Array<{ id: string; title: string }> })?.courses || []

  if (typeof window !== 'undefined') {
    // Browser environment: fetch from public folder `/data/courses/...`
    const loaded = await Promise.all(
      coursesList.map(async (c) => {
        const response = await fetch(`/data/courses/${academicYearId}/${studyYearId}/${semesterId}/${c.id}.json`)
        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${c.id}`)
        }
        const data = await response.json()
        return {
          ...data,
          path: { academicYearId, studyYearId, semesterId, courseId: c.id },
        } as LoadedCourse
      })
    )
    return loaded
  } else {
    // Node environment: read from public/data/courses/... using fs
    const requireFn = globalThis.nodeRequire
    if (!requireFn) {
      return []
    }
    const fs = requireFn('node:fs') as NodeFs
    const path = requireFn('node:path') as NodePath
    const processObj = (globalThis as unknown as { process: NodeProcess }).process
    const cwd = processObj.cwd()

    const loaded = coursesList.map((c) => {
      const filePath = path.join(cwd, 'public/data/courses', academicYearId, studyYearId, semesterId, `${c.id}.json`)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const data = JSON.parse(fileContent)
      return {
        ...data,
        path: { academicYearId, studyYearId, semesterId, courseId: c.id },
      } as LoadedCourse
    })
    return loaded
  }
}
