package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface CommunityRepository extends JpaRepository<Community, UUID> {

    @Query("""
        SELECT c FROM Community c
        JOIN FETCH c.owner
        WHERE c.slug = :slug
    """)
    Optional<Community> findBySlug(String slug);

    @EntityGraph(attributePaths = {"owner"})
    Page<Community> findAll(Pageable pageable);
}
