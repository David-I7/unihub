import { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { CalendarPage } from "@/pages/CalendarPage";
import { ContributePage } from "@/pages/ContributePage";
import { CourseDetailPage } from "@/pages/CourseDetailPage";
import { HomePage } from "@/pages/HomePage";
import {
  buildHierarchy,
  loadCatalog,
  loadCoursesForContext,
  type Catalog,
  type LoadedCourse,
} from "@/domain";
import { usePersistentContext } from "./academicContext";

export function AppLayout() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadCatalog()
      .then((data) => {
        if (active) setCatalog(data);
      })
      .catch(() => {
        if (active) setCatalogError("Failed to load catalog data.");
      });
    return () => {
      active = false;
    };
  }, []);

  if (catalogError) {
    return (
      <div className="flex h-svh items-center justify-center font-semibold text-[var(--validation-err-border)]">
        <p className="m-0">{catalogError}</p>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--primary)]"></div>
        <p className="m-0">Loading catalog data...</p>
      </div>
    );
  }

  return <LoadedAppLayout catalog={catalog} />;
}

function LoadedAppLayout({ catalog }: { catalog: Catalog }) {
  const [context, setContext] = usePersistentContext(catalog);
  const hierarchy = buildHierarchy(catalog, []);
  const [loadedCourses, setLoadedCourses] = useState<LoadedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { academicYearId, studyYearId, semesterId } = context;

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setIsLoading(true);
        setLoadError(null);
      }
    });

    loadCoursesForContext({ academicYearId, studyYearId, semesterId })
      .then((data) => {
        if (active) {
          setLoadedCourses(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError("Failed to load course data.");
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [academicYearId, studyYearId, semesterId]);

  return (
    <HashRouter>
      <div className="grid min-h-svh grid-cols-[76px_1fr] bg-[var(--bg-app)] text-[var(--text-main)] transition-colors max-[820px]:block max-[820px]:max-w-screen max-[820px]:overflow-x-hidden max-[820px]:pb-16">
        <Navigation />
        <main className="min-w-0 max-[820px]:max-w-screen max-[820px]:overflow-x-hidden">
          {isLoading ? (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--primary)]"></div>
              <p className="m-0">Loading course data...</p>
            </div>
          ) : loadError ? (
            <div className="flex h-[50vh] items-center justify-center font-semibold text-[var(--validation-err-border)]">
              <p className="m-0">{loadError}</p>
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    context={context}
                    onContextChange={setContext}
                    loadedCourses={loadedCourses}
                    hierarchy={hierarchy}
                  />
                }
              />
              <Route
                path="/calendar"
                element={
                  <CalendarPage
                    context={context}
                    onContextChange={setContext}
                    loadedCourses={loadedCourses}
                    hierarchy={hierarchy}
                  />
                }
              />
              <Route
                path="/contribute"
                element={
                  <ContributePage
                    context={context}
                    onContextChange={setContext}
                    loadedCourses={loadedCourses}
                    catalog={catalog}
                    hierarchy={hierarchy}
                  />
                }
              />
              <Route
                path="/courses/:academicYearId/:studyYearId/:semesterId/:courseId"
                element={
                  <CourseDetailPage
                    loadedCourses={loadedCourses}
                    catalog={catalog}
                  />
                }
              />
            </Routes>
          )}
        </main>
      </div>
    </HashRouter>
  );
}
