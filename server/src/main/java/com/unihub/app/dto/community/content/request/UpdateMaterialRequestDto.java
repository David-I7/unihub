package com.unihub.app.dto.community.content.request;

import com.unihub.app.entities.community.content.MaterialLinkType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import org.openapitools.jackson.nullable.JsonNullable;

import java.util.UUID;

@Builder
public record UpdateMaterialRequestDto(
        JsonNullable<@NotNull(message = "Title cannot be null") @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters") String> title,
        JsonNullable<@Size(max = 2000, message = "Description must not exceed 2000 characters") String> description,
        JsonNullable<UUID> folderId,
        JsonNullable<Boolean> moveToRoot,
        JsonNullable<String> url,
        JsonNullable<MaterialLinkType> linkType
) {
        public UpdateMaterialRequestDto(String title, String description, UUID folderId, Boolean moveToRoot, String url, MaterialLinkType linkType) {
                this(
                        title != null ? JsonNullable.of(title) : JsonNullable.undefined(),
                        description != null ? JsonNullable.of(description) : JsonNullable.undefined(),
                        folderId != null ? JsonNullable.of(folderId) : JsonNullable.undefined(),
                        moveToRoot != null ? JsonNullable.of(moveToRoot) : JsonNullable.undefined(),
                        url != null ? JsonNullable.of(url) : JsonNullable.undefined(),
                        linkType != null ? JsonNullable.of(linkType) : JsonNullable.undefined()
                );
        }

        public UpdateMaterialRequestDto {
                title = title == null ? JsonNullable.undefined() : title.map(String::trim);
                description = description == null ? JsonNullable.undefined() : description.map(String::trim);
                folderId = folderId == null ? JsonNullable.undefined() : folderId;
                moveToRoot = moveToRoot == null ? JsonNullable.undefined() : moveToRoot;
                url = url == null ? JsonNullable.undefined() : url.map(String::trim);
                linkType = linkType == null ? JsonNullable.undefined() : linkType;
        }

        public static class UpdateMaterialRequestDtoBuilder {
                public UpdateMaterialRequestDtoBuilder title(String title) {
                        this.title = title != null ? JsonNullable.of(title) : JsonNullable.of(null);
                        return this;
                }

                public UpdateMaterialRequestDtoBuilder description(String description) {
                        this.description = description != null ? JsonNullable.of(description) : JsonNullable.of(null);
                        return this;
                }

                public UpdateMaterialRequestDtoBuilder folderId(UUID folderId) {
                        this.folderId = folderId != null ? JsonNullable.of(folderId) : JsonNullable.of(null);
                        return this;
                }

                public UpdateMaterialRequestDtoBuilder moveToRoot(Boolean moveToRoot) {
                        this.moveToRoot = moveToRoot != null ? JsonNullable.of(moveToRoot) : JsonNullable.of(null);
                        return this;
                }

                public UpdateMaterialRequestDtoBuilder url(String url) {
                        this.url = url != null ? JsonNullable.of(url) : JsonNullable.of(null);
                        return this;
                }

                public UpdateMaterialRequestDtoBuilder linkType(MaterialLinkType linkType) {
                        this.linkType = linkType != null ? JsonNullable.of(linkType) : JsonNullable.of(null);
                        return this;
                }
        }
}
