package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.CommunityJoinCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommunityJoinCodeRepository extends JpaRepository<CommunityJoinCode, UUID> {

    @Query("""
        SELECT jc FROM CommunityJoinCode jc
        JOIN FETCH jc.community
        WHERE jc.code = :code
    """)
    Optional<CommunityJoinCode> findByCodeWithCommunity(@Param("code") String code);

    @Query("""
        SELECT jc FROM CommunityJoinCode jc
        JOIN FETCH jc.community
        WHERE jc.community.slug = :communitySlug
        ORDER BY jc.createdAt DESC
    """)
    List<CommunityJoinCode> findByCommunitySlug(@Param("communitySlug") String communitySlug);

    boolean existsByCode(String code);

    @Modifying
    @Query("UPDATE CommunityJoinCode jc SET jc.usesCount = jc.usesCount + 1 WHERE jc.id = :id")
    void incrementUsesCount(@Param("id") UUID id);
}
