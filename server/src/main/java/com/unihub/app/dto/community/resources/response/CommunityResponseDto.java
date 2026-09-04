package com.unihub.app.dto.community.resources.response;

import com.unihub.app.dto.community.OwnerDto;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommunityResponseDto{
        private UUID id;
        private String name;
        private String description;
        private int memberCount;
        private OffsetDateTime createdAt;
        private OwnerDto owner;
        private String backgroundColor;
        private boolean verified;
        private String slug;
        private boolean isJoined;
}
