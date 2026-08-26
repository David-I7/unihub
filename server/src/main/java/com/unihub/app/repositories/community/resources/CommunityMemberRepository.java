package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.entities.community.resources.CommunityMembersId;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CommunityMemberRepository extends JpaRepository<CommunityMember, CommunityMembersId> {

    @Query("SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.id = :userId")
    List<UUID> findCommunityIdsByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(cm) > 0 FROM CommunityMember cm WHERE cm.community.slug = :communitySlug AND cm.user.id = :userId")
    boolean isMemberOfCommunity(@Param("communitySlug") String communitySlug, @Param("userId") UUID userId);
}

