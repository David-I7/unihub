package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.CommunityComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, UUID> {
    List<CommunityComment> findByCommunityPostId(UUID communityPostId);

    @Query("SELECT cc.communityPost.community.slug FROM CommunityComment cc WHERE cc.id = :commentId")
    Optional<String> findCommunitySlugByCommentId(@Param("commentId") UUID commentId);
}
