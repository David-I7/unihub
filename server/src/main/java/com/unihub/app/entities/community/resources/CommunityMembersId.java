package com.unihub.app.entities.community.resources;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CommunityMembersId implements Serializable {

    private UUID communityId;

    private UUID userId;
}
