package com.unihub.app.repositories.community.resources;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.resources.response.CommunityResponseDto;
import com.unihub.app.entities.community.resources.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommunityRepository extends JpaRepository<Community, UUID> {

    @Query("""
        SELECT c FROM Community c
        JOIN FETCH c.owner
        WHERE c.slug = :slug
    """)
    Optional<Community> findBySlugWithOwner(@Param("slug") String slug);

    @Query("""
        SELECT c FROM Community c
        WHERE c.slug = :slug
    """)
    Optional<Community> findBySlug(@Param("slug") String slug);

    @EntityGraph(attributePaths = {"owner"})
    Page<Community> findAll(Pageable pageable);

//    @EntityGraph(attributePaths = {"owner"})
//    @Query(value = """
//        SELECT c FROM Community c
//        WHERE (COALESCE(:search, '') = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))
//          AND (CAST(:verified AS boolean) IS NULL OR c.verified = :verified)
//          AND (CAST(:joinedUserId AS uuid) IS NULL OR c.id IN (SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.id = :joinedUserId))
//    """, countQuery = """
//        SELECT COUNT(c) FROM Community c
//        WHERE (COALESCE(:search, '') = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))
//          AND (CAST(:verified AS boolean) IS NULL OR c.verified = :verified)
//          AND (CAST(:joinedUserId AS uuid) IS NULL OR c.id IN (SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.id = :joinedUserId))
//    """)
//    Page<Community> findAllWithFilters(
//            @Param("search") String search,
//            @Param("verified") Boolean verified,
//            @Param("joinedUserId") UUID joinedUserId,
//            Pageable pageable
//    );

    @Query(value = """
        SELECT new com.unihub.app.dto.community.resources.response.CommunityResponseDto(
            c.id,
            c.name,
            c.description,
            c.memberCount,
            c.createdAt,
            new com.unihub.app.dto.community.OwnerDto(
                o.id,
                o.username,
                case when o.deletedAt is null then true else false end
            ),
            c.backgroundColor,
            c.verified,
            c.slug,
            case when (CAST(:joinedUserId AS uuid) IS NULL) then false else true end
        ) FROM Community c
        LEFT JOIN c.owner o
        WHERE (COALESCE(:search, '') = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (CAST(:verified AS boolean) IS NULL OR c.verified = :verified)
          AND (CAST(:joinedUserId AS uuid) IS NULL OR c.id IN (SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.id = :joinedUserId))
    """, countQuery = """
        SELECT COUNT(c) FROM Community c
        WHERE (COALESCE(:search, '') = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (CAST(:verified AS boolean) IS NULL OR c.verified = :verified)
          AND (CAST(:joinedUserId AS uuid) IS NULL OR c.id IN (SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.id = :joinedUserId))
    """)
    Page<CommunityResponseDto> findAllWithFilters(
            @Param("search") String search,
            @Param("verified") Boolean verified,
            @Param("joinedUserId") UUID joinedUserId,
            Pageable pageable
    );


    @Query("SELECT c FROM Community c WHERE c.name = :name OR c.slug = :slug")
    List<Community> findByNameOrSlug(@Param("name") String name, @Param("slug") String slug);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    @Modifying
    @Query("UPDATE Community c SET c.memberCount = c.memberCount + :delta WHERE c.id = :id")
    void updateMemberCount(@Param("id") UUID id, @Param("delta") int delta);
}
