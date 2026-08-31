package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.entities.community.resources.CommunityMembersId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommunityMemberRepository extends JpaRepository<CommunityMember, CommunityMembersId> {

    @Query("SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.id = :userId")
    List<UUID> findCommunityIdsByUserId(@Param("userId") UUID userId);

    @Query("SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.id = :userId AND cm.community.id IN :communityIds")
    List<UUID> findEnrolledCommunityIdsByUserIdAndCommunityIdIn(@Param("userId") UUID userId, @Param("communityIds") List<UUID> communityIds);

    @Query("SELECT COUNT(cm) > 0 FROM CommunityMember cm WHERE cm.community.slug = :communitySlug AND cm.user.id = :userId")
    boolean isMemberOfCommunity(@Param("communitySlug") String communitySlug, @Param("userId") UUID userId);

    @Query("SELECT cm FROM CommunityMember cm WHERE cm.community.slug = :communitySlug AND cm.user.id = :userId")
    Optional<CommunityMember> findMemberByCommunitySlug(@Param("communitySlug") String communitySlug, @Param("userId") UUID userId);

    @Query("""
        SELECT cm FROM CommunityMember cm
        JOIN FETCH cm.community c
        WHERE cm.user.id = :userId
    """)
    List<CommunityMember> findMembershipsByUserIdWithCommunity(@Param("userId") UUID userId);

    @Query(value = """
        SELECT cm FROM CommunityMember cm
        JOIN FETCH cm.community c
        WHERE cm.user.id = :userId
    """, countQuery = """
        SELECT COUNT(cm) FROM CommunityMember cm
        WHERE cm.user.id = :userId
    """)
    Page<CommunityMember> findMembershipsByUserIdWithCommunity(@Param("userId") UUID userId, Pageable pageable);

    @Query(value = """
        SELECT cm FROM CommunityMember cm
        JOIN FETCH cm.user u
        WHERE cm.community.slug = :communitySlug
        AND (:roleId IS NULL OR cm.roleId = :roleId)
        AND (COALESCE(:search, '') = '' OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')))
    """, countQuery = """
        SELECT COUNT(cm) FROM CommunityMember cm
        WHERE cm.community.slug = :communitySlug
        AND (:roleId IS NULL OR cm.roleId = :roleId)
        AND (COALESCE(:search, '') = '' OR LOWER(cm.user.username) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<CommunityMember> findMembersByCommunitySlugWithFilters(
            @Param("communitySlug") String communitySlug,
            @Param("search") String search,
            @Param("roleId") UUID roleId,
            Pageable pageable
    );

    @Query("SELECT cm FROM CommunityMember cm WHERE cm.community.id = :communityId AND cm.user.id = :userId")
    Optional<CommunityMember> findByCommunityIdAndUserId(@Param("communityId") UUID communityId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(cm) > 0 FROM CommunityMember cm WHERE cm.community.id = :communityId AND cm.user.id = :userId")
    boolean existsByCommunityIdAndUserId(@Param("communityId") UUID communityId, @Param("userId") UUID userId);

    @Query("SELECT cm.user FROM CommunityMember cm WHERE cm.community.id = :communityId AND cm.user.id != :excludedUserId")
    List<User> findMembersByCommunityIdExcludingUser(@Param("communityId") UUID communityId, @Param("excludedUserId") UUID excludedUserId);
}
