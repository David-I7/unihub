package com.unihub.app.entities.resources;

import jakarta.persistence.Embeddable;

import java.util.UUID;

@Embeddable
public class CommunityMembersId {

    private UUID communityId;

    private UUID userId;
}
