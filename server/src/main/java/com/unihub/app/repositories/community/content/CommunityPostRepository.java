package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.CommunityPost;
import com.unihub.app.entities.community.content.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, UUID> {
    List<CommunityPost> findByCommunityId(UUID communityId);

    @Query(value = """
        SELECT cp.post FROM CommunityPost cp
        JOIN cp.post p
        JOIN FETCH p.owner
        WHERE cp.community.id = :communityId
        ORDER BY p.pinned DESC, p.createdAt DESC
    """,
    countQuery = """
        SELECT COUNT(cp) FROM CommunityPost cp
        WHERE cp.community.id = :communityId
    """)
    Page<Post> findPostsByCommunityId(@Param("communityId") UUID communityId, Pageable pageable);

    @Query("SELECT cp.community.slug FROM CommunityPost cp WHERE cp.post.id = :postId")
    java.util.Optional<String> findCommunitySlugByPostId(@Param("postId") UUID postId);
}
