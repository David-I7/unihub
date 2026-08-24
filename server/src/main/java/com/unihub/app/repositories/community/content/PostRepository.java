package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {
}
