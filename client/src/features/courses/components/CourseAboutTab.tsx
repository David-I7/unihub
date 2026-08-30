import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Star, Award, Archive, Calendar, Info, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import type { Teacher } from "@/features/teachers";
import type { CourseTeachers } from "@/features/courses";

export function CourseAboutTab({ course, teachers = [] }: CourseTeachers) {
  const hasReadme = Boolean(course.readme && course.readme.trim().length > 0);

  return (
    <div className="max-w-4xl space-y-6 py-2">
      {/* Top Section: Course Details & Metadata */}
      <div className="space-y-6">
        {/* Title & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
              {course.abbreviation}
            </span>

            <Badge variant="outline" className="text-xs font-semibold gap-1">
              <Calendar className="size-3.5" />
              <span>Semester {course.semester}</span>
            </Badge>

            <Badge variant="secondary" className="text-xs font-semibold gap-1">
              <Award className="size-3.5" />
              <span>{course.creditPoints} ECTS</span>
            </Badge>

            {course.archived && (
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold gap-1"
              >
                <Archive className="size-3" />
                Archived
              </Badge>
            )}
          </div>
        </div>

        {/* Brief Description Callout */}
        {course.description && (
          <Card className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Info className="size-4" />
              <span>Course Overview</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed font-normal">
              {course.description}
            </p>
          </Card>
        )}

        {/* Professors & Faculty Section */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Course Faculty & Instructors
          </h2>

          {teachers.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No instructor assigned yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-4 pt-1">
              {teachers.map((teacher: Teacher) => {
                const initials = getInitials(
                  teacher.lastName || teacher.firstName,
                  "PR",
                );

                return (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="size-8 rounded-full border border-border/80">
                      <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground leading-none">
                        Prof. {teacher.firstName} {teacher.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground leading-none">
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="size-3 fill-amber-500 text-amber-500" />
                          {teacher.averageRating?.toFixed(1) ?? "5.0"}
                        </span>
                        <span>•</span>
                        <span>{teacher.ratingsCount ?? 0} reviews</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-border/60" />

      {/* Bottom Section: Markdown Readme / Syllabus */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileText className="size-3.5" />
          <span>Curriculum & Syllabus Readme</span>
        </h2>

        {hasReadme ? (
          <Card className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs">
            <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-sm md:text-base">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground mt-8 mb-4 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-heading text-xl font-bold tracking-tight text-foreground mt-6 mb-3 pb-1 border-b border-border/40">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-heading text-lg font-semibold text-foreground mt-5 mb-2">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="font-heading text-base font-semibold text-foreground mt-4 mb-2">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm sm:text-base leading-relaxed text-foreground/90 my-3">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside pl-6 space-y-1.5 text-sm sm:text-base text-foreground/90 my-3">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside pl-6 space-y-1.5 text-sm sm:text-base text-foreground/90 my-3">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/60 bg-muted/30 px-4 py-2 my-4 italic text-muted-foreground rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  code: ({ className, children }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary font-medium">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="block rounded-xl bg-muted/60 p-4 border border-border/60 font-mono text-xs overflow-x-auto text-foreground my-4 leading-relaxed">
                        {children}
                      </code>
                    );
                  },
                  table: ({ children }) => (
                    <div className="my-6 w-full overflow-x-auto rounded-xl border border-border shadow-2xs">
                      <table className="w-full text-left text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted/60 border-b border-border font-bold text-foreground">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-border/60">{children}</tbody>
                  ),
                  tr: ({ children }) => <tr>{children}</tr>,
                  th: ({ children }) => (
                    <th className="px-4 py-2.5 font-semibold text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2.5 text-foreground/90">{children}</td>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium"
                    >
                      {children}
                    </a>
                  ),
                  hr: () => <hr className="my-6 border-border/60" />,
                  strong: ({ children }) => (
                    <strong className="font-bold text-foreground">
                      {children}
                    </strong>
                  ),
                }}
              >
                {course.readme}
              </ReactMarkdown>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-2">
            <p className="text-xs text-muted-foreground italic">
              No additional curriculum readme has been published for this course yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

