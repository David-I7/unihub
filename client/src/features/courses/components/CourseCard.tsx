import { useNavigate } from "react-router";
import { Archive, User } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/app/UserAvatar";
import { CourseActionMenu } from "./CourseActionMenu";
import type { CourseHome } from "../api/types";

interface CourseCardProps {
  item: CourseHome;
  communitySlug: string;
  studyYearSlug: string;
}

export function CourseCard({
  item,
  communitySlug,
  studyYearSlug,
}: CourseCardProps) {
  const navigate = useNavigate();
  const { course, teachers = [] } = item;
  const isArchived = Boolean(course.archived);
  const primaryTeacher = teachers[0];
  const hasMultipleTeachers = teachers.length > 1;

  const handleCardClick = (e: React.MouseEvent) => {
    // 1. If click did not originate directly from within the Card's own DOM subtree (e.g. from a React portal Dialog/Dropdown)
    if (!e.currentTarget.contains(e.target as Node)) {
      return;
    }

    // 2. If click was on or inside any interactive element or menu
    if (
      (e.target as HTMLElement).closest(
        "button, a, input, textarea, select, [role='button'], [role='menuitem'], [data-slot='dropdown-menu-trigger'], [data-slot='dropdown-menu-content'], [data-slot='dialog-content']",
      )
    ) {
      return;
    }

    navigate(
      `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${course.slug}`,
    );
  };

  return (
    <Card
      onClick={handleCardClick}
      className="group h-full flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/60 hover:shadow-md cursor-pointer hover:-translate-y-0.5 select-none space-y-2"
    >
      {/* Top Row: Course Code + Semester & Credits Badges + 3-dots Menu */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20 tracking-wider uppercase group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
          {course.abbreviation || course.name.substring(0, 3).toUpperCase()}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {isArchived ? (
            <Badge variant="warning" size="xs" className="font-medium gap-1">
              <Archive className="size-3" />
              Archived
            </Badge>
          ) : (
            <Badge variant="secondary" size="xs" className="font-medium">
              Sem {course.semester}
            </Badge>
          )}

          <Badge
            variant="outline"
            size="xs"
            className="font-medium text-muted-foreground"
          >
            {course.creditPoints} ECTS
          </Badge>

          <div onClick={(e) => e.stopPropagation()}>
            <CourseActionMenu
              communitySlug={communitySlug}
              studyYearSlug={studyYearSlug}
              course={course}
              teachers={teachers}
            />
          </div>
        </div>
      </div>

      {/* Middle Body: Title and Description */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {course.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
          {course.description || "No course description provided."}
        </p>
      </div>

      {/* Bottom Footer: Embedded Teaching Faculty */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
        {teachers.length === 0 ? (
          <div className="flex items-center gap-1.5 text-muted-foreground/70 text-[11px] italic">
            <User className="size-3.5" />
            <span>No instructor assigned</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex -space-x-1.5 shrink-0">
              {teachers.slice(0, 2).map((teacher) => (
                <UserAvatar
                  key={teacher.id}
                  username={teacher.lastName || teacher.firstName}
                  size="xs"
                  className="size-6 rounded-lg ring-2 ring-card"
                  fallbackClassName="rounded-lg text-[9px]"
                />
              ))}
              {teachers.length > 2 && (
                <div className="size-6 rounded-lg bg-muted border border-border/80 flex items-center justify-center text-[9px] font-bold text-muted-foreground ring-2 ring-card">
                  +{teachers.length - 2}
                </div>
              )}
            </div>

            <span className="font-medium text-foreground text-xs truncate">
              Prof. {primaryTeacher?.lastName || primaryTeacher?.firstName}
              {hasMultipleTeachers && (
                <span className="text-muted-foreground text-[11px] ml-1">
                  +{teachers.length - 1} more
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
