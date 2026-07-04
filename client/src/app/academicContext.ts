import { useEffect, useState } from 'react'
import { parseCourseRoute, type Catalog, type CourseContext } from '@/domain'

export type ContextSelection = CourseContext

export function defaultContextFromCatalog(catalog: Catalog): ContextSelection {
  const academicYear = catalog.academicYears[0]
  const studyYear = academicYear.studyYears[0]
  const semester = studyYear.semesters[0]
  return {
    academicYearId: academicYear.id,
    studyYearId: studyYear.id,
    semesterId: semester.id,
  }
}

export function usePersistentContext(catalog: Catalog) {
  const defaultContext = defaultContextFromCatalog(catalog)
  const [context, setContext] = useState<ContextSelection>(() => {
    const routePath = parseCourseRoute(window.location.hash)
    if (routePath) {
      return {
        academicYearId: routePath.academicYearId,
        studyYearId: routePath.studyYearId,
        semesterId: routePath.semesterId,
      }
    }
    const saved = localStorage.getItem('unihub-context')
    return saved ? { ...defaultContext, ...JSON.parse(saved) } : defaultContext
  })

  function updateContext(nextContext: ContextSelection) {
    setContext(nextContext)
    localStorage.setItem('unihub-context', JSON.stringify(nextContext))
  }

  useEffect(() => {
    const handleHashChange = () => {
      const routePath = parseCourseRoute(window.location.hash)
      if (routePath) {
        updateContext({
          academicYearId: routePath.academicYearId,
          studyYearId: routePath.studyYearId,
          semesterId: routePath.semesterId,
        })
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return [context, updateContext] as const
}

export function useTheme() {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(() => {
    const saved = localStorage.getItem('unihub-theme')
    return (saved as 'system' | 'light' | 'dark') || 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    localStorage.setItem('unihub-theme', theme)
  }, [theme])

  return [theme, setTheme] as const
}
