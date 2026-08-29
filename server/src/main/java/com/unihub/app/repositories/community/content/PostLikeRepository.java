package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.PostLike;
import com.unihub.app.entities.community.content.PostLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;

public interface PostLikeRepository extends JpaRepository<PostLike, PostLikeId> {

    boolean existsByIdPostIdAndIdUserId(UUID postId, UUID userId);

    void deleteByIdPostIdAndIdUserId(UUID postId, UUID userId);

    @Query("SELECT pl.id.postId FROM PostLike pl WHERE pl.id.userId = :userId AND pl.id.postId IN :postIds")
    Set<UUID> findLikedPostIdsByUserIdAndPostIdIn(@Param("userId") UUID userId, @Param("postIds") Collection<UUID> postIds);
}
