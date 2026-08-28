package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("SELECT c.id, c.slug,c.name FROM Community c WHERE c.name = :name OR c.slug = :slug")
    List<Community> findByNameOrSlug(String name, String slug);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    boolean existsByOwnerId(UUID ownerId);

    @Modifying
    @Query("UPDATE Community c SET c.memberCount = c.memberCount + :delta WHERE c.id = :id")
    void updateMemberCount(@Param("id") UUID id, @Param("delta") int delta);
}
