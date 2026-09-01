import { useState, useMemo } from "react";
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
import { useCreateCourse } from "../api/createCourse";
import { createCourseSchema, type CreateCourseSchemaValues } from "../schemas/courseSchemas";
import type { Course } from "../api/types";

interface CreateCourseModalProps {
  communitySlug: string;
  studyYearSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (created: Course) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CreateCourseForm({
  communitySlug,
  studyYearSlug,
  onClose,
  onSuccess,
}: {
  communitySlug: string;
  studyYearSlug: string;
  onClose: () => void;
  onSuccess?: (created: Course) => void;
}) {
  const createMutation = useCreateCourse();
  const [slugTouchedManually, setSlugTouchedManually] = useState(false);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  const { data: teachersData } = useCommunityTeachers(communitySlug, {
    size: 100,
  });
  const teachers = useMemo(() => teachersData?.content ?? [], [teachersData]);

  const form = useForm<CreateCourseSchemaValues>({
    initialValues: {
      name: "",
      slug: "",
      abbreviation: "",
      semester: 1,
      creditPoints: 5,
      description: "",
      teacherIds: [],
    },
    schema: createCourseSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const created = await createMutation.mutateAsync({
          communitySlug,
          studyYearSlug,
          payload: {
            name: values.name.trim(),
            slug: values.slug.trim(),
            abbreviation: values.abbreviation.trim().toUpperCase(),
            semester: Number(values.semester),
            creditPoints: Number(values.creditPoints ?? 5),
            description: values.description?.trim() || undefined,
            teacherIds: selectedTeacherIds.length > 0 ? selectedTeacherIds : undefined,
          },
        });

        toast.success(`Course "${created.name}" created successfully!`);
        onSuccess?.(created);
        onClose();
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to create course.");
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextName = e.target.value;
    form.setValue("name", nextName);
    if (!slugTouchedManually) {
      form.setValue("slug", slugify(nextName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouchedManually(true);
    form.setValue("slug", slugify(e.target.value));
  };

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
            value={form.values.name}
            onChange={handleNameChange}
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
            value={form.values.slug}
            onChange={handleSlugChange}
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
            value={form.values.abbreviation}
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
        {teachers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            No instructors registered in this community yet.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="max-h-36 overflow-y-auto rounded-xl border border-border/80 p-2 space-y-1 bg-muted/20">
              {teachers.map((teacher) => {
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
                  const teacher = teachers.find((t) => t.id === id);
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
          disabled={form.isSubmitting || createMutation.isPending}
          className="font-bold cursor-pointer"
        >
          {form.isSubmitting || createMutation.isPending
            ? "Creating..."
            : "Create Course"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateCourseModal({
  communitySlug,
  studyYearSlug,
  open,
  onOpenChange,
  onSuccess,
}: CreateCourseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
          <DialogDescription>
            Add a new curriculum course to this study year.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <CreateCourseForm
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
