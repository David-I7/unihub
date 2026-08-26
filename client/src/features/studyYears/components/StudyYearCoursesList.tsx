import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Search, BookOpen, Star, Archive, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Course } from "../api/types";

type CourseTabFilter = "all" | "sem-1" | "sem-2" | "archived";

interface StudyYearCoursesListProps {
  courses: Course[];
  communitySlug: string;
  studyYearSlug: string;
}

export function StudyYearCoursesList({
  courses,
  communitySlug,
  studyYearSlug,
}: StudyYearCoursesListProps) {
  const [activeTab, setActiveTab] = useState<CourseTabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activeCourses = useMemo(
    () => courses.filter((c) => !c.archived),
    [courses],
  );
  const archivedCourses = useMemo(
    () => courses.filter((c) => c.archived),
    [courses],
  );
  const sem1Courses = useMemo(
    () => activeCourses.filter((c) => c.semester === 1),
    [activeCourses],
  );
  const sem2Courses = useMemo(
    () => activeCourses.filter((c) => c.semester === 2),
    [activeCourses],
  );

  const currentTabCourses = useMemo(() => {
    switch (activeTab) {
      case "sem-1":
        return sem1Courses;
      case "sem-2":
        return sem2Courses;
      case "archived":
        return archivedCourses;
      case "all":
      default:
        return activeCourses;
    }
  }, [activeTab, sem1Courses, sem2Courses, archivedCourses, activeCourses]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currentTabCourses;

    return currentTabCourses.filter(
      (course) =>
        course.name.toLowerCase().includes(q) ||
        course.abbreviation.toLowerCase().includes(q) ||
        (course.teachers &&
          course.teachers.some(
            (t) =>
              t.firstName.toLowerCase().includes(q) ||
              t.lastName.toLowerCase().includes(q),
          )),
    );
  }, [currentTabCourses, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Horizontally Scrolling Tabs Bar */}
      <div className="w-full overflow-x-auto no-scrollbar min-w-0">
        <div className="inline-flex min-w-full sm:grid sm:grid-cols-4 gap-1 p-1 bg-muted/60 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`h-8 shrink-0 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out cursor-pointer hover:text-foreground hover:bg-background/40 ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <span>All Courses</span>
            <span className="text-[11px] opacity-75 font-mono">
              ({activeCourses.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sem-1")}
            className={`h-8 shrink-0 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out cursor-pointer hover:text-foreground hover:bg-background/40 ${
              activeTab === "sem-1"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <span>Semester 1</span>
            <span className="text-[11px] opacity-75 font-mono">
              ({sem1Courses.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sem-2")}
            className={`h-8 shrink-0 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out cursor-pointer hover:text-foreground hover:bg-background/40 ${
              activeTab === "sem-2"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <span>Semester 2</span>
            <span className="text-[11px] opacity-75 font-mono">
              ({sem2Courses.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("archived")}
            className={`h-8 shrink-0 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out cursor-pointer hover:text-foreground hover:bg-background/40 ${
              activeTab === "archived"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <Archive className="size-3 text-amber-500" />
            <span>Archived</span>
            <span className="text-[11px] opacity-75 font-mono">
              ({archivedCourses.length})
            </span>
          </button>
        </div>
      </div>

      {/* Full-width Search Bar Underneath Tabs */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search courses by name, abbreviation, or instructor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 text-xs rounded-xl h-10 bg-card w-full shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            {activeTab === "archived" ? (
              <Archive className="size-6 text-amber-500" />
            ) : (
              <BookOpen className="size-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              {activeTab === "archived"
                ? "No Archived Courses"
                : "No Courses Found"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchQuery
                ? `No courses matching "${searchQuery}" in this view.`
                : activeTab === "archived"
                  ? "There are no archived courses for this study year."
                  : "There are no active courses listed for this semester."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const primaryTeacher = course.teachers?.[0];
            const courseUrl = `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${course.slug}`;

            return (
              <Link
                key={course.id}
                to={courseUrl}
                className="group block no-underline"
              >
                <Card className="h-full relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-xs hover:shadow-md hover:border-primary/60 transition-all space-y-4 cursor-pointer">
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {course.abbreviation}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium"
                        >
                          Semester {course.semester}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {course.archived && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold gap-1"
                          >
                            <Archive className="size-3" />
                            Archived
                          </Badge>
                        )}
                        <span className="text-xs font-semibold text-muted-foreground">
                          {course.creditPoints} ECTS
                        </span>
                      </div>
                    </div>

                    {/* Course Title */}
                    <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {course.name}
                    </h3>

                    {/* Course Description */}
                    {course.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 italic">
                        Standard curriculum course syllabus and materials.
                      </p>
                    )}
                  </div>

                  {/* Footer with Instructor */}
                  <div className="pt-4 border-t flex items-center justify-between text-xs">
                    {primaryTeacher ? (
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                          {primaryTeacher.lastName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground truncate">
                          Prof. {primaryTeacher.lastName}
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                          <Star className="size-3 fill-amber-500 text-amber-500" />
                          {primaryTeacher.averageRating?.toFixed(1) ?? "5.0"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">
                        Instructor TBD
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
