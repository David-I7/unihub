package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import org.openapitools.jackson.nullable.JsonNullable;

import java.util.List;
import java.util.UUID;

@Builder
public record UpdateCourseRequestDto(
        JsonNullable<@NotNull(message = "Course name cannot be null") @Size(min = 2, max = 100, message = "Course name must be between 2 and 100 characters") String> name,

        JsonNullable<@NotNull(message = "Slug cannot be null") @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must contain only lowercase alphanumeric characters and hyphens")
        @Size(min = 2, max = 100, message = "Slug must be between 2 and 100 characters") String> slug,

        JsonNullable<@NotNull(message = "Abbreviation cannot be null") @Size(min = 2, max = 4, message = "Abbreviation must be between 2 and 4 characters") String> abbreviation,

        JsonNullable<@NotNull(message = "Semester cannot be null") @Min(value = 1, message = "Semester must be either 1 or 2")
        @Max(value = 2, message = "Semester must be either 1 or 2") Integer> semester,

        JsonNullable<@NotNull(message = "Credit points cannot be null") @Min(value = 1, message = "Credit points must be at least 1")
        @Max(value = 6, message = "Credit points cannot exceed 6") Integer> creditPoints,

        JsonNullable<@Size(max = 1000, message = "Description must not exceed 1000 characters") String> description,

        JsonNullable<@Size(max = 50000, message = "Readme must not exceed 50000 characters") String> readme,

        JsonNullable<@NotNull(message = "Archived cannot be null") Boolean> archived,

        JsonNullable<List<UUID>> teacherIds
) {
    public UpdateCourseRequestDto {
        name = name == null ? JsonNullable.undefined() : name.map(String::trim);
        slug = slug == null ? JsonNullable.undefined() : slug.map(String::trim);
        abbreviation = abbreviation == null ? JsonNullable.undefined() : abbreviation.map(String::trim);
        semester = semester == null ? JsonNullable.undefined() : semester;
        creditPoints = creditPoints == null ? JsonNullable.undefined() : creditPoints;
        description = description == null ? JsonNullable.undefined() : description.map(String::trim);
        readme = readme == null ? JsonNullable.undefined() : readme.map(String::trim);
        archived = archived == null ? JsonNullable.undefined() : archived;
        teacherIds = teacherIds == null ? JsonNullable.undefined() : teacherIds;
    }

    public static class UpdateCourseRequestDtoBuilder {
        public UpdateCourseRequestDtoBuilder name(String name) {
            this.name = name != null ? JsonNullable.of(name) : JsonNullable.of(null);
            return this;
        }

        public UpdateCourseRequestDtoBuilder slug(String slug) {
            this.slug = slug != null ? JsonNullable.of(slug) : JsonNullable.of(null);
            return this;
        }

        public UpdateCourseRequestDtoBuilder abbreviation(String abbreviation) {
            this.abbreviation = abbreviation != null ? JsonNullable.of(abbreviation) : JsonNullable.of(null);
            return this;
        }

        public UpdateCourseRequestDtoBuilder semester(Integer semester) {
            this.semester = semester != null ? JsonNullable.of(semester) : JsonNullable.of(null);
            return this;
        }

        public UpdateCourseRequestDtoBuilder creditPoints(Integer creditPoints) {
            this.creditPoints = creditPoints != null ? JsonNullable.of(creditPoints) : JsonNullable.of(null);
            return this;
        }

        public UpdateCourseRequestDtoBuilder description(String description) {
            this.description = description != null ? JsonNullable.of(description) : JsonNullable.of(null);
            return this;
        }

        public UpdateCourseRequestDtoBuilder readme(String readme) {
            this.readme = readme != null ? JsonNullable.of(readme) : JsonNullable.of(null);
            return this;
        }

        public UpdateCourseRequestDtoBuilder archived(Boolean archived) {
            this.archived = archived != null ? JsonNullable.of(archived) : JsonNullable.of(null);
            return this;
        }

        public UpdateCourseRequestDtoBuilder teacherIds(List<UUID> teacherIds) {
            this.teacherIds = teacherIds != null ? JsonNullable.of(teacherIds) : JsonNullable.of(null);
            return this;
        }
    }
}
