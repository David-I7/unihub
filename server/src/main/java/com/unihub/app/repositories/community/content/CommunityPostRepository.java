package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, UUID> {
    List<CommunityPost> findByCommunityId(UUID communityId);
}
