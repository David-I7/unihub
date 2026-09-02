import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/app/UserAvatar";
import { Check, X, User } from "@/components/ui/icons";
import { getErrorMessage } from "@/api/types";
import { useForm } from "@/hooks/useForm";
import { useCommunityTeachers } from "@/features/teachers/api/getCommunityTeachers";
import { useUpdateCourse } from "../api/updateCourse";
import { updateCourseSchema, type UpdateCourseSchemaValues } from "../schemas/courseSchemas";
import type { Course, UpdateCoursePayload } from "../api/types";
import type { Teacher } from "@/features/teachers/api/types";

interface EditCourseModalProps {
  communitySlug: string;
  studyYearSlug: string;
  course: Course;
  initialTeachers?: Teacher[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updated: Course) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function EditCourseForm({
  communitySlug,
  studyYearSlug,
  course,
  initialTeachers = [],
  onClose,
  onSuccess,
}: {
  communitySlug: string;
  studyYearSlug: string;
  course: Course;
  initialTeachers?: Teacher[];
  onClose: () => void;
  onSuccess?: (updated: Course) => void;
}) {
  const navigate = useNavigate();
  const updateMutation = useUpdateCourse();
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(
    () => initialTeachers.map((t) => t.id),
  );

  const { data: teachersData } = useCommunityTeachers(communitySlug, {
    size: 100,
  });
  const allTeachers = useMemo(() => teachersData?.content ?? [], [teachersData]);

  const form = useForm<UpdateCourseSchemaValues>({
    initialValues: {
      name: course.name,
      slug: course.slug,
      abbreviation: course.abbreviation,
      semester: course.semester,
      creditPoints: course.creditPoints,
      description: course.description ?? "",
      teacherIds: initialTeachers.map((t) => t.id),
    },
    schema: updateCourseSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const dirty = form.dirtyFields;
        const payload: UpdateCoursePayload = {};

        if (dirty.name) payload.name = values.name?.trim();
        if (dirty.slug) payload.slug = values.slug?.trim();
        if (dirty.abbreviation)
          payload.abbreviation = values.abbreviation?.trim().toUpperCase();
        if (dirty.semester)
          payload.semester =
            values.semester !== undefined ? Number(values.semester) : undefined;
        if (dirty.creditPoints)
          payload.creditPoints =
            values.creditPoints !== undefined
              ? Number(values.creditPoints)
              : undefined;
        if (dirty.description)
          payload.description = values.description
            ? values.description.trim()
            : "";
        if (dirty.teacherIds) payload.teacherIds = selectedTeacherIds;

        const updated = await updateMutation.mutateAsync({
          communitySlug,
          studyYearSlug,
          courseSlug: course.slug,
          payload,
        });

        toast.success(`Course "${updated.name}" updated successfully!`);
        onSuccess?.(updated);
        onClose();

        // If slug changed and current route contains old slug, navigate to new URL
        if (updated.slug !== course.slug) {
          const currentPath = window.location.pathname;
          if (
            currentPath.includes(
              `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${course.slug}`,
            )
          ) {
            navigate(
              `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${updated.slug}`,
              { replace: true },
            );
          }
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to update course.");
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeacherIds((prev) => {
      const next = prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId];
      form.setValue("teacherIds", next);
      return next;
    });
  };

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4 pt-2">
      {form.serverError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
          {form.serverError}
        </div>
      )}

      {/* Name and Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="name">Course Name *</FieldLabel>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Data Structures & Algorithms"
            value={form.values.name ?? ""}
            onChange={(e) => form.setValue("name", e.target.value)}
            onBlur={form.handleBlur}
            aria-invalid={form.isInvalid("name")}
          />
          <FieldError errors={[{ message: form.errors.name }]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="slug">Slug *</FieldLabel>
          <Input
            id="slug"
            name="slug"
            placeholder="e.g. data-structures-and-algorithms"
            value={form.values.slug ?? ""}
            onChange={(e) => form.setValue("slug", slugify(e.target.value))}
            onBlur={form.handleBlur}
            aria-invalid={form.isInvalid("slug")}
            className="font-mono text-xs"
          />
          <FieldError errors={[{ message: form.errors.slug }]} />
        </Field>
      </div>

      {/* Abbreviation, Semester, Credits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field>
          <FieldLabel htmlFor="abbreviation">Code / Abbr. *</FieldLabel>
          <Input
            id="abbreviation"
            name="abbreviation"
            placeholder="e.g. DSA"
            maxLength={4}
            value={form.values.abbreviation ?? ""}
            onChange={(e) =>
              form.setValue("abbreviation", e.target.value.toUpperCase())
            }
            onBlur={form.handleBlur}
            aria-invalid={form.isInvalid("abbreviation")}
            className="font-mono uppercase text-xs"
          />
          <FieldDescription>2 to 4 characters</FieldDescription>
          <FieldError errors={[{ message: form.errors.abbreviation }]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="semester">Semester *</FieldLabel>
          <div className="grid grid-cols-2 gap-2 h-9">
            <button
              type="button"
              onClick={() => form.setValue("semester", 1)}
              className={`rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                form.values.semester === 1
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card hover:bg-muted border-input text-muted-foreground"
              }`}
            >
              Sem 1
            </button>
            <button
              type="button"
              onClick={() => form.setValue("semester", 2)}
              className={`rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                form.values.semester === 2
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card hover:bg-muted border-input text-muted-foreground"
              }`}
            >
              Sem 2
            </button>
          </div>
          <FieldError errors={[{ message: form.errors.semester }]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="creditPoints">ECTS Credits *</FieldLabel>
          <Input
            id="creditPoints"
            name="creditPoints"
            type="number"
            min={1}
            max={6}
            value={form.values.creditPoints ?? 5}
            onChange={(e) =>
              form.setValue(
                "creditPoints",
                e.target.value ? parseInt(e.target.value, 10) : 1,
              )
            }
            onBlur={form.handleBlur}
            aria-invalid={form.isInvalid("creditPoints")}
          />
          <FieldDescription>1 to 6 ECTS</FieldDescription>
          <FieldError errors={[{ message: form.errors.creditPoints }]} />
        </Field>
      </div>

      {/* Description */}
      <Field>
        <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
        <Textarea
          id="description"
          name="description"
          placeholder="A brief overview of topics covered in this course..."
          rows={3}
          value={form.values.description ?? ""}
          onChange={(e) => form.setValue("description", e.target.value)}
          onBlur={form.handleBlur}
          aria-invalid={form.isInvalid("description")}
          maxLength={1000}
        />
        <FieldError errors={[{ message: form.errors.description }]} />
      </Field>

      {/* Teachers Multi-select */}
      <div className="space-y-2">
        <FieldLabel>Assigned Instructors (Optional)</FieldLabel>
        {allTeachers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            No instructors registered in this community yet.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="max-h-36 overflow-y-auto rounded-xl border border-border/80 p-2 space-y-1 bg-muted/20">
              {allTeachers.map((teacher) => {
                const isSelected = selectedTeacherIds.includes(teacher.id);
                return (
                  <div
                    key={teacher.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTeacher(teacher.id);
                    }}
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 border border-primary/30 text-primary font-medium"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <UserAvatar
                        username={teacher.lastName || teacher.firstName}
                        size="xs"
                        className="size-5 rounded-md"
                      />
                      <span className="truncate">
                        Prof. {teacher.firstName} {teacher.lastName}
                      </span>
                    </div>
                    {isSelected ? (
                      <Check className="size-3.5 text-primary shrink-0" />
                    ) : (
                      <User className="size-3.5 text-muted-foreground/50 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {selectedTeacherIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedTeacherIds.map((id) => {
                  const teacher = allTeachers.find((t) => t.id === id);
                  if (!teacher) return null;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      size="xs"
                      className="gap-1 text-[11px] font-medium pr-1"
                    >
                      <span>Prof. {teacher.lastName}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTeacher(id);
                        }}
                        className="hover:text-destructive cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="pt-3 border-t border-border/60">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            form.isSubmitting || updateMutation.isPending || !form.isDirty
          }
          className="font-bold cursor-pointer"
        >
          {form.isSubmitting || updateMutation.isPending
            ? "Saving Changes..."
            : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditCourseModal({
  communitySlug,
  studyYearSlug,
  course,
  initialTeachers,
  open,
  onOpenChange,
  onSuccess,
}: EditCourseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update course settings and instructor assignments.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <EditCourseForm
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            course={course}
            initialTeachers={initialTeachers}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
