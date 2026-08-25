import { useMemo } from "react";
import { Users, Star } from "lucide-react";
import type { Teacher, Course } from "../api/types";

interface StudyYearTeachersRosterProps {
  courses: Course[];
  studyYearName: string;
}

interface TeacherWithCourses extends Teacher {
  courseAbbrs: string[];
}

export function StudyYearTeachersRoster({
  courses,
  studyYearName,
}: StudyYearTeachersRosterProps) {
  const teachers = useMemo(() => {
    const map = new Map<string, TeacherWithCourses>();

    for (const course of courses) {
      if (!course.teachers) continue;
      for (const teacher of course.teachers) {
        if (!map.has(teacher.id)) {
          map.set(teacher.id, {
            ...teacher,
            courseAbbrs: [course.abbreviation],
          });
        } else {
          const existing = map.get(teacher.id)!;
          if (!existing.courseAbbrs.includes(course.abbreviation)) {
            existing.courseAbbrs.push(course.abbreviation);
          }
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.lastName.localeCompare(b.lastName),
    );
  }, [courses]);

  if (teachers.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <span>Faculty & Teachers in {studyYearName}</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Professors and instructors assigned to courses for this academic year.
          </p>
        </div>

        <span className="text-xs font-semibold text-muted-foreground">
          {teachers.length} Instructors
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="flex items-center justify-between rounded-xl border bg-muted/15 p-3.5 hover:border-primary/40 hover:bg-muted/30 transition-all shadow-2xs"
          >
            <div className="space-y-1 min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary text-[11px] font-bold">
                  {teacher.lastName.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-foreground truncate">
                  Prof. {teacher.firstName} {teacher.lastName}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {teacher.courseAbbrs.join(", ")}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
              <Star className="size-3 fill-amber-500 text-amber-500" />
              <span>{teacher.averageRating?.toFixed(1) ?? "5.0"}</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                ({teacher.ratingsCount ?? 0})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
