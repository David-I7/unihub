package com.unihub.app.dto.community.content.response;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.unihub.app.entities.community.content.NotificationCategory;

import java.time.OffsetDateTime;
import java.util.UUID;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "category",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = EventNotificationResponseDto.class, name = "EVENT"),
        @JsonSubTypes.Type(value = PostNotificationResponseDto.class, name = "POST"),
        @JsonSubTypes.Type(value = SystemNotificationResponseDto.class, name = "SYSTEM")
})
public sealed interface NotificationResponseDto permits
        EventNotificationResponseDto,
        PostNotificationResponseDto,
        SystemNotificationResponseDto {

    UUID id();
    String title();
    String message();
    NotificationCategory category();
    boolean isRead();
    OffsetDateTime createdAt();
}
