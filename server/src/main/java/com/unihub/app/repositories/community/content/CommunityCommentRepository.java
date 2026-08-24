package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.CommunityComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, UUID> {
    List<CommunityComment> findByCommunityPostId(UUID communityPostId);
}
