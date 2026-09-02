package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import org.openapitools.jackson.nullable.JsonNullable;

import java.util.UUID;

@Builder
public record UpdateFolderRequestDto(
        JsonNullable<@NotNull(message = "Folder name cannot be null") @Size(min = 1, max = 100, message = "Folder name must be between 1 and 100 characters") String> name,
        JsonNullable<UUID> parentFolderId,
        JsonNullable<Boolean> moveToRoot
) {
        public UpdateFolderRequestDto(String name, UUID parentFolderId, Boolean moveToRoot) {
                this(
                        name != null ? JsonNullable.of(name) : JsonNullable.undefined(),
                        parentFolderId != null ? JsonNullable.of(parentFolderId) : JsonNullable.undefined(),
                        moveToRoot != null ? JsonNullable.of(moveToRoot) : JsonNullable.undefined()
                );
        }

        public UpdateFolderRequestDto {
                name = name == null ? JsonNullable.undefined() : name.map(String::trim);
                parentFolderId = parentFolderId == null ? JsonNullable.undefined() : parentFolderId;
                moveToRoot = moveToRoot == null ? JsonNullable.undefined() : moveToRoot;
        }

        public static class UpdateFolderRequestDtoBuilder {
                public UpdateFolderRequestDtoBuilder name(String name) {
                        this.name = name != null ? JsonNullable.of(name) : JsonNullable.of(null);
                        return this;
                }

                public UpdateFolderRequestDtoBuilder parentFolderId(UUID parentFolderId) {
                        this.parentFolderId = parentFolderId != null ? JsonNullable.of(parentFolderId) : JsonNullable.of(null);
                        return this;
                }

                public UpdateFolderRequestDtoBuilder moveToRoot(Boolean moveToRoot) {
                        this.moveToRoot = moveToRoot != null ? JsonNullable.of(moveToRoot) : JsonNullable.of(null);
                        return this;
                }
        }
}
