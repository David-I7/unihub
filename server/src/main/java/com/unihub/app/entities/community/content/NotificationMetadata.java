package com.unihub.app.entities.community.content;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.util.UUID;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record NotificationMetadata(
        UUID eventId,
        UUID postId,
        UUID commentId
) {
}
