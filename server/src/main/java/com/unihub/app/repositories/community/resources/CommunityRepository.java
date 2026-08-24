package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.Community;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommunityRepository extends JpaRepository<Community, UUID> {

}
